import useImage from 'use-image';
import React, {useEffect, useRef, useState} from 'react'
import {Image} from 'react-konva';
import {useDispatch, useSelector} from "react-redux";
import {pictureStateType} from "../../pages/Create/Create";
import {setCanvasWidth, setCanvasHeight} from "../../store/store";

interface IProps {
  imgUrl: string
  maxWidth: number
  maxHeight: number
  onLoad?: ()=>void
  [key: string]: any
}

const URLImage: React.FC<IProps> = ({imgUrl, maxWidth, maxHeight,onLoad, ...props}) => {
  const pictureState = useSelector<any, pictureStateType>(state => state.pictureState);
  const dispatch = useDispatch();
  const [img] = useImage(imgUrl, 'anonymous');
  const pixelRatioRef = useRef<number>(1);
  useEffect(()=>{
    pixelRatioRef.current = Math.max(window.devicePixelRatio, 1)
  }, [])
  const [imgProps, setImgProps] = useState<{
    x: number,
    y: number,
    width: number
    height: number
  }>({
    x: 0,
    y: 0,
    width: 1,
    height: 1
  })
  useEffect(()=>{
    if(!img){
      return
    }
    // 如果图片尺寸太大, 需要给他缩小到canvas可见范围===============start
    let [width, height] = [img.width, img.height];
    setImgProps({
      x: 0,
      y: 0,
      width: width / pixelRatioRef.current,
      height: height / pixelRatioRef.current
    })
    //初始画布2048x2048, 上传第一张图片后将画布改为第一张图片一样的尺寸,后续上传的图片不再更改画布尺寸
    if(pictureState.canvasWidth === 2048 && pictureState.canvasHeight === 2048){
      const stageWidth = Math.min(img.width, 2048)
      const stageHeight = Math.min(img.height, 2048)
      console.log(stageWidth, stageHeight);
      dispatch(setCanvasWidth(stageWidth))
      dispatch(setCanvasHeight(stageHeight))
    }

    /*如果图片尺寸太大, 需要给他缩小到canvas可见范围===============end*/
  }, [img])
  return (
    <Image
      image={img}
      {...props}
      {...imgProps}
    />
  );
};

export default URLImage

