import * as React from "react";
// Import events module
const events = require("events");

// Create an eventEmitter object
export const interfaceEmitter = new events.EventEmitter();

export function useGlobalEvent(event) {
  const [value, setValue] = React.useState(null);
  React.useEffect(() => {
    const callback = (props) => {
      setValue(props);
    };
    interfaceEmitter.on(event, callback);
    return () => interfaceEmitter.off(event, callback);
  }, [event]);
  return value;
}
