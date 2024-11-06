import "./Tooltip.css";

const Tooltip = ({ position, data, isVisible }: { position: {x: number, y: number}, data: object, isVisible: boolean }) => {
  if (!isVisible) {
    return null;
  }

  const { x, y } = position;

  return (
    <div
      className="tooltip-container"
      style={{
        top: y,
        left: x,
      }}
    >
      <ul>
        {Object.entries(data).map(([statName, statValue], _) => {
          return (
            <li key={statName}>
              <strong>{statName}: </strong>
              {statValue.toString()}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Tooltip;
