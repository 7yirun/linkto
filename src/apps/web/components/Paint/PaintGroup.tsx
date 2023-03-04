import React, {useEffect, useRef, forwardRef} from 'react';
import {Group, Transformer} from 'react-konva'
import {GroupConfig} from "konva/lib/Group";

interface IProps extends GroupConfig{
  setNode: (ele:any)=>void
  showTransformer: boolean
}
const PaintGroup:React.FC<IProps> = (props) => {
  const node = useRef<any>(null);
  useEffect(()=>{
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
          anchorFill={'#43CF7C'}
          anchorStroke={'#43CF7C'}
          borderStroke={'#43CF7C'}

        >
        </Transformer>
      }
    </>

  );
};

export default PaintGroup;