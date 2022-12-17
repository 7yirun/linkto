import Waterfall from "apps/web/components/WaterFall/Waterfall2";
import React, {useEffect, useState, useRef, SyntheticEvent} from "react";
import Header from "apps/web/components/Header/Header"
import {getSearchWords} from "../../../../service/service";
import "./Picture.scss"
import Icons from "lib/icons"
import debounce from 'lodash/debounce.js'
import {useWindowResize} from "apps/web/hooks";
import {Dropdown} from "antd";
import {setDescription, StateType, SearchStateType, setConfirmSearch} from "apps/web/store/store";
import {useSelector, useDispatch} from 'react-redux'
import {queryImg} from "service/service"
import SeeBig from "../../components/SeeBig/SeeBig";
import AddToBookmark from "../../components/AddToBookmark/AddToBookmark";

const Pictures = () => {
  const dispatch = useDispatch();

  /*瀑布流相关----------------------------------------------------------start*/
  const clientWidth = useWindowResize();
  const currentCols = Math.floor((clientWidth - 72) / 264);
  const currentWidth = Math.floor((clientWidth - 24 * currentCols - 72) / currentCols);
  const layout = {
    cols: currentCols,
    colWidth: currentWidth
  }
  //请求到了哪一页
  const pageNumRef = useRef<number>(1);

  const [imgList, setImgList] = useState<any[]>([])
  //瀑布流每一列总高度
  const heightArrRef = useRef<number[]>( []);
  const SCROLL_GAP = 300
  const loadImages = ()=>{
    if(currentCols <=0){return}
    heightArrRef.current = Array(currentCols).fill(0)
    for (let i = 0; i < imgList.length; i++) {
      //该元素排哪一列
      let colIndex = heightArrRef.current.findIndex((val, index) => {
        //浮点数不能用===判断
        const delta = 1e-3;
        return (val >= Math.min(...heightArrRef.current) - delta) && (val <= Math.min(...heightArrRef.current) + delta)
      })
      //图片宽度不一定等于列宽, 所以要对高度缩放
      heightArrRef.current[colIndex] += (imgList[i].high / imgList[i].width * currentWidth + 58);
    }
    // 最终排列好后最短列的高度
    let shortestHeight = Math.min(...heightArrRef.current);
    // 滚动出的距离
    let scrollTop = window.pageYOffset;
    //屏幕高度
    let screenHeight = window.innerHeight;
    console.log((shortestHeight - SCROLL_GAP <= scrollTop + screenHeight));
    if (shortestHeight - SCROLL_GAP <= scrollTop + screenHeight) {
      console.log('图不够');
      console.log(pageNumRef.current);
      queryImg({pageSize: 30, pageNum: pageNumRef.current++}, (res: any) => {
        setImgList([...imgList, ...res.data.list])
      })
    }
  }
  const getHeightArr = () => {
    if (imgList.length <= 0) {
      return
    }
  }

  useEffect(()=>{
    // 清空Header里的搜索栏
    dispatch(setDescription(''))
    getSearchWords({
      topNum: 5,
      word: ''
    },({data}:{data: string[]})=>{
      setKeywords(data)
    })
  }, [])

  useEffect(() => {
    loadImages()
    //取出图片高度得到此时的图片高度数组
    getHeightArr()
  }, [imgList, clientWidth])
  /*瀑布流相关----------------------------------------------------------end*/

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
  //当前点击的图片信息 用于收藏 / 查看大图
  const [imgInfo, setImgInfo] = useState<imgInfoType>();
  /*收藏相关--------------------------------start*/
  const [showAddTo, setShowAddTo] = useState(false);
  const cancelAdd=()=>{
    setShowAddTo(false)
  }
  /*收藏相关--------------------------------end*/
  /*显示大图--------------------------------start*/
  const [imgToScale, setImgToScale] = useState<boolean>(false);
  //关闭大图显示
  const closeBig = () => {
    setImgToScale(false);
  }
  /*显示大图--------------------------------end*/

  //搜索下方的推荐关键词
  const [keywords, setKeywords] = useState<string[]>([''])

  return (
    <div className={'pictures'}>
      <Header></Header>
      <div className="similar-words-wrapper">
        <ul className="similar-words">
          {
            keywords.map((word: string, i) => {
              return (
                <li
                  key={i}
                  onClick={() => {
                    dispatch(setDescription(word))
                    dispatch(setConfirmSearch(true));
                  }}
                >{word}</li>
              )
            })
          }
        </ul>
      </div>
      <Waterfall
        layout={layout}
        heightArr={imgList.map((imgInfo, i)=>(imgInfo.high / imgInfo.width * layout.colWidth + 42))}
      >
        {
          imgList.map(imgInfo=>{
            return (
              <div
                className={'images-wrapper'}
                key={imgInfo.id}
              >
                <div className='img'>
                  <img src={imgInfo.smallUrl} alt=""/>
                  <div
                    className="hover-icons"
                    onClick={() => {
                      setImgToScale(true)
                      setImgInfo(imgInfo)
                    }}
                  >
                  <span
                    className={'iconfont icon-12'}
                    onClick={(e) => {
                      //收藏
                      setShowAddTo(true)
                      setImgInfo(imgInfo)
                      e.stopPropagation();
                    }}
                  ></span>
                    <span className={'iconfont icon-9'}></span>
                    <span className={'iconfont icon-13'}></span>
                  </div>
                </div>
                <div className="artist">
                  <ul>
                    <li>
                      <span className={'iconfont icon-12'}></span>
                      <p>1234</p>
                    </li>
                    <li>
                      <span className={'iconfont icon-9'}></span>
                      <p>1234</p>
                    </li>
                    <li>
                      <span className={'iconfont icon-Show'}></span>
                      <p>11234</p>
                    </li>
                  </ul>
                </div>
              </div>
            )
          })
        }
      </Waterfall>
      {
        imgToScale &&
		    <SeeBig close={closeBig}
		            info={imgInfo}
		    />
      }
      {
        showAddTo && imgInfo &&
          <AddToBookmark
            type={1}
            myPictureDto={{url: imgInfo.url}}
            picId={imgInfo.id}
            onCancle={cancelAdd}
        />
      }
    </div>
  )
}
export default Pictures