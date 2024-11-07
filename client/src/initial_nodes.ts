import { Position } from "@xyflow/react";

const initialNodesBasic: Array<[label: string, x: number, y: number]> = [
  ["TylerCore9504", -200, 0],
  ["BresslerCore9504", 200, 0],
  ["Tyler9508-AdminNet", -600, 300],
  ["Bressler9508-AdminNet", 600, 300],
];

const initialNodes = initialNodesBasic.map((data) => {
  const [label, x, y] = data;
  return {
    id: label,
    position: { x: x, y: y },
    data: { label: label },
    handles: [{ x: 0, y: y, position: Position.Top, type: "source" as const }],
  };
});

export default initialNodes;
