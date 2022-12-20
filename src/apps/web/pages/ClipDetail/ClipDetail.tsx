import React, {useEffect, useState, useRef} from 'react';
import Icons from "lib/icons"
import style from "./ClipDetail.module.scss"
import {clipPictures, setPicture, queryImg, addToBookMark, removeFromBookMark} from "service/service"
import Header from "apps/web/components/Header/Header"
import Waterfall from "apps/web/components/WaterFall/Waterfall2"
import qs from "qs"
import {useWindowResize} from "../../hooks";
import ImageCard from "../../components/ImageCard";
import {imgInfoType} from "../../components/ImageCard"

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
  /*收藏相关--------------------------------start*/
  const [showAddTo, setShowAddTo] = useState(false);
  //记录图片收藏 / 取消收藏的状态
  const [inClip, setInClip] = useState<boolean[]>([])
  const cancelAdd = () => {
    setShowAddTo(false)
  }
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
  const handleSetPublic = (id: number, index: number) => {
    return () => {
      setPicture({
        isPrivate: 0,
        picId: id
      }, () => {
        let templist = [...list];
        // @ts-ignore
        templist[index].isPrivate = 0;
        setList(templist)
      })
    }
  }
  const handleSetPrivate = (id: number, index: number) => {
    return () => {
      setPicture({
        isPrivate: 1,
        picId: id
      }, () => {
        let templist = [...list];
        // @ts-ignore
        templist[index].isPrivate = 1;
        setList(templist)
      })
    }
  }

  const firstRef = useRef(true);
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
          {/*<div className="owner">
            <img src={} alt=""/>
            <p>画夹拥有者名字</p>
          </div>*/}
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
                      imgInfo={imgInfo}
                      setImgInfo={setImgInfo}
                      setImgToScale={setImgToScale}
                      setShowAddTo={setShowAddTo}
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
    </div>
  )
}

export default ClipDetail;