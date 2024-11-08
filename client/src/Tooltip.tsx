import { Statistic } from "./api";
import "./Tooltip.css";

const Tooltip = ({ position, data, isVisible }: { position: { x: number, y: number }, data: Statistic | null, isVisible: boolean }) => {
  if (!isVisible) {
    return null;
  }

  const { x, y } = position;
  const formattedDate = data ? (new Date(data["latest-start-time"]["$date"])).toLocaleString() : "";

  return (
    <div
      className="tooltip-container"
      style={{
        top: y,
        left: x,
      }}
    >
      {
        data ?
          // <ul>
          //   {Object.entries(data).map(([statName, statValue], _) => {
          //     return (
          //       <li key={statName}>
          //         <strong>{statName}: </strong>
          //         {statValue.toString()}
          //       </li>
          //     );
          //   })}
          // </ul>
          <ul>
            <li><strong>Latest test:</strong> {formattedDate}</li>
            <br />
            <li><strong>Latency (outbound):</strong> {data['sd-lat-ow-min']}/{data['sd-lat-ow-max']}/{data['sd-lat-ow-avg']} ms</li>
            <li><strong>Latency (inbound):</strong> {data['ds-lat-ow-min']}/{data['ds-lat-ow-max']}/{data['ds-lat-ow-avg']} ms</li>
            <li><strong>Jitter (outbound):</strong> {data['sd-jitter-min']}/{data['sd-jitter-max']}/{data['sd-jitter-avg']} ms</li>
            <li><strong>Jitter (inbound):</strong> {data['ds-jitter-min']}/{data['ds-jitter-max']}/{data['ds-jitter-avg']} ms</li>
            <li><strong>Round-trip time:</strong> {data['rtt-min']}/{data['rtt-max']}/{data['rtt-avg']} ms</li>
            <li><strong>Packet loss (outbound):</strong> {data['pkt-loss-sd']}</li>
            <li><strong>Packet loss (inbound):</strong> {data['pkt-loss-ds']}</li>
            <li><strong>Success rate:</strong> {data['successes']}/{data['successes'] + data['failures']} ({(data['successes'] / (data['successes'] + data['failures'])).toFixed(2)})</li>
            <br />
            <li><em>Format: min/max/avg</em></li>
          </ul>
          :
          <p><em>Error loading statistics.</em></p>
      }
    </div>
  );
};

export default Tooltip;
