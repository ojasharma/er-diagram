// lib/parseSqlToChen.ts
import { Node, Edge } from 'reactflow';

export interface ChenGraph {
  nodes: Node[];
  edges: Edge[];
}

interface TableData {
  pks: Set<string>;
  fks: Map<string, { toTable: string, toCol: string }>;
  columns: Array<{ colName: string, colType: string }>;
  uniqueCols: Set<string>;
}

export function parseSqlToChen(sql: string): ChenGraph {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const tablesData = new Map<string, TableData>();
  
  const tableRegex = /CREATE TABLE (\w+) \(([\s\S]*?)\);/g;
  const columnRegex = /^\s*(\w+) (\w+.*)/;
  const pkRegex = /PRIMARY KEY \((.*?)\)/;
  const fkRegex = /FOREIGN KEY \((.*?)\) REFERENCES (\w+)\((.*?)\)/;
  const uniqueRegex = /UNIQUE \((.*?)\)/; 

  let tableMatch;

  // --- PASS 1: GATHER ALL DATA ---
  while ((tableMatch = tableRegex.exec(sql)) !== null) {
    const tableName = tableMatch[1];
    const columnsString = tableMatch[2];
    const lines = columnsString.split('\n');

    const pks = new Set<string>();
    const fks = new Map<string, { toTable: string, toCol: string }>();
    const columns: Array<{ colName: string, colType: string }> = [];
    const uniqueCols = new Set<string>(); 

    lines.forEach(line => {
      line = line.trim().replace(/,$/, '');
      const pkMatch = line.match(pkRegex);
      const fkMatch = line.match(fkRegex);
      const colMatch = line.match(columnRegex);
      const uniqueMatch = line.match(uniqueRegex); 

      if (pkMatch) {
        pkMatch[1].split(',').forEach(pk => pks.add(pk.trim()));
      } else if (fkMatch) {
        const fromCol = fkMatch[1].trim();
        fks.set(fromCol, {
          toTable: fkMatch[2].trim(),
          toCol: fkMatch[3].trim(),
        });
      } else if (uniqueMatch) { 
        uniqueMatch[1].split(',').forEach(col => uniqueCols.add(col.trim()));
      } else if (colMatch) {
        const colName = colMatch[1];
        let colType = colMatch[2];
        if (colType.match(/PRIMARY KEY/i)) pks.add(colName);
        if (colType.match(/UNIQUE/i)) uniqueCols.add(colName); 
        colType = colType.replace(/PRIMARY KEY/i, "").replace(/UNIQUE/i, "").trim();
        columns.push({ colName, colType });
      }
    });
    tablesData.set(tableName, { pks, fks, columns, uniqueCols });
  }

  // --- PASS 2: CLASSIFY & CREATE NODES ---

  type TableType = 'strong' | 'weak' | 'multivalued' | 'junction';
  const tableTypes = new Map<string, TableType>();
  const junctionTables: Array<{ name: string, fks: Map<string, { toTable: string, toCol: string }>}> = [];

  // --- [FIXED] Phase 2a: Classify all tables ---
  // Re-ordered to check for junction tables FIRST.
  for (const [tableName, data] of tablesData.entries()) {
    const { pks, fks, columns } = data;
    
    const dataColumns = columns.filter(col => 
      !pks.has(col.colName) && !fks.has(col.colName)
    );

    // FIX: Check for junction table properties FIRST
    const isJunctionTable = (fks.size >= 2) && (dataColumns.length === 0);

    let isWeakEntity = false;
    if (!isJunctionTable) { // Only check for weak entity if it's NOT a junction table
      for (const pkCol of pks) {
        if (fks.has(pkCol)) {
          isWeakEntity = true;
          break;
        }
      }
    }

    // FIX: Re-ordered classification
    if (isJunctionTable) {
      tableTypes.set(tableName, 'junction');
      junctionTables.push({ name: tableName, fks: data.fks });
    } else if (isWeakEntity) {
      if (dataColumns.length === 0) {
        // This is for multivalued attributes (e.g. StudentPhone table)
        tableTypes.set(tableName, 'multivalued');
      } else {
        tableTypes.set(tableName, 'weak');
      }
    } else {
      tableTypes.set(tableName, 'strong');
    }
  }
  // --- End of Fix ---

  // Phase 2b: Create Entity & Attribute nodes
  for (const [tableName, data] of tablesData.entries()) {
    const type = tableTypes.get(tableName)!; 
    
    if (type === 'multivalued' || type === 'junction') {
      continue; 
    }

    const { pks, fks, columns } = data;
    nodes.push({
      id: tableName,
      type: type === 'weak' ? 'weakEntityNode' : 'entityNode',
      data: { label: tableName },
      position: { x: 0, y: 0 },
    });

    columns.forEach(({ colName }) => {
      if (fks.has(colName)) return;
      
      const isKey = pks.has(colName) && type === 'strong';
      const isPartialKey = type === 'weak' && pks.has(colName); 
      const attrId = `${tableName}-${colName}`;
      
      nodes.push({
        id: attrId,
        type: 'attributeNode',
        data: { label: colName, isKey, isPartialKey },
        position: { x: 0, y: 0 },
      });
      edges.push({ id: `e-${tableName}-${attrId}`, source: tableName, target: attrId });
    });
  }

  // Phase 2c: Create 1:1 and 1:N Relationship nodes
  for (const [tableName, data] of tablesData.entries()) {
    const type = tableTypes.get(tableName)!;
    if (type === 'multivalued' || type === 'junction') continue;

    const { fks, uniqueCols } = data;
    
    for (const [fromCol, fkInfo] of fks.entries()) {
      const { toTable, toCol } = fkInfo;
      const targetType = tableTypes.get(toTable);
      if (targetType === 'multivalued' || targetType === 'junction') continue;
      
      const isIdentifyingRel = type === 'weak' && data.pks.has(fromCol);
      const relId = `rel-${tableName}-${toTable}-${fromCol}`;
      const relLabel = `${fromCol} -> ${toCol}`;
      
      nodes.push({
        id: relId,
        type: isIdentifyingRel ? 'identifyingRelationshipNode' : 'relationshipNode',
        data: { label: relLabel },
        position: { x: 0, y: 0 },
      });

      const isOneToOne = uniqueCols.has(fromCol);
      const fromLabel = isOneToOne ? '1' : 'N';
      const toLabel = '1';

      edges.push({ id: `e-${tableName}-${relId}`, source: tableName, target: relId, label: fromLabel, animated: true });
      edges.push({ id: `e-${relId}-${toTable}`, source: relId, target: toTable, label: toLabel, animated: true });
    }
  }

  // Phase 2d: Create Multivalued Attribute nodes
  for (const [tableName, data] of tablesData.entries()) {
    if (tableTypes.get(tableName)! !== 'multivalued') continue;
    
    const { pks, fks } = data;
    const ownerFk = fks.keys().next().value; 
    
    if (ownerFk) {
      const ownerTable = fks.get(ownerFk)!.toTable;
    
      pks.forEach(pkCol => {
        if (fks.has(pkCol)) return; // Don't make an oval for the FK part

        const attrId = `${ownerTable}-${pkCol}-multi`;
        nodes.push({
          id: attrId,
          type: 'multivaluedAttributeNode',
          data: { label: pkCol }, // The attribute is the partialKey
          position: { x: 0, y: 0 },
        });
        edges.push({ id: `e-${ownerTable}-${attrId}`, source: ownerTable, target: attrId });
      });
    }
  }

  // Phase 2e: Create M:N Relationship nodes
  for (const { name: jTableName, fks } of junctionTables) {
    const fkList = Array.from(fks.values());
    
    // This handles M:N. You can extend this for N-ary relationships if needed.
    if (fkList.length < 2) continue; 
    
    const tableA = fkList[0].toTable;
    const tableB = fkList[1].toTable;

    const relId = `rel-${jTableName}`;
    nodes.push({
      id: relId,
      type: 'relationshipNode',
      data: { label: jTableName }, 
      position: { x: 0, y: 0 },
    });
    
    edges.push({ id: `e-${tableA}-${relId}`, source: tableA, target: relId, label: 'N', animated: true });
    edges.push({ id: `e-${tableB}-${relId}`, source: tableB, target: relId, label: 'M', animated: true });
    
    // Handle N-ary relationships (more than 2 FKs)
    for (let i = 2; i < fkList.length; i++) {
      const tableC = fkList[i].toTable;
      edges.push({ id: `e-${tableC}-${relId}`, source: tableC, target: relId, label: 'X', animated: true }); // 'X' or some other label
    }
  }

  return { nodes, edges };
}