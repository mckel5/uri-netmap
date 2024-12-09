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
  ControlButton,
  type ColorMode,
  useReactFlow,
} from "@xyflow/react";

import Popover from "./Popover";
import initialNodes from "./initial_nodes";

import "@xyflow/react/dist/style.css";
import getInitialEdges from "./initial_edges";
import { Statistic } from "./api";
import PopoverVisibilityHandler from "./PopoverVisibilityHandler";

export default function NodeMap() {
  const [colorMode, setColorMode] = useState<ColorMode>("light");

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [popoverPosition, setPopoverPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [popoverData, setPopoverData] = useState<Statistic | null>(null);
  const [popoverIsVisible, setPopoverIsVisible] = useState<boolean>(false);
  const [popoverSource, setPopoverSource] = useState<string>("");
  const [popoverTarget, setPopoverTarget] = useState<string>("");

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

  const onEdgeClick = useCallback((_event: MouseEvent, edge: Edge) => {
    if (!edge.data || !("stats" in edge.data)) return;

    const { clientX, clientY } = _event;
    setPopoverSource(edge.source);
    setPopoverTarget(edge.target);
    setPopoverPosition({ x: clientX, y: clientY });
    setPopoverData(edge.data.stats as Statistic);
    setPopoverIsVisible(true);
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
        onEdgeClick={onEdgeClick}
        colorMode={colorMode}
        defaultViewport={{ x: 800, y: 450, zoom: 1 }}
      >
        <Background />
        <Controls>
          <ControlButton
            onClick={() =>
              setColorMode(colorMode === "light" ? "dark" : "light")
            }
          >
            {colorMode === "light" ? "🌙" : "☀️"}
          </ControlButton>
        </Controls>
        <PopoverVisibilityHandler callback={() => setPopoverIsVisible(false)}>
          <Popover
            position={popoverPosition}
            data={popoverData}
            isVisible={popoverIsVisible}
            sourceName={popoverSource}
            targetName={popoverTarget}
          />
        </PopoverVisibilityHandler>
      </ReactFlow>
    </div>
  );
}
