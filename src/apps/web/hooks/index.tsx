import {useEffect, useRef, useState} from "react";
import debounce from "lodash/debounce.js"

export const useWindowResize = ()=>{
  const [width, setWidth] = useState(0);
  useEffect(()=>{
    const updateWidth = ()=>{
      setWidth(document.documentElement.clientWidth); //此宽度不包含滚动条
    }
    updateWidth()
    const debouncedUpdate = debounce(updateWidth, 300)
    window.addEventListener('resize', debouncedUpdate)
    return ()=>{
      window.removeEventListener('resize', debouncedUpdate)
    }
  }, [])
  return width;
}

export const useMounted = ()=>{
  const mountedRef = useRef<boolean>(false);
  useEffect(()=>{
    mountedRef.current = true
  },[])
  return mountedRef.current
}
