import { React, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  ReactFlow,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import Tooltip from "./Tooltip";

import "@xyflow/react/dist/style.css";

export default function NodeMap() {
  const { hostname: sourceNodeName } = useParams();
  const url = new URL("http://10.10.96.234:5000/api/stats");
  url.searchParams.set("source", sourceNodeName);

  const [statistics, setStatistics] = useState([]);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState({});
  const [tooltipIsVisible, setTooltipIsVisible] = useState(false);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onEdgeMouseEnter = useCallback((_event, edge) => {
    const { clientX, clientY } = _event;
    setTooltipPosition({ x: clientX, y: clientY });
    setTooltipData(edge.data.statistic);
    setTooltipIsVisible(true);
  }, []);

  const onEdgeMouseMove = useCallback((_event, edge) => {
    const { clientX, clientY } = _event;
    setTooltipPosition({ x: clientX, y: clientY });
  }, []);

  const onEdgeMouseLeave = useCallback((_event, edge) => {
    setTooltipIsVisible(false);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(url);
        const result = await response.json();

        let statistics = result;

        let nodes = [];
        let edges = [];

        nodes.push({
          id: sourceNodeName,
          position: { x: 0, y: 0 },
          data: { label: sourceNodeName },
        });

        // Target nodes are evenly distributed around a semicircle under the source node
        const mapRadius = Math.min(innerWidth, innerHeight) * 0.5;
        const numOuterNodes = result.length;

        for (const [i, statistic] of statistics.entries()) {
          // Use target node's hostname if it is known, otherwise use its IP address
          const targetIp = statistic["dest-ip"];
          const targetNode = await (
            await fetch(`http://10.10.96.234:5000/api/nodes?ip=${targetIp}`)
          ).json();
          const targetNodeName = targetNode ? targetNode.hostname : targetIp;
          const successRate =
            statistic["successes"] /
            (statistic["successes"] + statistic["failures"]);

          // Calculate target node's position on semicircle
          const x =
            mapRadius * Math.cos((i + 1) * (Math.PI / (numOuterNodes + 1)));
          const y =
            mapRadius * Math.sin((i + 1) * (Math.PI / (numOuterNodes + 1)));

          nodes.push({
            id: targetNodeName,
            position: { x: x, y: y },
            data: { label: targetNodeName },
          });

          edges.push({
            id: i.toString(),
            source: sourceNodeName,
            target: targetNodeName,
            animated: true,
            style: { stroke: getEdgeColor(successRate), strokeWidth: 2 },
            data: { statistic: statistic },
          });
        }

        setNodes(nodes);
        setEdges(edges);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseMove={onEdgeMouseMove}
        onEdgeMouseLeave={onEdgeMouseLeave}
        fitView
        colorMode="dark"
      >
        <Background />
        <Controls />
        <Tooltip
          position={tooltipPosition}
          data={tooltipData}
          isVisible={tooltipIsVisible}
        />
      </ReactFlow>
    </div>
  );
}

/**
 * Generates a color between red and green based on the input value
 * @param {Number} successRate a number between 0 and 1
 * @returns a HSL code corresponding to the desired color
 */
function getEdgeColor(successRate) {
  // https://stackoverflow.com/a/17268489
  var hue = (successRate * 120).toString(10);
  return ["hsl(", hue, ",100%,50%)"].join("");
}
