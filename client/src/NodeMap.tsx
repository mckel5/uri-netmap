import { useState, useEffect, useCallback, type MouseEvent } from "react";
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
import { Statistic } from "./api";

export default function NodeMap() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState<Statistic | null>(null);
  const [tooltipIsVisible, setTooltipIsVisible] = useState<boolean>(false);
  const [tooltipSource, setTooltipSource] = useState<string>("");
  const [tooltipTarget, setTooltipTarget] = useState<string>("");

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onEdgeMouseEnter = useCallback((_event: MouseEvent, edge: Edge) => {
    if (!edge.data || !("stats" in edge.data)) return;

    const { clientX, clientY } = _event;
    setTooltipSource(edge.source);
    setTooltipTarget(edge.target);
    setTooltipPosition({ x: clientX, y: clientY });
    setTooltipData(edge.data.stats as Statistic);
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
          sourceName={tooltipSource}
          targetName={tooltipTarget}
        />
      </ReactFlow>
    </div>
  );
}
