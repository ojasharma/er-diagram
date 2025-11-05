// components/chen-nodes/AttributeNode.tsx
import { Handle, Position } from 'reactflow';

// Oval shape
const nodeStyle = {
  border: '2px solid rgb(37, 99, 235)', // blue-600
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

// MODIFIED: Function signature updated to accept 'isPartialKey'
function AttributeNode({ data }: { data: { label: string, isKey: boolean, isPartialKey: boolean } }) {
  
  // MODIFIED: Logic to handle different underline styles
  const style: React.CSSProperties = { ...nodeStyle };
  if (data.isKey) {
    style.textDecoration = 'underline';
  } else if (data.isPartialKey) {
    style.textDecoration = 'underline';
    style.textDecorationStyle = 'dashed'; // Dashed for partial keys
  }

  return (
    <>
      {/* This node only ever connects to one entity */}
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Right} />
      <div style={style}>{data.label}</div>
    </>
  );
}

export default AttributeNode;