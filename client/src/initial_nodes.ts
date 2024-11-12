// import { Position } from "@xyflow/react";
import { getNodePositions } from "./api";

const initialNodes = (await getNodePositions()).map((nodePosition) => {
  const {name, x, y} = nodePosition;
  return {
    id: name,
    position: { x: x, y: y },
    data: { label: name },
    // handles: [{ x: 0, y: y, position: Position.Top, type: "source" as const }],
  };
});

export default initialNodes;
