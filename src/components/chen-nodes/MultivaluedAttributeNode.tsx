// components/chen-nodes/MultivaluedAttributeNode.tsx
import { Handle, Position } from 'reactflow';

// Double Oval shape
const nodeStyle = {
  // Use border/outline for a clean double line
  border: '2px solid rgb(37, 99, 235)',     // The inner line
  outline: '2px solid rgb(37, 99, 235)',    // The outer line
  outlineOffset: '2px',                     // The gap

  backgroundColor: 'rgba(37, 99, 235, 0.1)',
  padding: '10px 5px',
  borderRadius: '50%', // This makes it an oval
  width: 120,
  textAlign: 'center' as const,
  minHeight: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'black',
};

// Data prop only needs 'label'
function MultivaluedAttributeNode({ data }: { data: { label: string } }) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Right} />
      <div style={nodeStyle}>{data.label}</div>
    </>
  );
}

export default MultivaluedAttributeNode;