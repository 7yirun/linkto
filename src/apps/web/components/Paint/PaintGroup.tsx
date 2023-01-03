import React, {useEffect, useRef, forwardRef} from 'react';
import {Group, Transformer} from 'react-konva'
import {GroupConfig} from "konva/lib/Group";
import Konva from "konva";

interface IProps extends GroupConfig{
  setNode: (ele:any)=>void
  showTransformer: boolean
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
  const trRef = useRef<any>();

  useEffect(()=>{
    props.showTransformer && node.current && trRef.current.nodes([node.current])
  }, [props.showTransformer])

  return (
    <>
      <Group
        ref={(ele)=>{
          node.current = ele;
          props.setNode(ele)
        }}
        {...props}
      >
      </Group>
      {
        props.showTransformer &&
        <Transformer
          ref={trRef}
        >
        </Transformer>
      }
    </>

  );
};

export default PaintGroup;