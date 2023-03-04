import './Create.scss'
import CapsuleButton from 'apps/web/components/CapsuleButton/CapsuleButton'
import React from 'react'
import {useState, useRef, useEffect} from 'react'
import BScroll from '@better-scroll/core'
import ScrollBar from '@better-scroll/scroll-bar'
import MouseWheel from '@better-scroll/mouse-wheel'
import {queryKeywords, text2img, img2img, imgRefresh, getWords} from "service/service";
import AddToBookmark from "apps/web/components/AddToBookmark/AddToBookmark";
import {setStore, getStore, downloadURI} from "utils/utils"

import {
  setMapArr,
  setLanMap,
  setLoadedImages,
  SearchStateType,
  StateType, setDescription
} from "apps/web/store/store";
import {useDispatch, useSelector} from "react-redux"
import Slider from '@mui/material/Slider';
import {message, Dropdown} from 'antd'
import UpLoad from "apps/web/components/UpLoad/UpLoad";
import Paint from "apps/web/components/Paint/Konva2"
import type {MenuProps} from 'antd';
import Header from "apps/web/components/Header/Header"

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

export interface ILoadedImg {
  name: string,
  id: string,
  src: string
}

export type pictureStateType = {
  loadedImages: ILoadedImg[],
  canvasWidth: number,
  canvasHeight: number
  currentLayerId: string
}

