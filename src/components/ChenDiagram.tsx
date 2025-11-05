// components/ChenDiagram.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { parseSqlToChen } from '@/lib/parseSqlToChen';
import { getLayoutedElements } from '@/lib/layout';

// Import all custom nodes
import EntityNode from './chen-nodes/EntityNode';
import AttributeNode from './chen-nodes/AttributeNode';
import RelationshipNode from './chen-nodes/RelationshipNode';
import WeakEntityNode from './chen-nodes/WeakEntityNode';
import IdentifyingRelationshipNode from './chen-nodes/IdentifyingRelationshipNode';
import MultivaluedAttributeNode from './chen-nodes/MultivaluedAttributeNode';

const nodeTypes = {
  entityNode: EntityNode,
  attributeNode: AttributeNode,
  relationshipNode: RelationshipNode,
  weakEntityNode: WeakEntityNode,
  identifyingRelationshipNode: IdentifyingRelationshipNode,
  multivaluedAttributeNode: MultivaluedAttributeNode,
};

// Default SQL (omitted for brevity)
const defaultSql = `CREATE TABLE Department (
  dept_id INT PRIMARY KEY,
  dept_name VARCHAR(50)
);

CREATE TABLE Employee (
  emp_id INT PRIMARY KEY,
  name VARCHAR(50),
  dept_id INT,
  FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
);
`;

const getInitialLayout = () => {
  const { nodes, edges } = parseSqlToChen(defaultSql);
  return getLayoutedElements(nodes, edges);
};

