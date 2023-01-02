import useImage from 'use-image';
import React, {useRef, useEffect, useState} from 'react'
import {Image, Transformer} from 'react-konva';

interface IProps {
  imgUrl: string
  maxWidth: number
  maxHeight: number
  onLoad?: ()=>void
  [key: string]: any
}

const URLImage: React.FC<IProps> = ({imgUrl, maxWidth, maxHeight,onLoad, ...props}) => {
  const [img] = useImage(imgUrl, 'anonymous');
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
    /*如果图片尺寸太大, 需要给他缩小到canvas可见范围===============start*/
    let [scaleX, scaleY] = [1, 1];
    let [width, height] = [img.width, img.height];
    if (img && width > maxWidth) {
      scaleX = width / maxWidth
    }
    if (img && height > maxHeight) {
      scaleY = height / maxHeight
    }
    if (scaleX > scaleY) {
      width = maxWidth;
      height = img ? height / scaleX : 0
    } else if(scaleX < scaleY){
      height = maxHeight;
      width = img ? width / scaleY : 0
    }
    setImgProps({
      x: 0,
      y: 0,
      width: width,
      height: height
    })
    /*如果图片尺寸太大, 需要给他缩小到canvas可见范围===============end*/
  }, [img])
  return (
    <Image
      image={img}
      {...imgProps}
      {...props}
    />
  );
};

export default URLImage

