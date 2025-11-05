// components/chen-nodes/RelationshipNode.tsx
import { Handle, Position } from 'reactflow';

// Styles (unchanged)
const nodeStyle = {
  border: '2px solid rgb(22, 163, 74)', // green-600
  backgroundColor: 'rgba(22, 163, 74, 0.1)',
  width: 120,
  height: 80,
  textAlign: 'center' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'rotate(45deg)',
};

const wrapperStyle = {
  width: 120,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const textStyle = {
  transform: 'rotate(-45deg)',
  fontWeight: 'bold',
  color: 'black',
};

function RelationshipNode({ data }: { data: { label: string } }) {
  return (
    <div style={wrapperStyle}>
      {/* FIX: Added type="target" handles.
        Now this node can accept incoming connections.
      */}
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Right} />

      {/* Existing source handles */}
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      
      <div style={nodeStyle}>
        <span style={textStyle}>{data.label}</span>
      </div>
    </div>
  );
}

export default RelationshipNode;