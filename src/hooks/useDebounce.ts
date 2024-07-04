import { useCallback } from "react";
import * as _ from "lodash";
 
const useDebounce = (callback :any, delay :any) => {
const debouncedCallback = useCallback(_.debounce(callback, delay), [callback, delay]);
 
  return debouncedCallback;
};
 
export default useDebounce;