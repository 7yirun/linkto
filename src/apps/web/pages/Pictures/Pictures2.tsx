import Waterfall from "apps/web/components/WaterFall/Waterfall2";
import React, {useEffect, useState, useRef, SyntheticEvent} from "react";
import Header from "apps/web/components/Header/Header"
import {getSearchWords} from "../../../../service/service";
import "./Picture.scss"
import debounce from 'lodash/debounce.js'
import {useWindowResize} from "apps/web/hooks";
import {Dropdown} from "antd";
import {setDescription, StateType, SearchStateType, setConfirmSearch} from "apps/web/store/store";
import {useSelector, useDispatch} from 'react-redux'
import {queryImg} from "service/service"
import SeeBig from "../../components/SeeBig/SeeBig";
import AddToBookmark from "../../components/AddToBookmark/AddToBookmark";
import ImageCard from "../../components/ImageCard";
import {imgInfoType} from "../../components/ImageCard";
import {useMounted} from "apps/web/hooks";

const Pictures = () => {
  const dispatch = useDispatch();
  const searchState = useSelector<StateType, SearchStateType>(state => state.searchState)

  const isMounted = useMounted();
  /*瀑布流相关----------------------------------------------------------start*/
  const clientWidth = useWindowResize();
  const currentCols = useRef(Math.floor((clientWidth - 72) / 264))
  const currentWidth = Math.floor((clientWidth - 24 * currentCols.current - 72) / currentCols.current);
  const layout = {
    cols: currentCols.current,
    colWidth: currentWidth
  }
  //请求到了哪一页
  const pageNumRef = useRef<number>(1);

  const [imgList, setImgList] = useState<any[]>([])
  //瀑布流每一列总高度
  const heightArrRef = useRef<number[]>( []);
  const SCROLL_GAP = 300

  //如果是scroll触发的加载, 需要截住高频的load, 确保只请求一次
  //true表示下滑可以加载, false表示下滑不加载
  const scrollTriggerFlag = useRef(true);

  //是否已经请求到了最后一页
  const isLastPage = useRef(false);

  const loadImages = ()=>{
    if(currentCols.current <=0){return}
    heightArrRef.current = Array(currentCols.current).fill(0)
    for (let i = 0; i < imgList.length; i++) {
      //该元素排哪一列
      let colIndex = heightArrRef.current.findIndex((val, index) => {
        //浮点数不能用===判断
        const delta = 1e-3;
        return (val >= Math.min(...heightArrRef.current) - delta) && (val <= Math.min(...heightArrRef.current) + delta)
      })
      //图片宽度不一定等于列宽, 所以要对高度缩放
      heightArrRef.current[colIndex] += (imgList[i].high / imgList[i].width * currentWidth + 42);
    }
    // 最终排列好后最短列的高度
    let shortestHeight = Math.min(...heightArrRef.current);
    // 滚动出的距离
    let scrollTop = window.pageYOffset;
    //屏幕高度
    let screenHeight = window.innerHeight;
    if (shortestHeight - SCROLL_GAP <= scrollTop + screenHeight && scrollTriggerFlag.current && !isLastPage.current) {
      scrollTriggerFlag.current = false;
      console.log(searchState.confirmSearch);
      console.log(searchState.description);
      queryImg(searchState.confirmSearch ? {pageSize: 30, pageNum: pageNumRef.current++, description: searchState.description}:{pageSize: 30, pageNum: pageNumRef.current++}, (res: any) => {
        if(res.data.pages < pageNumRef.current){
          isLastPage.current = true;
        }
        setImgList([...imgList, ...res.data.list])
      })
    }
  }

  useEffect(()=>{
    console.log(searchState.confirmSearch, 'start====');

    //获取热门推荐词
    getSearchWords({
      topNum: 5,
      word: ''
    },({data}:{data: string[]})=>{
      setKeywords(data)
    })
    loadImages();
  }, [])
  useEffect(()=>{
    const handleScroll = loadImages
    window.addEventListener('scroll', handleScroll);
    return ()=>{
      window.removeEventListener('scroll', handleScroll)
    }
  }, [imgList, scrollTriggerFlag.current, isLastPage.current])

  useEffect(()=>{
    scrollTriggerFlag.current = true
    //响应回来之前不可继续搜索
    isMounted && dispatch(setConfirmSearch(false));
  }, [imgList])

  useEffect(() => {
    currentCols.current = Math.floor((clientWidth - 72) / 264);
    loadImages()
  }, [imgList, clientWidth])
  /*瀑布流相关----------------------------------------------------------end*/

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

  /*搜索相关-----------------------------------------------------------start*/
  //搜索下方的推荐关键词
  const [keywords, setKeywords] = useState<string[]>([''])
  useEffect(()=>{
    //搜索时 重置一些状态
    if(searchState.confirmSearch){
      pageNumRef.current = 1;
      setImgList([])
      isLastPage.current = false;
    }
  }, [searchState.confirmSearch])
  /*搜索相关-----------------------------------------------------------end*/

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
              <ImageCard
                key={imgInfo.id}
                outimgInfo={imgInfo}
                outsetImgInfo={setImgInfo}
                setImgToScale={setImgToScale}
                setShowAddTo={setShowAddTo}
              />
            )
          })
        }
      </Waterfall>
      {
        imgToScale && imgInfo &&
		    <SeeBig close={closeBig}
		            id={imgInfo.id}
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