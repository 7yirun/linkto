import React, {useRef, useEffect, useState, useLayoutEffect} from 'react';
import "./WaterFall.scss"
import {queryImg} from "service/service"
import {useHistory} from "react-router-dom";
import AddToBookmark from "../AddToBookmark/AddToBookmark";
import {useSelector, useDispatch} from "react-redux";
import {SearchStateType, StateType, setConfirmSearch} from "../../store/store";
import SeeBig from "apps/web/components/SeeBig/SeeBig"


type Prop = {
  layout: {
    cols: number
    colWidth: number  //240}
  }
}
//每次请求回来的图片数量
const Waterfall = ({layout}: Prop) => {
  const dispatch = useDispatch();
  const searchState = useSelector<StateType, SearchStateType>(state => state.searchState)
  const batchImgNum: number = 30;
  const {cols, colWidth} = layout
  const heightArrRef = useRef<number[]>(Array(cols).fill(0));
  //记录当前请求了多少页图片
  const pageNumRef = useRef<number>(1);
  //记录当前是否正在请求图片,避免多次触发queryImg
  const isQuerying = useRef<Promise<void>>(Promise.resolve());
  const isMountedRef = useRef(false);
  const position: any[] = [];
  const [imgList, setImgList] = useState<any[]>([])
  const [imgToScale, setImgToScale] = useState<boolean>(false);
  const [dynamicPosition, setDynamicPosition] = useState<any>([]);
  const [imgToAdd, setImgToAdd] = useState(false);
  const SCROLL_GAP = 300;

  type imgInfoType = {
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
  const [imgInfo, setImgInfo] = useState<imgInfoType>();

  //关闭大图显示
  const closeBig = () => {
    setImgToScale(false);
  }

  //图库搜索的图片可能存在图不够, 如果图不够就不继续请求
  const isEndRef = useRef<boolean>(false)

  //关闭收藏夹弹窗
  const cancelAdd = () => {
    setImgToAdd(false);
  }

  useEffect(() => {
    isEndRef.current = false
    if (searchState.confirmSearch) {
      loadImages();
    }
  }, [searchState.confirmSearch])
  /*loadImages 配合useEffect完成递归========================start*/
  const loadImages = () => {
    /* if (searchState.confirmSearch) {
       setImgList([])
       dispatch(setConfirmSearch(false));
     }*/
    computeStyle();
    // 最终排列好后最短列的高度
    let shortestHeight = Math.min(...heightArrRef.current);
    // 滚动出的距离
    let scrollTop = window.pageYOffset;
    //屏幕高度
    let screenHeight = window.innerHeight;
      if (!isEndRef.current && shortestHeight - SCROLL_GAP <= scrollTop + screenHeight) {
        //需要加载新一批图片 高度数组需要重新清0
        const request: any = {
          pageSize: batchImgNum,
          pageNum: pageNumRef.current
        }
        queryImg(request, (res: any) => {
          //当已经请求到了图库的最后一页时,不再发送新请求:
          if (res.data.pages <= pageNumRef.current) {
            isEndRef.current = true
            pageNumRef.current = 1;
          } else {
            //如何没到最后一页, 则可以继续尝试loadImages
            pageNumRef.current += 1;
          }
          let list = res.data.list;
          setImgList(imgList.concat(list));
        })
      } else {
        //如果已加载的图片足够 则停止后续loadImages
        isQuerying.current = Promise.reject();
      }
    }
  useEffect(() => {
    isQuerying.current.then(()=>{
      loadImages()
    }).catch(err=>{
      console.log(err);
    });
  }, [imgList])

  /*loadImages 配合useEffect完成递归========================end*/
  const scrollHandlerRef = useRef(() => {
    loadImages();
  })

  //每次加载图片都需要compute
  const computeStyle = () => {
    if (imgList.length <= 0) {
      return
    }
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
      heightArrRef.current[colIndex] += (imgList[i].high / imgList[i].width * colWidth + 58);
    }
    console.log(heightArrRef.current, 'computedStyle');
    setDynamicPosition(position);
  }


  //对页面重新布局, 如果图片不够还需要加载新图
  //第一次mount时不需要触发, 后续resize才触发
  /*useEffect(() => {
    if (!isMountedRef.current) {
      return
    }
    //mounted之后才检测是否需要load图片 resize会使父组件传过来的cols,colWidth变化
    loadImages();
  }, [layout])*/

  useEffect(() => {
    // isMountedRef.current = true;
    // window.addEventListener('scroll', scrollHandlerRef.current);
    // loadImages();
    return () => {
      // window.removeEventListener('scroll', scrollHandlerRef.current)
    }
  }, [])
  const history = useHistory();
  const seeAritist = (id: number) => {
    //replace就回不去图库了 得用push
    (history as any).push("/see-artist/sub-mycreate/id=" + id);
  }

  return (
    <div className="waterfall">
      {
        imgList.length > 0 &&
        imgList.map((img: any, i: number) => {
          return (
            <div
              key={img.id}
              className={'images-wrapper'}
              style={{
                width: colWidth,
                left: dynamicPosition[i] ? dynamicPosition[i].left : "",
                top: dynamicPosition[i] ? dynamicPosition[i].top : '',
                height: img.high ? (img.high / img.width * colWidth) + 58 : 100,
              }}
            >
              <div className='img'>
                <img src={img.smallUrl} alt=""/>
                <div
                  className="hover-icons"
                  onClick={() => {
                    setImgToScale(true)
                    setImgInfo(img)
                  }}
                >
                  <span
                    className={'iconfont icon-12'}
                    onClick={(e) => {
                      //收藏
                      setImgToAdd(true)
                      setImgInfo(img)
                      e.stopPropagation();
                    }}
                  ></span>
                  <span className={'iconfont icon-9'}></span>
                  <span className={'iconfont icon-13'}></span>
                </div>
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
        imgToAdd && <AddToBookmark type={1} onCancle={cancelAdd} url={imgInfo?.url}></AddToBookmark>
      }
      {
        imgToScale &&
				<SeeBig close={closeBig}
				        info={imgInfo}
				/>
      }
    </div>
  )
};
export default React.memo(Waterfall,
  (pre, next) => pre.layout.cols === next.layout.cols && pre.layout.colWidth === next.layout.colWidth
);