import { React, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlow, Controls, Background, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

// export default function NodeMap() {
//   return <p>Hello</p>;
// }

export default function NodeMap() {
  const { hostname: sourceNodeName } = useParams();
  const url = new URL('http://10.10.96.234:5000/api/stats');
  url.searchParams.set('source', sourceNodeName);

  // const [data, setData] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(url);
        const result = await response.json();

        let nodes = [];
        let edges = [];

        nodes.push({ id: sourceNodeName, position: { x: 0, y: 0 }, data: { label: sourceNodeName } });

        // Target nodes are evenly distributed in a circle around the source node
        const mapRadius = Math.min(innerWidth, innerHeight) * 0.5;
        const numOuterNodes = result.length;

        for (const [i, statistic] of result.entries()) {
          // Use target node's hostname if it is known, otherwise use its IP address
          const targetIp = statistic['dest-ip'];
          const targetNode = await (await fetch(`http://10.10.96.234:5000/api/nodes?ip=${targetIp}`)).json();
          const targetNodeName = targetNode ? targetNode.hostname : targetIp;

          // Calculate target node's position on circle
          const x = mapRadius * Math.cos((i + 1) * ((2 * Math.PI) / numOuterNodes));
          const y = mapRadius * Math.sin((i + 1) * ((2 * Math.PI) / numOuterNodes));

          nodes.push({ id: targetNodeName, position: { x: x, y: y }, data: { label: targetNodeName } });
          edges.push({ id: i.toString(), source: sourceNodeName, target: targetNodeName })
        }

        setNodes(nodes);
        setEdges(edges);

        // setInitialEdges([{ id: 'e1-2', source: '1', target: '2' }]);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    })();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}