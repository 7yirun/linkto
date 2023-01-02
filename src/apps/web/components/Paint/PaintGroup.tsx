import React, {useEffect, useRef, forwardRef} from 'react';
import {Group} from 'react-konva'
import {GroupConfig} from "konva/lib/Group";
import Konva from "konva";

interface IProps extends GroupConfig{
  setNode: (ele:any)=>void
}
const PaintGroup:React.FC<IProps> = (props) => {
  const node = useRef<any>(null);
  useEffect(()=>{
    /*requestAnimationFrame(()=>{
      node.current.cache();
    })*/
    setTimeout(()=>{
      node.current.cache();
    }, 300)
  }, [])

  return (
    <Group
      ref={(ele)=>{
        node.current = ele;
        props.setNode(ele)
      }}
      {...props}
    >
    </Group>

  );
};

export default PaintGroup;