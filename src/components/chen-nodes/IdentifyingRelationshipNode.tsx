// components/chen-nodes/IdentifyingRelationshipNode.tsx
import { Handle, Position } from 'reactflow';

// Styles
const nodeStyle = {
  // OLD STYLE
  // border: '3px double rgb(22, 163, 74)',
  
  // NEW STYLE: Create a visible gap
  border: '2px solid rgb(22, 163, 74)',     // The inner line
  outline: '2px solid rgb(22, 163, 74)',    // The outer line
  outlineOffset: '2px',                     // The gap between lines

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

function IdentifyingRelationshipNode({ data }: { data: { label: string } }) {
  return (
    <div style={wrapperStyle}>
      {/* Handles for all directions (source and target) */}
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Right} />
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

export default IdentifyingRelationshipNode;