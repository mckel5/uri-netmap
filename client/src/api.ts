const apiUrl = "http://10.10.96.234:5000/api";

export interface NetNode {
  ip: string;
  hostname: string;
}

export interface NodePosition {
  name: string;
  x: number;
  y: number;
}

export interface Statistic {
  _id: { $oid: string };
  "ds-jitter-avg": number;
  "ds-jitter-max": number;
  "ds-jitter-min": number;
  "ds-lat-ow-avg": number;
  "ds-lat-ow-max": number;
  "ds-lat-ow-min": number;
  "latest-start-time": { $date: string };
  "pkt-loss-ds": number;
  "pkt-loss-sd": number;
  "rtt-avg": number;
  "rtt-max": number;
  "rtt-min": number;
  "sd-jitter-avg": number;
  "sd-jitter-max": number;
  "sd-jitter-min": number;
  "sd-lat-ow-avg": number;
  "sd-lat-ow-max": number;
  "sd-lat-ow-min": number;
  "src-ip": string;
  "dest-ip": string;
  successes: number;
  failures: number;
}

async function parse_response(response: Promise<Response>): Promise<any> {
  const data = await (await response).json();
  
  // MongoDB object id is not useful to us, so delete it
  if (data) delete data._id;
  
  return data;
}

export async function getAllStatistics(): Promise<Statistic[]> {
  return await parse_response(fetch(`${apiUrl}/stats`));
}

export async function getAllNodes(): Promise<NetNode[]> {
  return await parse_response(fetch(`${apiUrl}/nodes`));
}

export async function getNodeByIp(ip: string): Promise<NetNode | null> {
  return await parse_response(fetch(`${apiUrl}/nodes?ip=${ip}`));
}

export async function getNodePositions(): Promise<NodePosition[]> {
  return await parse_response(fetch(`${apiUrl}/node_positions`));
}
