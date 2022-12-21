import React from 'react';
import styles from "./index.module.scss"

export type imgInfoType = {
  id: number,
  width: number,
  high: number,
  description: string
  url: string
  smallUrl: string,
  accountId: number,
  accountName: string
  headPic: string
  collectCount: number
  starCount: number
}

interface Iprops {
  imgInfo: imgInfoType
  setImgToScale?: (arg: boolean) => void
  setImgInfo?: (arg: imgInfoType) => void
  setShowAddTo?: (arg: boolean) => void
  inClip?: boolean //图片是否已经在收藏夹中了
  removeFromClip?:(id:number)=>void
  addBackToClip?:(id:number)=>void
}

const ImageCard: React.FC<Iprops> = ({imgInfo, setImgToScale, setImgInfo, setShowAddTo, inClip,removeFromClip,addBackToClip}) => {
  return (
    <div
      className={styles['images-wrapper']}
      key={imgInfo.id}
    >
      <div className='img'>
        <img src={imgInfo.smallUrl} alt=""/>
        <div
          className="hover-icons"
          onClick={() => {
            if (setImgToScale && setImgInfo) {
              setImgToScale(true)
              setImgInfo(imgInfo)
            }
          }}
        >
          {
            !inClip ?
              <span
                className={'iconfont icon-12'}
                onClick={(e) => {
                  //图库 收藏
                  if (setShowAddTo && setImgInfo) {
                    setShowAddTo(true)
                    setImgInfo(imgInfo)
                  }
                  //画夹 加回收藏夹
                  if(addBackToClip){
                    addBackToClip(imgInfo.id)
                  }
                  e.stopPropagation();
                }}
              />
              :
              <span
                className={'iconfont in-clip icon-12'}
                onClick={(e) => {
                  //取消收藏
                  if(removeFromClip){
                    removeFromClip(imgInfo.id)
                  }
                  e.stopPropagation();
                }}
              />
          }
          <span className={'iconfont icon-9'}/>
          <span className={'iconfont icon-13'}/>
        </div>
      </div>
      <div className="artist">
        <ul>
          <li>
            <span className={'iconfont icon-12'}/>
            <p>{imgInfo.collectCount}</p>
          </li>
          <li>
            <span className={'iconfont icon-9'}/>
            <p>{imgInfo.starCount}</p>
          </li>
          <li>
            {/*浏览次数 暂无*/}
            <span className={'iconfont icon-Show'}/>
            <p>1234</p>
          </li>
        </ul>
      </div>
    </div>
  )
};

export default ImageCard;