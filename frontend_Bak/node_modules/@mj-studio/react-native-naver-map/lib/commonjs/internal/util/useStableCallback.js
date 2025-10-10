"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStableCallback = useStableCallback;
var _react = require("react");
/**
 * Returns a stabilized callback reference which delegates to the most recent unstable callback
 *
 * This is similar to useCallback, but allows unstableCallback to access the most recent values from the closure.
 * This can be useful if the callback is being stored long term, such as in the Transition Hook registry.
 *
 * Example:
 * ```jsx
 * const latestValueFromProps = props.value
 * const transitionHook = useStableCallback(() => console.log(latestValueFromProps));
 * useEffect(() => {
 *   const deregister = transitionService.onBefore({ exiting: 'someState' }, transitionHook);
 *   return () => deregister();
 * }, []);
 * ```
 */

function useStableCallback(unstableCallback) {
  const ref = (0, _react.useRef)(unstableCallback);
  ref.current = unstableCallback;
  const callback = (0, _react.useCallback)(function () {
    // @ts-ignore
    return ref.current && ref.current.apply(this, arguments);
  }, []);
  return callback;
}
//# sourceMappingURL=useStableCallback.js.map