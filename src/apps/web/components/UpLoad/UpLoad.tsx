import React, {ReactNode} from 'react';
import styles from "./UpLoad.module.scss"

interface IProps{
  setImgUrl: (url:string)=>void
  maxSize: number
  children?: ReactNode
}
const SIZE_LIMIT = 10*1024*1024 //限制上传的最大图片大小为10MB
const UpLoad:React.FC<IProps> = (props) => {
  UpLoad.defaultProps = {
    maxSize: SIZE_LIMIT
  }
  return (
    <div className={styles.upload}>
      {
        props.children
      }
      <input
        accept="image/jpeg, image/jpg, image/png, image/gif, image/bmp"
        onChange={(e) => {
          const file = e.target.files![0];
          if(!file.type.includes('image')){
            alert('请上传图片格式文件');
          }
          if(file.size > SIZE_LIMIT){
            alert('上传图片不得超过10MB');
            return
          }
          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);
          fileReader.onload = () => {
            props.setImgUrl((fileReader.result as string))
          }
        }}
         type="file"/>
    </div>
  );
};

export default UpLoad;