import useImage from 'use-image';
import React, {useRef, useEffect, useState} from 'react'
import {Image, Transformer} from 'react-konva';

interface IProps {
  imgUrl: string
  maxWidth: number
  maxHeight: number
  [key: string]: any
}

const URLImage: React.FC<IProps> = ({imgUrl, maxWidth, maxHeight, ...props}) => {
  const [img] = useImage(imgUrl);
  const imgRef = useRef<any>();
  const [imgProps, setImgProps] = useState<any>()
  useEffect(()=>{
    if(!img){
      return
    }
    /*如果图片尺寸太大, 需要给他缩小到canvas可见范围===============start*/
    let [scaleX, scaleY] = [1, 1];
    let [width, height] = [0, 0];
    if (img && img.width > maxWidth) {
      scaleX = img.width / maxWidth
    }
    if (img && img.height > maxHeight) {
      scaleY = img.height / maxHeight
    }
    if (scaleX > scaleY) {
      width = maxWidth;
      height = img ? img.height / scaleX : 0
    } else {
      height = maxHeight;
      width = img ? img.width / scaleY : 0
    }
    console.log(width, height);
    setImgProps({
      x: 0,
      y: 0,
      width: width,
      height: height
    })
    /*如果图片尺寸太大, 需要给他缩小到canvas可见范围===============end*/
  }, [img])



  /* useEffect(()=>{
     console.log('1111111111111');
   }, [pictureState.currentLayerId])*/

/*  useEffect(() => {
    if (isSelected) {
      imgRef.current.moveToTop();
      // we need to attach transformer manually
      /!*TODO*!/
      // trRef.current.nodes([imgRef.current]);
      /!*TODO*!/
      // trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);*/

  return (
    <>
      <Image
        ref={imgRef}
        image={img}
        {...imgProps}
        {...props}
       /* onDragEnd={(e) => {
          setImgProps({
            ...imgProps,
            x: imgRef.current.x(),
            y: imgRef.current.y()
          })
        }}
        onTransformEnd={() => {
          const node = imgRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          console.log(scaleX, scaleY);
          setImgProps({
            ...imgProps,
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
          })
        }}*/
      />
      {/*{isSelected && props.draggable && (
        <Transformer
          ref={trRef}
        />
      )}*/}
    </>
  );
};

export default URLImage

