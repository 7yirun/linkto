import useImage from 'use-image';
import React, {useEffect, useRef, useState} from 'react'
import {Image} from 'react-konva';

interface IProps {
  imgUrl: string
  maxWidth: number
  maxHeight: number
  onLoad?: ()=>void
  [key: string]: any
}

const URLImage: React.FC<IProps> = ({imgUrl, maxWidth, maxHeight,onLoad, ...props}) => {
  const [img] = useImage(imgUrl, 'anonymous');
  const pixelRatioRef = useRef<number>(1);
  useEffect(()=>{
    pixelRatioRef.current = window.devicePixelRatio
  }, [])
  const [imgProps, setImgProps] = useState<{
    x: number,
    y: number,
    width: number
    height: number
  }>()
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

