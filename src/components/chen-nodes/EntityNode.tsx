// components/chen-nodes/EntityNode.tsx
import { Handle, Position } from 'reactflow';

const nodeStyle = {
  border: '2px solid rgb(220, 38, 38)', // red-600
  backgroundColor: 'rgba(220, 38, 38, 0.1)',
  padding: '10px 20px',
  borderRadius: '4px',
  width: 150,
  textAlign: 'center' as const,
  fontWeight: 'bold',
  color: 'black',
};

function EntityNode({ data }: { data: { label: string } }) {
  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Right} />
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      {data.label}
    </div>
  );
}

export default EntityNode;