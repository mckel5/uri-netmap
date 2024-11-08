// edges.push({
//     id: `${sourceNodeName} ${targetNodeName}`,
//     source: sourceNodeName,
//     target: targetNodeName,
//     animated: true,
//     style: { stroke: getEdgeColor(successRate), "stroke-width": 2 },
//   });

import { Edge } from "@xyflow/react";
import { getAllStatistics, getNodeByIp, type Statistic } from "./api";

async function getInitialEdges(): Promise<Edge[]> {
  let edges = [];

  const statistics = await getAllStatistics();

  for (const statistic of statistics) {
    const srcIp = statistic["src-ip"];
    const destIp = statistic["dest-ip"];
    const srcNode = await getNodeByIp(srcIp);
    const destNode = await getNodeByIp(destIp);

    if (!(srcNode && destNode)) continue;

    const srcName = srcNode["hostname"];
    const destName = destNode["hostname"];

    edges.push({
      id: `${srcName} ${destName}`,
      source: srcName,
      target: destName,
      animated: true,
      type: "straight",
      style: { stroke: getEdgeColor(statistic), strokeWidth: 2 },
      data: { stats: statistic },
    });
  }
  return edges;
}

function getEdgeColor(statistic: Statistic): string {
  const green = "#00ff00";
  const yellow = "#ffff00";
  const red = "#ff0000";

  const maxJitter = Math.max(
    statistic["sd-jitter-max"],
    statistic["ds-jitter-max"]
  );

  if (maxJitter < 30) return green;
  else if (maxJitter < 50) return yellow;
  else return red;
}

export default getInitialEdges;