// --- HELPER FUNCTION FOR DOWNLOADING ---
const download = (href: string, name: string) => {
  const link = document.createElement('a');
  link.href = href;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Button classes
const btnBase = "px-4 py-2 rounded-md border-2 border-black font-bold transition-all duration-150";
const btnShadow = "shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";
const btnPrimary = `${btnBase} ${btnShadow} bg-blue-600 text-white`;
const btnSecondary = `${btnBase} ${btnShadow} bg-indigo-600 text-white`;
const btnAccent1 = `${btnBase} ${btnShadow} bg-lime-400 text-black`;
const btnAccent2 = `${btnBase} ${btnShadow} bg-fuchsia-500 text-white`;
const btnMuted = `${btnBase} ${btnShadow} bg-gray-100 text-black hover:bg-gray-200`;

function ChenDiagramInner() {
  const [sqlInput, setSqlInput] = useState(defaultSql);
  const [showStarPopup, setShowStarPopup] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  useEffect(() => {
    setShowInfoPopup(true);
  }, []);

  const initialLayout = useMemo(() => getInitialLayout(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialLayout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialLayout.edges);

  const onLayout = useCallback((direction: 'TB' | 'LR') => {
    const { nodes, edges } = parseSqlToChen(sqlInput);
    const layout = getLayoutedElements(nodes, edges, direction);
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [sqlInput, setNodes, setEdges]);

  const downloadImage = useCallback(async (format: 'png' | 'svg') => {
    const { toPng, toSvg } = await import('dom-to-image-more');
    const diagramWrapper = document.getElementById('diagram-wrapper') as HTMLElement;
    if (!diagramWrapper) {
      console.error('Diagram wrapper element not found. Cannot export image.');
      return;
    }
    const options = { backgroundColor: 'white', pixelRatio: 2, cacheBust: true };
    try {
      if (format === 'svg') {
        const dataUrl = await toSvg(diagramWrapper, options);
        download(dataUrl, 'chen-diagram.svg');
      } else {
        const dataUrl = await toPng(diagramWrapper, options);
        download(dataUrl, 'chen-diagram.png');
      }
      setShowStarPopup(true);
    } catch (err: any) {
      console.error(`Failed to export ${format}`, err);
    }
  }, [setShowStarPopup]);

  return (
    // --- WRAPPER DIV: Use h-screen to fill viewport ---
    <div className="flex flex-col h-screen w-full bg-gray-100 font-sans">
      
      {/* --- "How It Works" Popup (No changes) --- */}
      {showInfoPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowInfoPopup(false)}
        >
          <div
            className="bg-white border-2 border-black rounded-md shadow-[8px_8px_0px_#000] p-6 max-w-md w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold tracking-tight text-black">
              🚀 How It Works
            </h3>
            <p className="text-gray-700">
              Getting your ER diagram is easy. Just follow these steps:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                Paste your SQL <code>CREATE TABLE</code> statements into the{" "}
                <strong>SQL Input</strong> box.
              </li>
              <li>
                Click <strong>"Top-Down"</strong> or <strong>"Left-Right"</strong>{" "}
                to generate the diagram.
              </li>
              <li>
                Interact with the diagram by panning (click and drag) and
                zooming (scroll).
              </li>
              <li>
                Use the <strong>PNG</strong> or <strong>SVG</strong> buttons to
                download your diagram.
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => setShowInfoPopup(false)}
                className={`${btnPrimary} w-full`}
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Star Popup (No changes) */}
      {showStarPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowStarPopup(false)}
        >
          <div
            className="bg-white border-2 border-black rounded-md shadow-[8px_8px_0px_#000] p-6 max-w-sm w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold tracking-tight text-black">
              ⭐ Find this helpful?
            </h3>
            <p className="text-gray-700">
              If this tool helped you, please consider starring the repository on GitHub. It really helps!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <a
                href="https://github.com/ojasharma/er-diagram"
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnAccent2} w-full text-center`}
                onClick={() => setShowStarPopup(false)}
              >
                Star on GitHub
              </a>
              <button
                onClick={() => setShowStarPopup(false)}
                className={`${btnMuted} w-full`}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT: flex-col (mobile) and md:flex-row (desktop) --- */}
      <div className="flex flex-col md:flex-row flex-grow p-4 gap-4">
        
        {/* Input Panel (Left) */}
        {/* UPDATED: w-full (mobile) / md:w-1/3 (desktop) */}
        {/* UPDATED: h-auto (mobile) / md:h-full (desktop) */}
        <div className="flex flex-col w-full md:w-1/3 lg:w-1/4 h-auto md:h-full bg-white p-4 border-2 border-black rounded-md shadow-[8px_8px_0px_#000]">
          <h2 className="text-2xl font-bold tracking-tight text-black mb-4">
            SQL Input
          </h2>

          <textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            // UPDATED: h-48 (mobile) / md:h-auto md:flex-grow (desktop)
            className="w-full p-2 border-2 border-black rounded-md font-mono text-sm h-48 md:h-auto md:flex-grow focus:outline-none focus:ring-2 focus:ring-black text-black"
            placeholder="Paste your CREATE TABLE statements here..."
          />

          <div className="flex flex-col gap-3 mt-4">
            <h3 className="text-lg font-bold tracking-tight text-black">
              Generate
            </h3>
            <div className="flex gap-3">
              <button onClick={() => onLayout('TB')} className={btnPrimary}>
                Top-Down
              </button>
              <button onClick={() => onLayout('LR')} className={btnSecondary}>
                Left-Right
              </button>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-black mt-2">
              Download
            </h3>
            <div className="flex gap-3">
              <button onClick={() => downloadImage('png')} className={btnAccent1}>
                PNG
              </button>
              <button onClick={() => downloadImage('svg')} className={btnAccent2}>
                SVG
              </button>
            </div>
          </div>
        </div>

        {/* Diagram Panel (Right) */}
        {/* UPDATED: h-96 (mobile) / md:h-full (desktop) */}
        <div className="flex flex-col flex-grow h-96 md:h-full">
          <div
            id="diagram-wrapper"
            className="bg-white border-2 border-black rounded-md flex-grow shadow-[8px_8px_0px_#000] overflow-hidden"
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
              maxZoom={4}
              className="bg-white"
            >
              <Controls className="!border-2 !border-black !rounded-md !shadow-[4px_4px_0px_#000] !bg-white" />
              <Background />
            </ReactFlow>
          </div>
        </div>
      </div>
      
      {/* --- FOOTER --- */}
      {/* UPDATED: text-center (mobile) / md:text-right (desktop) */}
      {/* UPDATED: text-gray-500 for visibility */}
      <footer className="w-full text-center md:text-right py-2 px-4 text-xs text-gray-500 flex-shrink-0 ">
        Made with <span role="img" aria-label="heart">❤️</span> by{' '}
        <a 
          href="https://github.com/ojasharma" 
          target="_blank" 
          rel="noopener noreferrer" 
          // UPDATED: text-gray-600 for visibility
          className="font-bold text-gray-600 hover:underline"
        >
          ojasharma
        </a>
      </footer>

      {/* Global Styles (No changes) */}
      <style jsx global>{`
        :root {
          font-family: 'Inter', sans-serif, system-ui;
        }
        .react-flow__edge-text {
          font-size: 14px;
          font-weight: 700;
          fill: #000;
          background-color: white;
          padding: 2px 4px;
          border: 2px solid #000;
          border-radius: 4px;
        }
        .react-flow__controls button {
          border-bottom: 2px solid #000 !important;
          background-color: #fff !important;
          color: #000 !important; /* Fixed typo */
          border-radius: 4px;
        }
        .react-flow__controls button:hover {
           background-color: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
}

export default function ChenDiagram() {
  return (
    <ReactFlowProvider>
      <ChenDiagramInner />
    </ReactFlowProvider>
  );
}