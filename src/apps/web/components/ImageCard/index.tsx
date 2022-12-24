import React, {useState} from 'react';
import styles from "./index.module.scss"
import {cancelLike, setLike} from "../../../../service/service";
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {setLoadedImages} from "apps/web/store/store";
import {pictureStateType} from "../../pages/Create/Create";

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
  isStar: number   //是否点过赞  0未点赞 1已点赞
}

interface Iprops {
  outimgInfo: imgInfoType
  setImgToScale?: (arg: boolean) => void
  outsetImgInfo?: (arg: imgInfoType) => void
  setShowAddTo?: (arg: boolean) => void
  inClip?: boolean //图片是否已经在收藏夹中了
  removeFromClip?: (id: number) => void
  addBackToClip?: (id: number) => void
}

const ImageCard: React.FC<Iprops> = ({
                                       outimgInfo,
                                       setImgToScale,
                                       outsetImgInfo,
                                       setShowAddTo,
                                       inClip,
                                       removeFromClip,
                                       addBackToClip,
                                     }) => {
  const [imgInfo, setImgInfo] = useState<imgInfoType>(outimgInfo);
  const history = useHistory()
  const dispatch = useDispatch();
  const pictureState = useSelector<any, pictureStateType>(state => state.pictureState);

  return (
    <>
      {
        imgInfo &&
        <div
          className={styles['images-wrapper']}
          key={imgInfo.id}
        >
          <div className='img'>
            <img src={imgInfo.smallUrl} alt=""/>
            <div
              className="hover-icons"
              onClick={() => {
                //查看大图
                if (setImgToScale && outsetImgInfo) {
                  setImgToScale(true)
                  outsetImgInfo(imgInfo)
                }
              }}
            >
              {
                !inClip ?
                  <span
                    className={'iconfont icon-12'}
                    onClick={(e) => {
                      //图库 收藏
                      if (setShowAddTo && outsetImgInfo) {
                        setShowAddTo(true)
                        outsetImgInfo(imgInfo)
                      }
                      //画夹 加回收藏夹
                      if (addBackToClip) {
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
                      if (removeFromClip) {
                        removeFromClip(imgInfo.id)
                      }
                      e.stopPropagation();
                    }}
                  />
              }
              <span
                className={`${imgInfo.isStar===1?'stared': ''} iconfont icon-9`}
                onClick={(e) => {
                  e.stopPropagation();
                  if(imgInfo.isStar === 0){
                    console.log(imgInfo);
                    setImgInfo && setImgInfo({
                      ...imgInfo,
                      isStar: 1,
                      starCount: imgInfo.starCount+1
                    })
                    //点赞
                    setLike({picId: imgInfo.id})
                  } else {
                    setImgInfo && setImgInfo({
                      ...imgInfo,
                      isStar: 0,
                      starCount: imgInfo.starCount - 1
                    })
                    //取消点赞
                    cancelLike({picId: imgInfo.id})
                  }
                }}
              />
              <span
                className={'iconfont icon-13'}
                onClick={(e) => {
                  e.stopPropagation();
                  history.push('/create')
                  dispatch(setLoadedImages([
                    ...pictureState.loadedImages,
                    {
                      name: "LinkTo_IMG_" + imgInfo.id,
                      src: imgInfo.url,
                      id: imgInfo.id
                    }
                  ]))
                }}
              />
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
              {/*<li>
            浏览次数 暂无
            <span className={'iconfont icon-Show'}/>
            <p>1234</p>
          </li>*/}
            </ul>
          </div>
        </div>
      }
    </>
  )
};

export default ImageCard;