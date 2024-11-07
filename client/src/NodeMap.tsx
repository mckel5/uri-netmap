import { useState, useEffect, useCallback, type MouseEvent } from "react";
import { useParams } from "react-router-dom";
import {
  ReactFlow,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";

import Tooltip from "./Tooltip";
import initialNodes from "./initial_nodes";

import "@xyflow/react/dist/style.css";
import getInitialEdges from "./initial_edges";

export default function NodeMap() {
  // const { hostname: sourceNodeName } = useParams();
  // const url = new URL("http://10.10.96.234:5000/api/stats");
  // url.searchParams.set("source", sourceNodeName as string);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState<object>({});
  const [tooltipIsVisible, setTooltipIsVisible] = useState<boolean>(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onEdgeMouseEnter = useCallback((_event: MouseEvent, edge: Edge) => {
    const { clientX, clientY } = _event;
    setTooltipPosition({ x: clientX, y: clientY });
    edge.data && setTooltipData(edge.data!.statistic!);
    setTooltipIsVisible(true);
  }, []);

  const onEdgeMouseMove = useCallback((_event: MouseEvent, _: Edge) => {
    const { clientX, clientY } = _event;
    setTooltipPosition({ x: clientX, y: clientY });
  }, []);

  const onEdgeMouseLeave = useCallback((_event: MouseEvent, _: Edge) => {
    setTooltipIsVisible(false);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // const response = await fetch(url);
        // const result = await response.json();

        // let statistics = result;

        // // Return blank map if desired node does not exist
        // if (Object.keys(statistics).length === 0) return;

        let nodes: Node[] = initialNodes;
        let edges: Edge[] = await getInitialEdges();

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
function getEdgeColor(successRate: number) {
  // https://stackoverflow.com/a/17268489
  var hue = (successRate * 120).toString(10);
  return ["hsl(", hue, ",100%,50%)"].join("");
}
