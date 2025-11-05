// lib/layout.ts
import dagre from 'dagre';
import { Node, Edge } from 'reactflow';

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  // Define node sizes - this is important for dagre
  const nodeSizes = new Map<string, { width: number, height: number }>();
  nodes.forEach((node) => {
    let width = 150;
    let height = 50;
    if (node.type === 'entityNode' || node.type === 'weakEntityNode') {
      width = 170; height = 60;
    }
    if (node.type === 'attributeNode' || node.type === 'multivaluedAttributeNode') {
      width = 140; height = 60;
    }
    if (node.type === 'relationshipNode' || node.type === 'identifyingRelationshipNode') {
      width = 140; height = 100;
    }
    nodeSizes.set(node.id, { width, height });
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const nodeSize = nodeSizes.get(node.id)!;
    
    // We are shifting the dagre node position (center) to the React Flow position (top-left)
    node.position = {
      x: nodeWithPosition.x - nodeSize.width / 2,
      y: nodeWithPosition.y - nodeSize.height / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};