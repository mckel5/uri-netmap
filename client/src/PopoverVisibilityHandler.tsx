import { useRef, useEffect, type RefObject, type ReactNode } from "react";

/**
 * Hook that hides popover on click (outside the popover), pan, or zoom
 * https://stackoverflow.com/a/42234988
 */
function useHandler(ref: RefObject<any>, callback: CallableFunction) {
  useEffect(() => {
    // Triggers callback only if click occurred outside referenced element
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        // Clickable area of edges are represented by <path> elements
        document.elementFromPoint(event.clientX, event.clientY)?.tagName !==
          "path"
      ) {
        callback();
      }
    }

    // Bind the event listeners
    // Some listeners must be applied to the view pane instead of the document to work
    const [pane] = document.getElementsByClassName("react-flow__pane");
    document.addEventListener("click", handleClickOutside);
    pane.addEventListener("mousedown", () => callback());
    pane.addEventListener("wheel", () => callback());
    
    return () => {
      // Unbind the event listeners on clean up
      document.removeEventListener("click", handleClickOutside);
      pane.removeEventListener("mousedown", () => callback());
      pane.removeEventListener("wheel", () => callback());
    };
  }, [ref]);
}

/**
 * Component that applies hook functionality to its children
 */
export default function PopoverVisibilityHandler({
  children,
  callback,
}: {
  children: ReactNode;
  callback: CallableFunction;
}) {
  const wrapperRef = useRef(null);
  useHandler(wrapperRef, callback);

  return <div ref={wrapperRef}>{children}</div>;
}
