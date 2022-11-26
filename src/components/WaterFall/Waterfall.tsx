import React, {useRef, useEffect, useState} from 'react';
import "./WaterFall.scss"
import Icons from "lib/icons"
import {queryImg} from "service/service"
import {useHistory} from "react-router-dom";
import PictureUnit from "components/PictureUnit/PictureUnit"
import AddToBookmark from "../AddToBookmark/AddToBookmark";

type Prop = {
  cols: number   //6
  colWidth: number  //204
}
//每次请求回来的图片数量
const batchImgNum: number = 30;
const Waterfall = ({cols, colWidth}: Prop) => {
  const heightArrRef = useRef<number[]>(Array(cols).fill(0))
  const [pageNum, setPageNum] = useState(2);
  const [imgList, setImgList] = useState<any>(
    []
  )
  // const firstRef = useRef(true);
  const position: any[] = [];
  const [imgToScale, setImgToScale] = useState('');
  const [dynamicPosition, setDynamicPosition] = useState<any>([]);
  const SCROLL_GAP = 300;
  const [imgToAdd, setImgToAdd] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>();
  const cancelAdd = () => {
    setImgToAdd(false);
  }
  const scrollHandler = () => {
    console.log(11111);
    // 最终排列好后最短列的高度
    let shortestHeight = Math.min(...heightArrRef.current);
    // 滚动出的距离
    let scrollTop = window.pageYOffset;
    //屏幕高度
    let screenHeight = window.innerHeight;
    if (shortestHeight - SCROLL_GAP <= scrollTop + screenHeight) {
      window.removeEventListener("scroll", scrollHandler);
      //加载新一批图片 高度数组需要重新清0
      queryImg({
        pageSize: batchImgNum,
        pageNum: pageNum
      }, (res: any) => {
        setPageNum((num) => {
          return num + 1
        });
        let list = res.data.list;
        setImgList(imgList.concat(list));
      })
      console.log(`${shortestHeight} - ${SCROLL_GAP} <= ${scrollTop} + ${screenHeight}`);
    }
  }
  //每次加载图片都需要compute
  const computeStyle = () => {
    heightArrRef.current = heightArrRef.current.map(val => 0);
    //所有图片加载完后
    for (let i = 0; i < imgList.length; i++) {
      //该元素排哪一列
      let colIndex = heightArrRef.current.findIndex((val, index) => {
        return val == Math.min(...heightArrRef.current)
      })
      position[i] = {
        left: colWidth * colIndex + colIndex * 24,  //column gap 24
        top: heightArrRef.current[colIndex],
      }
      /*bug *********************************************/
      if (!imgList[i].high) {
        imgList[i].height = 100;
      }
      /*bug *********************************************/
      heightArrRef.current[colIndex] += (imgList[i].high / imgList[i].width * colWidth + 58);
    }
    setDynamicPosition(position);
  }
  useEffect(() => {
    computeStyle();
    console.log(6666);
    if (imgList.length > 0) {
      console.log(4444);
      window.addEventListener('scroll', scrollHandler)
    }
  }, [imgList])

  // const imgLoadedRef = useRef(false);
  useEffect(() => {
    // window.addEventListener('scroll', scrollHandler);
    queryImg({
      pageSize: batchImgNum,
      pageNum: 1
    }, (res: any) => {
      let list = res.data.list;
      setImgList(list);
    })
    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [])
  const history = useHistory();
  const seeAritist = (id: number) => {
    //replace就回不去图库了 得用push
    (history as any).push("/see-artist/sub-mycreate/id=" + id);
  }
  const scaleImage = (url: string) => {
    return () => {
      setImgToScale(url)
    }
  }
  return (
    <div className="waterfall">
      {
        imgList.length > 0 &&
        imgList.map((img: any, i: number) => {
          return (
            <div key={img.id} className={'images-wrapper'}
                 style={{
                   width: colWidth,
                   left: dynamicPosition[i] ? dynamicPosition[i].left : "",
                   top: dynamicPosition[i] ? dynamicPosition[i].top : '',
                   height: img.high ? (img.high / img.width * colWidth) + 58 : 100,
                 }}
            >
              <div onClick={() => {
                setImgToAdd(true)
                setImgSrc(img.url)
              }} className='img'>
                <img src={img.smallUrl} alt=""/>
                {/* <div className="hover-icons">
                  <img src={Icons.seebig} alt=""/>
                  <img src={Icons.like} alt=""/>
                  <img src={Icons.download} alt=""/>
                  <img src={icons.} alt=""/>
                </div>*/}
              </div>
              <div className="artist">
                <i onClick={() => {
                  seeAritist(img.accountId)
                }} className={'artist-profile'}>
                  <img src={img.headPic} alt=""/>
                </i>
                <div className={'text'}>
                  <span className={'artist-name'}>{img.accountName}</span>
                  {/*<div className="like-wrapper">
                     <i className={'like'}>
                      <img src={Icons.like} alt=""/>
                    </i>
                    <span className={'like-count'}>{img.starCount}</span>
                  </div>*/}
                </div>
              </div>
            </div>
          )
        })
      }
      {
        imgToAdd && <AddToBookmark type={1} onCancle={cancelAdd} url={imgSrc}></AddToBookmark>
      }
    </div>
  )
};
export default Waterfall;