export type LayerInfoType = {
  layerArr: LayerType[]
  currentLayerId: string
}
type LayerType = {
  name: string,
  layerId: string,
  imgUrl: string,
}

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
  const pictureState = useSelector<any, pictureStateType>(state => state.pictureState);
  const dataRef = useRef<any>(null);
  const konvaRef = useRef<any>(null);

  //生成按钮可否点击
  const [creatable, setCreatable] = useState(true);
  const [progress, setProgress] = useState(0);

  //创作模式,按文字或者图片创作
  const [mode, setMode] = useState(MODE.junior);

  //高级创作模式下用于切换工作台和图片展示区   //初始值必须是false, 避免高级创作创作好后一切换模式导致图片不见了
  const [isWork, setIsWork] = useState<boolean>(false);

  //用户输入描述信息
  const description = searchState.description;

  // 默认选中第0个dimension
  const [dimension, setDimension] = useState(Number(getStore('dimension', false)));  //Number(null) => 0

  //高级创作中可以自定义图片尺寸:
  // const customizeHeightRef = useRef<any>();
  // const customizeWidthRef = useRef<any>();

  const [displayDimension, setDisplayDimension] = useState<number>(dimension);

  const [relevance, setRelevance] = useState<number>(getStore('relevance', false) ? Number(getStore('relevance', false)) : 50); //默认相关性
  //图片相关性
  const [relevance2, setRelevance2] = useState(getStore('relevance2', false) ? Number(getStore('relevance2', false)) : 70); //默认相关性

  //steps
  const [steps, setSteps] = useState<number>(20)

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
    requestAnimationFrame(() => {
      (bsRef.current as any).refresh();
    })
  }
  const bsRef = useRef(null);

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
    // 清空Header里的搜索栏
    dispatch(setDescription(''))
    return () => {
      // setStore('description', dataRef.current.description, false)
      setStore('negInput', dataRef.current.negInput, false)
      setStore('dimension', dataRef.current.dimension, false)
      setStore('relevance', dataRef.current.relevance, false)
      setStore('relevance2', dataRef.current.relevance2, false)
    }
  }, [])

  //用户创作好的图片 初始只有4张
  const [createdImg, setCreatedImg] = useState([]);

  //行业词汇
  interface IWord {
    chinese: string,
    english: string,
    id: number
  }

  const [words, setWords] = useState<IWord[]>([])

  //选中的行业id
  const [choosedWords, setChoosedWords] = useState<number[]>([]);
  useEffect(() => {
    getWords({type: 1}, (res: { data: IWord[] }) => {
      setWords(res.data)
    })
    if (mode !== MODE.superior) {
      setIsWork(false);
    }
  }, [mode])

  //从外界图片的二次创作操作跳转过来
  useEffect(() => {
    //除去默认的背景图 还新增了别的图片
    if (pictureState.loadedImages.length > 1) {
      setIsWork(true);
      setMode(MODE.superior);
    }
  }, [pictureState.loadedImages])
  //创作图片
  const createImg = (e: any) => {
    e.preventDefault();
    //高级创作时去掉缩放框
    if(mode === MODE.superior){
      konvaRef.current.changeCurrentLayer('背景图层001')
    }
    //英文关键词数组
    let keywordArr = searchState.mapArr.join().split(',').filter(str => str);
    //行业词汇
    let profession: string = '';
    //进阶 高级 创作要传行业词汇
    if (mode === MODE.senior || mode === MODE.superior) {
      const tmp: string[] = [];
      choosedWords.forEach(id => {
        //行业用中文
        tmp.push(words.find(item => item.id == id)?.chinese || '')
      })
      profession = tmp.join();
    }
    const keyword = keywordArr.join();
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
    if (!description && !keyword) {
      //生成按钮和换一批按钮不可点击
      message.warning('请输入或选择描述词')
      return
    }
    if (mode === MODE.junior || mode === MODE.senior) {
      text2img({
        guidance: relevance * 15 / 100,
        width: DIMESNION_OPTION[dimension].width,
        height: DIMESNION_OPTION[dimension].height,
        numImages: 4,
        prompt: description,
        keywords: keyword,
        negativePrompt: negInput,
        profession: profession
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
        message.error(err.msg || '系统内部错误, 请稍后再试');
      })
    } else if (mode === MODE.superior) {
      if (pictureState.loadedImages.length <= 1) {
        message.warning('请上传至少一张图片');
        return
      }
      const {paint, mask} = konvaRef.current.generateImg()
      //@ts-ignore
      img2img({
        guidance: relevance * 15 / 100,
        initImageBase64: paint,
        maskBase64: mask,
        width: pictureState.canvasWidth,
        height: pictureState.canvasHeight,
        numImages: 1,
        prompt: description,
        keywords: keyword,
        strength: relevance2 / 100,
        negativePrompt: negInput,
        steps: steps,
      }, (res: any) => {
        setCreatable(false);
        setIsWork(false);
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
      }, (err: any) => {
        message.error(err.msg || '系统内部错误, 请稍后再试');
      })
    }
  }

  const [imgToAdd, setImgToAdd] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>();

  const cancelAdd = () => {
    setImgToAdd(false);
  }

  //设置当前选中的是哪个图层
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    konvaRef.current.changeCurrentLayer(e.key)
  };

  //将setLayerInfo方法传给Konva子组件. 子组件layer改变时调用setLayerInfo让父组件同步变化
  const [layerInfo, setLayerInfo] = useState<LayerInfoType>({
    layerArr: [{
      name: pictureState.loadedImages[0].name,
      layerId: pictureState.loadedImages[0].id,
      imgUrl: pictureState.loadedImages[0].src,
    }],
    currentLayerId: pictureState.loadedImages[0].id
  });




  const items: MenuProps['items'] = layerInfo.layerArr.map((layer: LayerType, index: number) => {
    return {
      label: (
        <p>
          {
            layer.imgUrl ?
              <img src={layer.imgUrl} alt=""/>
              :
              <span className="pure-color"></span>
          }
          <span>{layer.name}</span>
        </p>
      ),
      key: layer.layerId
    }
  })

  return (
    <>
      <Header></Header>
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
										<>
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
											<div className={'choose relevance'}>
												<p>生成步骤</p>
												<Slider
													min={5}
													max={50}
													value={steps}
													onChange={(e, newSteps) => {
                            setSteps(newSteps as number)
                          }}
												></Slider>
												<div className="percentage">{steps}</div>
											</div>
										</>
                  }
                  {/*<div className={'choose dimension'}>
                    <p>尺寸</p>
                    {
                      mode !== MODE.superior ?
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
                        :
                        <div className="free-dimension">
                          <div className="row">
                            <span className={'title'}>宽度</span>
                            <div className="adjust-group">
                              <span
                                className="adjust-down"
                                onClick={()=>{
                                  let width = pictureState.canvasWidth - 64;
                                  if(width < 512){
                                    width = 512
                                  }
                                  dispatch(setCanvasWidth(width))
                                }}
                              >
                                <i className={'iconfont icon-11'}></i>
                              </span>
                              <p>{pictureState.canvasWidth}</p>
                              <span
                                className="adjust-up"
                                onClick={()=>{
                                  let width = pictureState.canvasWidth + 64;
                                  if(width > 2048){
                                    width = 2048
                                  }
                                  dispatch(setCanvasWidth(width))
                                }}
                              >
                                <i className={'iconfont icon-1'}></i>
                              </span>
                            </div>
                          </div>
                          <div className="row">
                            <span className={'title'}>高度</span>
                            <div className="adjust-group">
                              <span
                                className="adjust-down"
                                onClick={()=>{
                                  let height = pictureState.canvasHeight - 64;
                                  if(height < 512){
                                    height = 512
                                  }
                                  dispatch(setCanvasHeight(height))
                                }}
                              >
                                <i className={'iconfont icon-11'}></i>
                              </span>
                              <p>{pictureState.canvasHeight}</p>
                              <span
                                className="adjust-up"
                                onClick={()=>{
                                  let height = pictureState.canvasHeight + 64;
                                  if(height > 2048){
                                    height = 2048
                                  }
                                  dispatch(setCanvasHeight(height))
                                }}
                              >
                                <i className={'iconfont icon-1'}></i>
                              </span>
                            </div>
                          </div>
                        </div>
                    }
                  </div>*/}
                  {
                    (mode === MODE.senior || mode === MODE.superior) &&
										<div className="choose choose-tags">
											<p>行业</p>
											<div className="tags-container">
												<div className="sub">
                          {
                            words.length > 0 && words.map((item: IWord) => {
                              return (
                                <CapsuleButton
                                  key={item.id}
                                  nobutton={1}
                                  data-checked={choosedWords.join().includes(item.id + '') ? 'checked' : 'unchecked'}
                                  onClick={() => {
                                    choosedWords.join().includes(item.id + '') ?
                                      setChoosedWords(choosedWords.filter(id => id !== item.id))
                                      :
                                      setChoosedWords([item.id, ...choosedWords])
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
                  }
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
                  <>
                    {
                      mode !== MODE.superior?
                        <CapsuleButton onClick={createImg} className={'create'}>开始创作</CapsuleButton>
                        :
                        isWork ? <CapsuleButton onClick={createImg} className={'create'}>开始创作</CapsuleButton> :
                        <CapsuleButton
                          onClick={() => {
                            setIsWork(!isWork);
                          }}>返回创作区</CapsuleButton>
                    }
                  </>
                  :
                  <CapsuleButton nobutton={1} className={'create disable'}>
                    <span className={'text'}>{`创作中(${progress}%)`}</span>
                    <span style={{transform: `translateX(${progress - 100}%)`, left: 0}} className={'progress'}/>
                  </CapsuleButton>
              }
              {
                mode === MODE.superior && isWork &&
								<CapsuleButton
									onClick={() => {
                    setIsWork(false);
                  }}
								>{"返回创作结果"}</CapsuleButton>
              }
            </div>
            {
              //高级创作的图片编辑工作区
              mode === MODE.superior && isWork &&
							<>
								<div className={'choose-layer'}>
									<span>图层</span>
									<Dropdown
										menu={{items: items, onClick: handleMenuClick}}
										trigger={['click']}
									>
                    {
                      <div>
                        <p>
                          {
                            layerInfo.currentLayerId === '背景图层001' ?
                              <span className={'pure-color'}></span> :
                              <img src={layerInfo.currentLayerId ?
                                layerInfo.layerArr.find((layer: LayerType) => layer.layerId === layerInfo.currentLayerId)?.imgUrl
                                :
                                layerInfo.layerArr[0].imgUrl} alt=""/>
                          }
                          <span>
                            {
                              layerInfo.currentLayerId
                                ?
                                layerInfo.layerArr.find((layer: LayerType) => layer.layerId === layerInfo.currentLayerId)?.name
                                :
                                layerInfo.layerArr[0].name
                            }
                          </span>
                        </p>
                        <span className="iconfont icon-down"></span>
                      </div>
                    }
									</Dropdown>
									<UpLoad></UpLoad>
									<span className={'iconfont icon-a-1'}></span>
									<span
										className={'delete-layer iconfont icon-24'}
										onClick={() => {
                      konvaRef.current.deleteLayer()
                    }}
									></span>
								</div>
								<Paint
									ref={konvaRef}
									updateLayerInfo={setLayerInfo}
								></Paint>
							</>
            }
            {/*创作好的图片展示区*/}
            {
              !isWork &&
							<div className="img-wrapper">
								<div className={`dim${displayDimension + 1} img-center ${mode === MODE.superior ? 'superior' : ''}`}>
                  {
                    mode === MODE.superior ?
                    [...Array(1 )].map((val, index) => (
                      <div key={index} className="img-placeholder">
                        <i className={'iconfont icon-4'}></i>
                        {
                          createdImg[index] &&
													<>
														<img src={`${createdImg[index]}?time=${Date.now()}`} alt=""/>
														<p className={"hover-icons"}>
													    <span
														    className={'iconfont icon-12'}
														    onClick={() => {
                                  setImgToAdd(true);
                                  setImgSrc(`${createdImg[index]}`);
                                }}
													    ></span>
															<span
																className={'iconfont icon-13'}
																onClick={() => {
                                  //二次创作
                                  setMode(MODE.superior);
                                  setIsWork(true);
                                  dispatch(setLoadedImages([...pictureState.loadedImages, {
                                    name: `picture${index + 1}`,
                                    src: `${createdImg[index]}?time=${Date.now()}`,
                                    id: `picture${index + 1}${Date.now()}`
                                  }]))
                                }}
															></span>
															<span className={'iconfont icon-16'}
															      onClick={() => {
                                      downloadURI(`${createdImg[index]}`, 'picture' + (index + 1));
                                    }}
															>
                            </span>
														</p>
													</>
                        }
                      </div>
                    )):
                      [...Array(4 )].map((val, index) => (
                        <div key={index} className="img-placeholder">
                          <i className={'iconfont icon-4'}></i>
                          {
                            createdImg.length > 1 &&
				                    <>
					                    <img src={`${createdImg[index]}?time=${Date.now()}`} alt=""/>
					                    <p className={"hover-icons"}>
													    <span
														    className={'iconfont icon-12'}
														    onClick={() => {
                                  setImgToAdd(true);
                                  setImgSrc(`${createdImg[index]}`);
                                }}
													    ></span>
						                    <span
							                    className={'iconfont icon-13'}
							                    onClick={() => {
                                    //二次创作
                                    setMode(MODE.superior);
                                    setIsWork(true);
                                    dispatch(setLoadedImages([...pictureState.loadedImages, {
                                      name: `picture${index + 1}`,
                                      src: `${createdImg[index]}?time=${Date.now()}`,
                                      id: `picture${index + 1}${Date.now()}`
                                    }]))
                                  }}
						                    ></span>
						                    <span className={'iconfont icon-16'}
						                          onClick={() => {
                                        downloadURI(`${createdImg[index]}`, 'picture' + (index + 1));
                                      }}
						                    >
                            </span>
					                    </p>
				                    </>
                          }
                        </div>
                      ))
                  }
								</div>
							</div>
            }
            {
              imgToAdd && imgSrc &&
							<AddToBookmark
								type={0}
								onCancle={cancelAdd}
								myPictureDto={{
                  url: imgSrc
                }}
							/>
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default Create;