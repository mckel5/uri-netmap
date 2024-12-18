import { Statistic } from "./api";
import "./Popover.css";

const Popover = ({
  position,
  data,
  isVisible,
  sourceName,
  targetName,
}: {
  position: { x: number; y: number };
  data: Statistic | null;
  isVisible: boolean;
  sourceName: string;
  targetName: string;
}) => {
  if (!isVisible) {
    return null;
  }

  const { x, y } = position;
  const formattedDate = data
    ? new Date(data["latest-start-time"]["$date"]).toLocaleString()
    : "";

  return (
    <div
      className="popover-container"
      style={{
        top: y,
        left: x,
      }}
    >
      {data ? (
        <ul>
          <li>
            <h3>
              {sourceName} &#8594; {targetName}
            </h3>
          </li>
          <li>
            <strong>Latest test:</strong> {formattedDate}
          </li>
          <br />
          <li>
            <strong>Latency (outbound):</strong> {data["sd-lat-ow-min"]}/
            {data["sd-lat-ow-max"]}/{data["sd-lat-ow-avg"]} ms
          </li>
          <li>
            <strong>Latency (inbound):</strong> {data["ds-lat-ow-min"]}/
            {data["ds-lat-ow-max"]}/{data["ds-lat-ow-avg"]} ms
          </li>
          <li>
            <strong>Jitter (outbound):</strong> {data["sd-jitter-min"]}/
            {data["sd-jitter-max"]}/{data["sd-jitter-avg"]} ms
          </li>
          <li>
            <strong>Jitter (inbound):</strong> {data["ds-jitter-min"]}/
            {data["ds-jitter-max"]}/{data["ds-jitter-avg"]} ms
          </li>
          <li>
            <strong>Round-trip time:</strong> {data["rtt-min"]}/
            {data["rtt-max"]}/{data["rtt-avg"]} ms
          </li>
          <li>
            <strong>Packet loss (outbound):</strong> {data["pkt-loss-sd"]}
          </li>
          <li>
            <strong>Packet loss (inbound):</strong> {data["pkt-loss-ds"]}
          </li>
          <li>
            <strong>Success rate:</strong> {data["successes"]}/
            {data["successes"] + data["failures"]} (
            {(
              data["successes"] /
              (data["successes"] + data["failures"])
            ).toFixed(2)}
            )
          </li>
          <br />
          <li>
            <em>Format: min/max/avg</em>
          </li>
        </ul>
      ) : (
        <p>
          <em>Error loading statistics.</em>
        </p>
      )}
    </div>
  );
};

export default Popover;
