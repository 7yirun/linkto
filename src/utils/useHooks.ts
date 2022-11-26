import debounce from "lodash/debounce.js"
export const useDebounce = (callback:any, waiting:number)=>{
  return debounce(callback, waiting);
}
