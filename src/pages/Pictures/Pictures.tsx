import Waterfall from "components/WaterFall/Waterfall";
import {useEffect, useState, useRef, SyntheticEvent} from "react";
import "./Picture.scss"
import Icons from "lib/icons"
import debounce from 'lodash/debounce.js'

const Pictures = () => {
  const [isLeft, setIsLeft] = useState<boolean>(false);
  const debouncedRef = useRef();
  debouncedRef.current = debounce((e:SyntheticEvent)=>{
    console.log('inputing');
  },500)
  useEffect(()=>{
    return ()=>{
      (debouncedRef.current as any).cancel();
    }
  }, [])
  return (
    <div className={'pictures'}>
      <div className="search-pictures">
        {/*pending*/}
        {/*<input onChange={debouncedRef.current}
               onFocus={()=>{}}
               type="text"
               placeholder={'搜索'}
        />
        <i className={`${isLeft ? 'left':''} search-icon`}>
          <img src={Icons.search} alt=""/>
        </i>*/}
      </div>
      <Waterfall cols={6} colWidth={204}></Waterfall>
    </div>
  )
}
export default Pictures