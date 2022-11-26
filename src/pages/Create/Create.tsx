import './Create.scss'
import CapsuleButton from 'components/CapsuleButton/CapsuleButton'
import React from 'react'
import {useState, useRef, useEffect} from 'react'
import BScroll, {createBScroll} from '@better-scroll/core'
import ScrollBar from '@better-scroll/scroll-bar'
import MouseWheel from '@better-scroll/mouse-wheel'
import Icons from "lib/icons"
import {queryKeywords, text2img, img2img, imgRefresh} from "../../service/service";
import AddToBookmark from "components/AddToBookmark/AddToBookmark";
import SeeBig from "components/SeeBig/SeeBig";
import qs from "qs";
import {setStore, getStore} from "utils/utils"

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
  enum MODE {
    Text,
    Picture
  }
   const dataRef = useRef<any>(null);
  //生成按钮可否点击
  const [creatable, setCreatable] = useState(true);
  const [progress, setProgress] = useState(0);

  //图片的预览链接 由本地生成
  const [previewUrl, setPreviewUrl] = useState('');

  const MAX_LENGTH = 200; //可输入的最大文字个数
  //创作模式,按文字或者图片创作
  const [mode, setMode] = useState(MODE.Text);
  //用户输入描述信息
  //@ts-ignore
  const str: string = qs.parse(props.location.search.replace('?', '')).search || getStore('description', false) || '';
  const [description, setDescription] = useState(str);
  // 默认选中第0个dimention
  const [dimention, setDimention] = useState(Number(getStore('dimention', false)));  //Number(null) => 0
  const [relevance, setRelevance] = useState(getStore('relevance', false)?Number(getStore('relevance', false)) : 50); //默认相关性
  //图片相关性
  const [relevance2, setRelevance2] = useState(getStore('relevance2', false)?Number(getStore('relevance2', false)) :70); //默认相关性

  const [showRow, setShowRow] = useState(false);

  //剩余的选择项(除去宽高+相关性以外的)
  const [activeKeyWord, setActiveKeyWord] = useState([]);
  // const activeWordIndex, setActiveWordIndex

  //输入框里的negtive keyword
  const [negInput, setNegInput] = useState(getStore('negInput', false) || '');

  //英文转中文
  const [lanMap, setLanMap] = useState({});

  //后端获取的keywords
  const [keyWords, setKeyWords] = useState([]);
  const [mapArr, setMapArr] = useState<string[][]>([['']]);

  //为了卸载前能保存用户输入的这两个值
  useEffect(()=>{
    dataRef.current = {
      description,
      negInput,
      dimention,
      relevance,
      relevance2
    }
  }, [description, negInput, dimention, relevance, relevance2])


  //切换文字创作 / 图片创作 模式
  const changeModeTo = (mode: MODE) => {
    setMode(mode);
    setPreviewUrl('');
    requestAnimationFrame(() => {
      (bsRef.current as any).refresh();
    })
  }

  const slideRef = useRef(null);
  const slideRef2 = useRef(null);
  // const textRef = useRef(null);
  const mousemove = useRef(
    (e: any) => {
      let ratio = Math.round(e.offsetX / 320 * 100);
      if (ratio < 0) {
        ratio = 0
      } else if (ratio > 100) {
        ratio = 100;
      }
      setRelevance(() => {
        return ratio
      });
    }
  )
  const mousemove2 = useRef(
    (e: any) => {
      let ratio = Math.round(e.offsetX / 320 * 100);
      if (ratio < 0) {
        ratio = 0
      } else if (ratio > 100) {
        ratio = 100;
      }
      setRelevance2(() => {
        return ratio
      });
    }
  )
  const mouseup = useRef(
    () => {
      slideRef.current && (slideRef.current as any).parentNode.removeEventListener('mousemove', mousemove.current);
      slideRef2.current && (slideRef2.current as any).parentNode.removeEventListener('mousemove', mousemove2.current);
    }
  )
  const bsRef = useRef(null);
  const adjustRelevance = (e: any) => {
    //320
    let ratio = Math.round(e.nativeEvent.offsetX / 320 * 100)
    if (ratio < 0) {
      ratio = 0
    } else if (ratio > 100) {
      ratio = 100;
    }
    setRelevance(() => {
      (slideRef.current as any).style.width = `${relevance}%` //此relevance是最新的
      return ratio
    });
    e.currentTarget.addEventListener('mousemove', mousemove.current)
  }
  const adjustRelevance2 = (e: any) => {
    //320
    let ratio = Math.round(e.nativeEvent.offsetX / 320 * 100)
    if (ratio < 0) {
      ratio = 0
    } else if (ratio > 100) {
      ratio = 100;
    }
    setRelevance2(() => {
      (slideRef2.current as any).style.width = `${relevance2}%` //此relevance是最新的
      return ratio
    });
    e.currentTarget.addEventListener('mousemove', mousemove2.current)
  }
  let bs: any;
  useEffect(() => {
    let willUnmount = false;
    bsRef.current = new BScroll('.choose-style-limit', {
      scrollY: true,
      className: /(^|\s)button(\s|$)/,
      scrollbar: {
        fade: false
      },
      bounce: false,
      mouseWheel: {}
    });
    (document.querySelector('#root') as HTMLElement).addEventListener('mouseup', mouseup.current);
    queryKeywords((res: any) => {
      if (!willUnmount) {
        const list = res.data.childList
        let temp: any = [];
        for (let i = 0; i < list.length; i++) {
          temp[i] = [];
          for (let j = 0; j < list[i].childList.length; j++) {
            temp[i][j] = "";
            setLanMap((lanMap) => {
              return {
                ...lanMap,
                [list[i].childList[j].english]: list[i].childList[j].chinese
              }
            })
          }
        }
        setMapArr(temp);
        setKeyWords(list);
        // @ts-ignore
        setActiveKeyWord(Array(list.length).fill(0)); //数组保存每一项类型的activeIndex
        (bsRef.current as any).refresh()
      }
      return () => {
        willUnmount = true;
      }
    })

    return () => {
      (document.querySelector('#root') as HTMLElement).removeEventListener('mouseup', mouseup.current);
      setStore('description', dataRef.current.description, false)
      setStore('negInput', dataRef.current.negInput, false)
      setStore('dimention', dataRef.current.dimention, false)
      setStore('relevance', dataRef.current.relevance, false)
      setStore('relevance2', dataRef.current.relevance2, false)
    }
  }, [])

  //用户创作好的图片 初始只有4张
  const [createdImg, setCreatedImg] = useState([]);

  const fileRef = useRef<any>();
  // const initImageRef = useRef<FormData>();
  //创作图片
  const createImg = (e: any) => {
    e.preventDefault();
    setProgress(0);
    const keyword = mapArr.join().split(',').filter(str => str).join();
    let taskId: string;
    //要发给后端的关键词
    // let di = dimention;
    const success = (res: any) => {
      setProgress(res.data.progress);
      if (res.data.finished) {
        setCreatedImg(res.data.imageUrls);
        setCreatable(true);
        if (dimention == 2) {
          setShowRow(true);
        } else {
          setShowRow(false)
        }
        return
      }
      if (res.data.updated) {
        setCreatedImg(res.data.imageUrls);
      }
      setTimeout(() => {
        imgRefresh({taskId: taskId}, success)
      }, 1000)
    }
    if (mode === MODE.Text) {
      if (!description && !keyword) {
        //生成按钮和换一批按钮不可点击
        return
      }
      setCreatable(false);
      text2img({
        guidance: relevance * 15 / 100 ,
        width: DIMESNION_OPTION[dimention].width,
        height: DIMESNION_OPTION[dimention].height,
        numImages: 4,
        prompt: description,
        keywords: keyword,
        negativePrompt: negInput
      }, (res: any) => {
        taskId = res.data.taskId;
        imgRefresh({
          taskId: taskId
        }, success)
      }, (err: any) => {
        console.log('创作失败', err);
        return;
      })
    } else if (mode === MODE.Picture && fileRef.current) {
      if (fileRef.current.files && !fileRef.current.files[0]) {
        alert('请上传图片')
        return
      }
      setCreatable(false);
      //@ts-ignore
      img2img({
        guidance: relevance * 15 / 100,
        initImage: fileRef.current.files[0],
        width: DIMESNION_OPTION[dimention].width,
        height: DIMESNION_OPTION[dimention].height,
        numImages: 4,
        prompt: description,
        keywords: keyword,
        strength: relevance2 / 100,
        negativePrompt: negInput
      }, (res: any) => {
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
  // @ts-ignore
  return (
    <div className="create-page">
      <div className="create-page-content">
        <div className="left">
          <div className="choose-mode">
            <CapsuleButton onClick={() => {
              changeModeTo(MODE.Text)
            }} className={mode == MODE.Text ? 'active' : ''}>文字模式</CapsuleButton>
            <CapsuleButton onClick={() => {
              changeModeTo(MODE.Picture)
            }} className={mode == MODE.Picture ? 'active' : ''}>图文模式</CapsuleButton>
            {
              creatable ?
                <CapsuleButton onClick={createImg} className={'create'}>生成</CapsuleButton>
                :
                <CapsuleButton nobutton={1} className={'create disable'}>
                  <span className={'text'}>{`创作中(${progress}%)`}</span>
                  <span style={{transform: `translateX(${progress - 100}%)`, left: 0}} className={'progress'}/>
                </CapsuleButton>
            }
          </div>
          <div className="textarea-wrapper">
            <div className="user-input-area">
              <textarea
                autoFocus
                value={description}
                placeholder={'在此输入描述词:'}
                onChange={(e) => {
                  if (e.target.value.length > 200) {
                    return;
                  }
                  setDescription(e.target.value)
                }}
              >
              </textarea>
              <div className="text-limit">{description.length + '/200'}</div>
              <p className="small-tags">
                {
                  mapArr.map((arr: string[], i: number) => {
                    return (
                      <React.Fragment key={i}>
                        {
                          arr.map((keyword: string, j: number) => {
                            return (
                              keyword !== '' &&
                              <CapsuleButton key={j}>
                                {
                                  // @ts-ignore
                                  <span>{lanMap[keyword]}</span>
                                }
                                <i onClick={() => {
                                  let temp = [...mapArr];
                                  temp[i][j] = '';
                                  setMapArr(temp);
                                }}>
                                  <img src={Icons.del} alt=""/>
                                </i>
                              </CapsuleButton>
                            )
                          })
                        }
                      </React.Fragment>
                    )
                  })
                }
              </p>
            </div>
          </div>
          <div className="choose-style">
            {
              mode === MODE.Picture &&
							<div className="add-picture">
								<input ref={fileRef}
								       accept="image/jpeg, image/jpg, image/png, image/gif, image/bmp"
								       type="file"
								       onChange={() => {
                         const fileReader = new FileReader();
                         fileReader.readAsDataURL(fileRef.current.files[0]);
                         fileReader.onload = () => {
                           //@ts-ignore
                           setPreviewUrl(fileReader.result)
                         }
                       }}
								/>
							</div>
            }
            <div className="choose-style-limit">
              <div className="choose-style-content">
                <div className={'choose dimention'}>
                  <p>尺寸</p>
                  <div className='dimention-options'>
                    {
                      DIMESNION_OPTION.map((item, index) => {
                        return (
                          <CapsuleButton nobutton={1}
                                         key={index}
                                         data-checked={dimention === index ? "checked" : "unchecked"}
                                         onClick={() => {
                                           setDimention(index)
                                         }}
                          >
                            {`${item.width}*${item.height}`}
                          </CapsuleButton>
                        )
                      })
                    }
                  </div>
                </div>
                <div className={'choose relevance'}>
                  <p>文字相关性</p>
                  <div onMouseDown={adjustRelevance} className="slider">
                    <div ref={slideRef} style={{width: `${relevance}%`}} className="slider-bar">
                      <div className="slider-button"></div>
                    </div>
                  </div>
                  <div className="percentage">{`${relevance}%`}</div>
                </div>
                {
                  mode === MODE.Picture &&
									<div className={'choose relevance'}>
										<p>图片相关性</p>
										<div onMouseDown={adjustRelevance2} className="slider">
											<div ref={slideRef2} style={{width: `${relevance2}%`}} className="slider-bar">
												<div className="slider-button"></div>
											</div>
										</div>
										<div className="percentage">{`${relevance2}%`}</div>
									</div>
                }
                <>
                  {
                    keyWords.map((val: any, index) => {
                      return (
                        <div key={val.id} className="choose choose-tags">
                          <p>{val.chinese}</p>
                          <div className="tags-container">
                            <div className="all">
                              <CapsuleButton
                                nobutton={1}
                                /*一个关键词也没选 则数组全空*/
                                data-checked={mapArr[index].join('') === "" ? 'checked' : 'unchecked'}
                                className={activeKeyWord[index] === 0 ? 'active' : ''}
                                onClick={() => {
                                  let tempArr = [...mapArr];
                                  tempArr[index].fill("")
                                  setMapArr(tempArr)
                                }}
                              >
                                不限
                              </CapsuleButton>
                            </div>
                            <div className="sub">
                              {
                                val.childList && val.childList.map((item: any, i: number) => {
                                  return (
                                    <CapsuleButton key={item.id}
                                                   nobutton={1}
                                                   data-checked={mapArr[index][i] ? 'checked' : 'unchecked'}
                                      // @ts-ignore
                                                   className={mapArr[index].index == i ? 'active' : ''}
                                                   onClick={() => {
                                                     //如果已选中
                                                     if (mapArr[index][i]) {
                                                       let temp = [...mapArr];
                                                       temp[index][i] = "";
                                                       setMapArr(temp);
                                                     } else {
                                                       let temp = [...mapArr];
                                                       temp[index][i] = item.english;
                                                       //如果子标签被全部选中, 则清空子数组
                                                       if (temp[index].findIndex(str => str === '') < 0) {
                                                         temp[index].fill('');
                                                       }
                                                       setMapArr(temp);
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
                    mode === MODE.Picture &&
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
          <div className="img-wrapper">
            {
              createdImg.map((imgSrc, index) => {
                return (
                  <div className="image" key={index}>
                    <img src={`${imgSrc}?time=${Date.now()}`} alt=""/>
                    <p className={`${showRow ? "row hover-icons" : "hover-icons"}`}>
                      <span
                        onClick={() => {
                          setImgToScale(true)
                          setImgSrc(imgSrc)
                        }}
                      >
                        <img src={Icons.seebig} alt=""/>
                      </span>
                      <span onClick={() => {
                        setImgToAdd(true)
                        setImgSrc(imgSrc)
                      }}>
                        <img src={Icons.like} alt=""/>
                      </span>
                      <span>
                        <img src={Icons.download} alt=""/>
                      </span>
                    </p>
                  </div>
                )
              })
            }
          </div>
          {
            imgToAdd && <AddToBookmark type={0} onCancle={cancelAdd} url={imgSrc}></AddToBookmark>
          }
        </div>
      </div>
      {
        imgToScale &&
				<SeeBig close={closeBig} url={imgSrc}/>
      }
    </div>
  );
};

export default Create;