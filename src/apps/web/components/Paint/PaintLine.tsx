import React, {useEffect} from 'react';
import {Line} from 'react-konva';
import {LineConfig} from "konva/lib/shapes/Line";
import Konva from "konva";

interface IProps extends LineConfig{
  groupNode: Konva.Group
}
const PaintLine:React.FC<IProps> = ({groupNode, ...props}) => {
  useEffect(() => {
    groupNode && groupNode.cache();
    return ()=>{
      groupNode && groupNode.cache();
    }
  }, [])
  return (
    <Line
      {...props}
    ></Line>
  );
};

export default PaintLine;