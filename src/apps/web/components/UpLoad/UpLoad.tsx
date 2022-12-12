import React, {ReactNode} from 'react';
import styles from "./UpLoad.module.scss"
import {message} from 'antd'

import {setCurrentLayerId, setLoadedImages} from "apps/web/store/store";
import {useDispatch, useSelector} from "react-redux"

interface IProps {
  setImgUrl?: (url: string) => void
  setFileName?: (name:string) => void
  maxSize?: number
}

const SIZE_LIMIT = 10 * 1024 * 1024 //限制上传的最大图片大小为10MB
const UpLoad: React.FC<IProps> = (props) => {
  UpLoad.defaultProps = {
    maxSize: SIZE_LIMIT
  }
  const dispatch = useDispatch();
  const pictureState = useSelector<any, any>(state => state.pictureState);

  return (
    <div className={styles.upload}>
      {
        props.children
      }
      <span className={'iconfont icon-1'}></span>
      <input
        accept="image/jpeg, image/jpg, image/png, image/gif, image/bmp"
        onChange={(e) => {
          const file = e.target.files![0];
          console.log(file);
          //点击上传文件然后点取消 也会触发onchange, 此时file为undefined
          if(!file){
            return
          }
          if (!file.type.includes('image')) {
            message.warning('请上传图片格式文件');
            return;
          }
          if (file.size > SIZE_LIMIT) {
            message.warning('上传图片不得超过10MB');
            return
          }
          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);
          fileReader.onload = () => {
            props.setFileName && props.setFileName(file.name);
            const id = file.name + Date.now()
            dispatch(setLoadedImages([...pictureState.loadedImages, {
              name: file.name,
              src: fileReader.result as string,
              id: id
            }]))
            //每次上传新图片 将当前图层改变为新上传的图片的图层
            dispatch(setCurrentLayerId(id));
          }
          //value值要重置, 否则第二次上传相同文件时onchange不触发
          e.target.value = '';
        }}
        type="file"/>
    </div>
  );
};

export default UpLoad;