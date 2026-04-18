import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ForceGraph2D from 'react-force-graph-2d';
import { Network } from 'lucide-react';

const KnowledgeGraph = ({ data }) => {
  const graphRef = useRef();

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-200);
    }
  }, []);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return null;
  }

  const nodeColor = (node) => {
    switch (node.group) {
      case 1:
        return '#0A0A0A';
      case 2:
        return '#002FA7';
      case 3:
        return '#FFC107';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white border border-gray-200 rounded-lg p-6"
      data-testid="knowledge-graph"
    >
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-blue-900" />
        <h3 className="text-lg font-semibold cabinet-grotesk">Knowledge Graph</h3>
      </div>

      <div className="knowledge-graph-container">
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeLabel="label"
          nodeColor={nodeColor}
          nodeRelSize={6}
          linkColor={() => '#E5E7EB'}
          linkWidth={2}
          width={600}
          height={400}
          backgroundColor="#F9FAFB"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px IBM Plex Sans`;
            
            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = nodeColor(node);
            ctx.fill();
            
            // Draw label
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#111827';
            ctx.fillText(label, node.x, node.y + 15);
          }}
        />
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0A0A0A' }}></div>
          <span className="text-gray-600">Content</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#002FA7' }}></div>
          <span className="text-gray-600">AI Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
          <span className="text-gray-600">Claims</span>
        </div>
      </div>
    </motion.div>
  );
};

export default KnowledgeGraph;