import './Create.scss'
import CapsuleButton from 'apps/web/components/CapsuleButton/CapsuleButton'
import React from 'react'
import {useState, useRef, useEffect} from 'react'
import BScroll, {createBScroll} from '@better-scroll/core'
import ScrollBar from '@better-scroll/scroll-bar'
import MouseWheel from '@better-scroll/mouse-wheel'
import Icons from "lib/icons"
import {queryKeywords, text2img, img2img, imgRefresh} from "service/service";
import AddToBookmark from "apps/web/components/AddToBookmark/AddToBookmark";
import SeeBig from "apps/web/components/SeeBig/SeeBig";
import qs from "qs";
import {setStore, getStore} from "utils/utils"
import {setMapArr, setLanMap} from "apps/web/store/store";
import {useDispatch, useSelector} from "react-redux"
import {SearchStateType, StateType} from "../../components/Search/Search";
import Slider from '@mui/material/Slider';
import {message} from 'antd'
import UpLoad from "apps/web/components/UpLoad/UpLoad";

BScroll.use(ScrollBar);
BScroll.use(MouseWheel);

const DIMESNION_OPTION = [
  {
    width: 512,
    height: 512
  },
  {
    width: 512,
    height: 768
  },
  {
    width: 768,
    height: 512
  }
]

