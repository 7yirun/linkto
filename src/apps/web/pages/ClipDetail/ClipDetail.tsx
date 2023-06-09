import React, {useEffect, useState, useRef} from 'react';
import style from "./ClipDetail.module.scss"
import {clipPictures, setPicture, addToBookMark, removeFromBookMark} from "service/service"
import Header from "apps/web/components/Header/Header"
import Waterfall from "apps/web/components/WaterFall/Waterfall2"
import qs from "qs"
import {useWindowResize} from "../../hooks";
import ImageCard from "../../components/ImageCard";
import {imgInfoType} from "../../components/ImageCard"
import SeeBig from "../../components/SeeBig/SeeBig";

const ClipDetail = (props: any) => {
  const para = qs.parse(props.history.location.search.replace('?', ""))
  //画夹id
  const id = Number(para.id);
  const clientWidth = useWindowResize();
  const currentCols = Math.floor((clientWidth - 72) / 264)
  const currentWidth = Math.floor((clientWidth - 24 * currentCols - 72) / currentCols);
  const layout = {
    cols: currentCols,
    colWidth: currentWidth
  }

  //当前点击的图片信息 用于收藏 / 查看大图
  const [imgInfo, setImgInfo] = useState<imgInfoType>();

  //记录图片收藏 / 取消收藏的状态
  const [inClip, setInClip] = useState<boolean[]>([])

  const handleAddToClip = (picId: number) => {
    const index = list.findIndex((imgInfo: imgInfoType) => imgInfo.id === picId);
    console.log(index);
    addToBookMark({
      picId: picId,
      picClipId: id
    }, () => {
      setInClip(inClip.map((v, i) => {
        if (i === index) {
          return true
        }
        return v
      }))
    })
  }
  const handleRemoveFromClip = (picId: number) => {
    const index = list.findIndex((imgInfo: imgInfoType) => imgInfo.id === picId);
    removeFromBookMark({
      picId: picId,
      pictureClipId: id
    }, () => {
      setInClip(inClip.map((v, i) => {
        if (i === index) {
          return false
        }
        return v
      }))
    });
  }
  /*收藏相关--------------------------------end*/
  /*显示大图--------------------------------start*/
  const [imgToScale, setImgToScale] = useState<boolean>(false);
//关闭大图显示
  const closeBig = () => {
    setImgToScale(false);
  }
  /*显示大图--------------------------------end*/

//显示 私密/公开按钮
// const {showPrivate = false} = props;
//显示 收藏/取消收藏按钮
// const {showBookmark = false} = props;
  const [list, setList] = useState([]);
  const [clipName, setClipName] = useState('');
  useEffect(() => {
    clipPictures({
      id: id
    }, (res: any) => {
      setClipName(res.data.name)
      setList(res.data.pictureList);
      setInClip(Array(res.data.pictureList.length).fill(true));
    })
  }, [])

  return (
    <div className={'clip-detail'}>
      <Header></Header>
      <div className={style["content"]}>
        <div className="clip-name">
          {
            clipName
          }
        </div>
        <div className="pictures-list">
          {
            layout.cols > 0 &&
						<Waterfall
							layout={layout}
							heightArr={list.map((imgInfo: imgInfoType, i) => (imgInfo.high / imgInfo.width * layout.colWidth + 42))}
						>
              {
                list.map((imgInfo: imgInfoType, index) => {
                  return (
                    <ImageCard
                      key={imgInfo.id}
                      inClip={inClip[index]}
                      outimgInfo={imgInfo}
                      outsetImgInfo={setImgInfo}
                      setImgToScale={setImgToScale}
                      removeFromClip={handleRemoveFromClip}
                      addBackToClip={handleAddToClip}
                    />
                  )
                })
              }
						</Waterfall>
          }
        </div>
      </div>
      {
        imgToScale && imgInfo &&
		    <SeeBig
          close={closeBig}
		      id={imgInfo.id}
		    />
      }
    </div>
  )
}

export default ClipDetail;