const Create = (props: any) => {
  message.config({
    duration: 2,
    maxCount: 1
  })

  enum MODE {
    junior,
    senior,
    superior
  }

  const dispatch = useDispatch();
  const searchState = useSelector<StateType, SearchStateType>(state => state.searchState)

  const dataRef = useRef<any>(null);
  //生成按钮可否点击
  const [creatable, setCreatable] = useState(true);
  const [progress, setProgress] = useState(0);

  //图片的预览链接 由本地生成
  const [previewUrl, setPreviewUrl] = useState('');

  const MAX_LENGTH = 200; //可输入的最大文字个数
  //创作模式,按文字或者图片创作
  const [mode, setMode] = useState(MODE.junior);

  //用户输入描述信息
  const description = searchState.description;

  // 默认选中第0个dimension
  const [dimension, setDimension] = useState(Number(getStore('dimension', false)));  //Number(null) => 0

  const [displayDimension, setDisplayDimension] = useState<number>(dimension);

  const [relevance, setRelevance] = useState<number>(getStore('relevance', false) ? Number(getStore('relevance', false)) : 50); //默认相关性
  //图片相关性
  const [relevance2, setRelevance2] = useState(getStore('relevance2', false) ? Number(getStore('relevance2', false)) : 70); //默认相关性

  //高级创作模式下用于切换工作台和图片展示区
  const [isWork, setIsWork] = useState<boolean>(false);

  //剩余的选择项(除去宽高+相关性以外的)
  // const [activeKeyWord, setActiveKeyWord] = useState([]);
  // const activeWordIndex, setActiveWordIndex

  //输入框里的negtive keyword
  const [negInput, setNegInput] = useState(getStore('negInput', false) || '');

  //后端获取的keywords
  const [keyWords, setKeyWords] = useState([]);

  //为了卸载前能保存用户输入的这两个值
  useEffect(() => {
    dataRef.current = {
      description,
      negInput,
      dimension,
      relevance,
      relevance2
    }
  }, [description, negInput, dimension, relevance, relevance2])


  //切换文字创作 / 图片创作 模式
  const changeModeTo = (mode: MODE) => {
    setMode(mode);
    setPreviewUrl('');
    requestAnimationFrame(() => {
      (bsRef.current as any).refresh();
    })
  }
  const bsRef = useRef(null);

  let bs: any;
  useEffect(() => {
    let willUnmount = false;
    bsRef.current = new BScroll('.choose-style-limit', {
      scrollY: true,
      disableMouse: true,
      scrollbar: {
        fade: false
      },
      bounce: false,
      mouseWheel: {}
    });
    queryKeywords((res: any) => {
      if (!willUnmount) {
        const list = res.data.childList
        //mapArr
        let temp: any = [];
        //lanMap
        let temp2: { [key: string]: string } = {};
        for (let i = 0; i < list.length; i++) {
          temp[i] = [];
          for (let j = 0; j < list[i].childList.length; j++) {
            temp[i][j] = "";
            temp2[(list[i].childList[j].english) as string] = list[i].childList[j].chinese
          }
        }
        dispatch(setMapArr(temp))
        dispatch(setLanMap(temp2))
        setKeyWords(list);
        (bsRef.current as any).refresh()
      }
      return () => {
        willUnmount = true;
      }
    })

    return () => {
      setStore('description', dataRef.current.description, false)
      setStore('negInput', dataRef.current.negInput, false)
      setStore('dimension', dataRef.current.dimension, false)
      setStore('relevance', dataRef.current.relevance, false)
      setStore('relevance2', dataRef.current.relevance2, false)
    }
  }, [])

  //用户创作好的图片 初始只有4张
  const [createdImg, setCreatedImg] = useState([]);

  const fileRef = useRef<any>();
  //创作图片
  const createImg = (e: any) => {
    e.preventDefault();

    const keyword = searchState.mapArr.join().split(',').filter(str => str).join();
    let taskId: string;
    //要发给后端的关键词
    const success = (res: any) => {
      setProgress(res.data.progress);
      if (res.data.finished) {
        setCreatedImg(res.data.imageUrls);
        setCreatable(true);
        return
      }
      if (res.data.updated) {
        setCreatedImg(res.data.imageUrls);
      }
      setTimeout(() => {
        imgRefresh({taskId: taskId}, success)
      }, 1000)
    }
    if (mode === MODE.junior) {
      if (!description && !keyword) {
        //生成按钮和换一批按钮不可点击
        message.warning('请输入或选择描述词')
        return
      }
      text2img({
        guidance: relevance * 15 / 100,
        width: DIMESNION_OPTION[dimension].width,
        height: DIMESNION_OPTION[dimension].height,
        numImages: 4,
        prompt: description,
        keywords: keyword,
        negativePrompt: negInput
      }, (res: any) => {
        //生成的图片按照所选尺寸显示
        setDisplayDimension(dimension)
        //清空已生成图片 显示默认占位图
        setCreatedImg([]);
        setProgress(0);
        setCreatable(false);
        taskId = res.data.taskId;
        imgRefresh({
          taskId: taskId
        }, success)
      }, (err: any) => {
        console.log('创作失败', err);
        //创作失败时 创作按钮恢复成初始状态, 不要卡在0%
        //#TODO===========================================
        message.error(err.msg || '系统内部错误, 请稍后再试');
      })
    } else if (mode === MODE.superior && fileRef.current) {
      if (fileRef.current.files && !fileRef.current.files[0]) {
        alert('请上传图片')
        return
      }
      setCreatable(false);
      //@ts-ignore
      img2img({
        guidance: relevance * 15 / 100,
        initImage: fileRef.current.files[0],
        width: DIMESNION_OPTION[dimension].width,
        height: DIMESNION_OPTION[dimension].height,
        numImages: 4,
        prompt: description,
        keywords: keyword,
        strength: relevance2 / 100,
        negativePrompt: negInput
      }, (res: any) => {
        //生成的图片按照所选尺寸显示
        setDisplayDimension(dimension)
        //清空已生成图片 显示默认占位图
        setCreatedImg([]);
        setCreatable(false);
        setProgress(0);
        taskId = res.data.taskId;
        imgRefresh({
          taskId: taskId
        }, success)
      })
    }
  }
  const [imgSrc, setImgSrc] = useState<string>();
  const [imgToScale, setImgToScale] = useState(false);
  const [imgToAdd, setImgToAdd] = useState(false);
  const closeBig = () => {
    setImgToScale(false);
  }
  const cancelAdd = () => {
    setImgToAdd(false);
  }
  return (
    <div className="create-page">
      <div className="create-page-content">
        <div className="left">
          <div className="choose-mode">
            <CapsuleButton onClick={() => {
              changeModeTo(MODE.junior)
            }} className={mode == MODE.junior ? 'active' : ''}>普通模式</CapsuleButton>
            <CapsuleButton onClick={() => {
              changeModeTo(MODE.senior)
            }} className={mode == MODE.senior ? 'active' : ''}>进阶模式</CapsuleButton>
            <CapsuleButton onClick={() => {
              changeModeTo(MODE.superior)
              setIsWork(true);
            }} className={mode == MODE.superior ? 'active' : ''}>高级模式</CapsuleButton>
          </div>
          <div className="choose-style">
            <div className="choose-style-limit">
              <div className="choose-style-content">
                <div className={'choose relevance'}>
                  <p>文字相关性</p>
                  <Slider
                    value={relevance}
                    onChange={(e, newRelevance) => {
                      setRelevance(newRelevance as number)
                    }}
                  />
                  <div className="percentage">{`${relevance}%`}</div>
                </div>
                {
                  mode === MODE.superior &&
									<div className={'choose relevance'}>
										<p>图片相关性</p>
										<Slider
											value={relevance2}
											onChange={(e, newRelevance) => {
                        setRelevance2(newRelevance as number)
                      }}
										></Slider>
										<div className="percentage">{`${relevance2}%`}</div>
									</div>
                }
                <div className={'choose dimension'}>
                  <p>尺寸</p>
                  <div className='dimension-options'>
                    {
                      DIMESNION_OPTION.map((item, index) => {
                        return (
                          <CapsuleButton nobutton={1}
                                         key={index}
                                         data-checked={dimension === index ? "checked" : "unchecked"}
                                         onClick={() => {
                                           setDimension(index)
                                         }}
                          >
                            {`${item.width}*${item.height}`}
                          </CapsuleButton>
                        )
                      })
                    }
                  </div>
                </div>
                <>
                  {
                    keyWords.map((val: any, index) => {
                      return (
                        <div key={val.id} className="choose choose-tags">
                          <p>{val.chinese}</p>
                          <div className="tags-container">
                            <div className="sub">
                              {
                                val.childList && val.childList.map((item: any, i: number) => {
                                  return (
                                    <CapsuleButton
                                      key={item.id}
                                      nobutton={1}
                                      data-checked={searchState.mapArr[index][i] ? 'checked' : 'unchecked'}
                                      onClick={() => {
                                        //如果已选中
                                        if (searchState.mapArr[index][i]) {
                                          // let temp = [...searchState.mapArr]; 这样写temp无法修改数组元素 cannot assign read only...
                                          let temp: string[][] = [];
                                          for (let i = 0; i < searchState.mapArr.length; i++) {
                                            temp[i] = []
                                            for (let j = 0; j < searchState.mapArr[i].length; j++) {
                                              temp[i][j] = searchState.mapArr[i][j];
                                            }
                                          }
                                          temp[index][i] = ''
                                          dispatch(setMapArr(temp));
                                        } else {
                                          // let temp = [...searchState.mapArr]; 这样写temp无法修改数组元素 cannot assign read only...
                                          let temp: string[][] = [];
                                          for (let i = 0; i < searchState.mapArr.length; i++) {
                                            temp[i] = []
                                            for (let j = 0; j < searchState.mapArr[i].length; j++) {
                                              temp[i][j] = searchState.mapArr[i][j];
                                            }
                                          }
                                          temp[index][i] = item.english;
                                          dispatch(setMapArr(temp));
                                        }
                                      }}
                                    >
                                      {item.chinese}
                                    </CapsuleButton>
                                  )
                                })
                              }
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                  {
                    mode === MODE.superior &&
										<div className={'upload-img'}>
											图片预览区
											<img src={previewUrl} alt=""/>
										</div>
                  }
                </>
                <div style={{height: 0}}></div>
              </div>
            </div>
          </div>
          <div className="negative-prompt">
            <div className="input-negative">
              <textarea
                value={negInput}
                className={'neg-prompt'}
                placeholder={'在此输入不想要的关键词：'}
                onChange={(e) => {
                  if (e.target.value.length > 100) {
                    return;
                  }
                  setNegInput(e.target.value)
                }}
              >
              </textarea>
              <div className="text-limit">{negInput.length + '/100'}</div>
            </div>
          </div>
        </div>
        <div className="right">
          {/*开始创作按钮 高级创作切换工作台和展示区的按钮*/}
          <div className="operate-buttons">
            {
              creatable ?
                <CapsuleButton onClick={createImg} className={'create'}>开始创作</CapsuleButton>
                :
                <CapsuleButton nobutton={1} className={'create disable'}>
                  <span className={'text'}>{`创作中(${progress}%)`}</span>
                  <span style={{transform: `translateX(${progress - 100}%)`, left: 0}} className={'progress'}/>
                </CapsuleButton>
            }
            {
              mode === MODE.superior && !isWork &&
							<CapsuleButton>返回创作区</CapsuleButton>
            }
          </div>
          {
            //高级创作的图片编辑工作区
            mode === MODE.superior && isWork &&
						<>
              <div className={'choose-layer'}>
                <span>图层</span>
                <span className={'iconfont icon-a-1'}></span>
              </div>
							<div>
								绘图区
							</div>
            </>
          }
          {/*创作好的图片展示区*/}
          {
            !isWork &&
            <div className="img-wrapper">
              <div className={`dim${displayDimension + 1} img-center`}>
                {
                  [...Array(4)].map((val, index) => (
                    <div key={index} className="img-placeholder">
                      <i className={'iconfont icon-4'}></i>
                      {
                        createdImg[index] &&
							          <>
								          <img src={`${createdImg[index]}?time=${Date.now()}`} alt=""/>
								          <p className={"hover-icons"}>
									          <span className={'iconfont icon-12'}></span>
									          <span className={'iconfont icon-9'}></span>
									          <span className={'iconfont icon-13'}></span>
									          <span className={'iconfont icon-16'}></span>
								          </p>
							          </>
                      }
                    </div>
                  ))
                }
              </div>
            </div>
          }

          {/*{
            imgToAdd && <AddToBookmark type={0} onCancle={cancelAdd} url={imgSrc}></AddToBookmark>
          }*/}
        </div>
      </div>
      {/*{
        imgToScale &&
				<SeeBig close={closeBig} url={imgSrc}/>
      }*/}
    </div>
  );
};

export default Create;