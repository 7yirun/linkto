import React, {useRef, useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Stage, Layer, Line, Transformer, Group, Rect} from 'react-konva';
import {Vector2d} from "konva/lib/types"
import URLImage from "./URLImage"
import styles from "./Konva.module.scss"
import {setLoadedImages, setCurrentLayerId} from "apps/web/store/store";
import {useDispatch, useSelector} from "react-redux"
import {pictureStateType} from "apps/web/pages/Create/Create"
import {message} from "antd";
import Slider from '@mui/material/Slider';
import {useMounted} from "../../hooks";

enum MODE {
  none,
  move,
  erase,  //橡皮擦
  paint,//自由画图
}

type imgType = {
  name: string
  src: string
  id: string
}

interface historyObj {
  lines?: number[],       //画线
  eraseLines?: number[],  //橡皮擦(line和图片一起擦除)
  imageObj?: imgType     //存放图片  每张图片会形成单独的history
  strokeWidth?: number  //笔触半径
  lineColor?: string     //画笔颜色
  id: string             //图层currentLayerId 记录是哪个图层产生的记录
}


interface IProps {
  imgUrl?: string
}

const SIZE_LIMIT = 10 * 1024 * 1024 //限制上传的最大图片大小为10MB

const Paint = forwardRef((props: IProps, konvaRef) => {
  useImperativeHandle(konvaRef, () => ({
    generateImg
  }))
  const dispatch = useDispatch();
  const pictureState = useSelector<any, pictureStateType>(state => state.pictureState)

  const getFinishedPic = () => {
    return stageRef.current.toDataURL({
      pixelRatio: 1
    })
  }
  const [history, setHistory] = useState<historyObj[]>([{id: '背景图层001'}]);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<MODE>(MODE.move);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [canvasHeight, setCanvasHeight] = useState<number>(0);
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(5);

  const drawingAreaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>();
  //isPaint的时候不处理mousemove事件
  const isPaint = useRef<boolean>(false);

  const filterTransparent2Black = ({data}: { data: Uint8ClampedArray }) => {
    const nPixels = data.length
    for (let i = 3; i < nPixels; i += 4) {
      //透明和半透明部分变为全白
      if (data[i] < 255) {
        data[i - 3] = 255
        data[i - 2] = 255
        data[i - 1] = 255
        data[i] = 255;
      } else {
        //非透明部分变为全黑
        data[i - 3] = 0
        data[i - 2] = 0
        data[i - 1] = 0
      }
    }
  }
  //第一次进入以及resize时, 自适应canvas画布的大小
  const updateCanvasArea = () => {
    if (!isMounted) {
      setCanvasHeight(drawingAreaRef.current?.offsetHeight || 0)
    }
    setCanvasWidth(drawingAreaRef.current?.offsetWidth || 0)
  }
  useEffect(() => {
    updateCanvasArea()
    window.addEventListener('resize', updateCanvasArea)
    return () => {
      window.removeEventListener('resize', updateCanvasArea)
    }
  }, [])

  //Group元素有多个 需要用数组保存ref
  const groupRefs = useRef<{ [key: string]: any }>({});
  const layerRef = useRef<any>();
  const trRef = useRef<any>();

  // 当有新图加载/用户手动切换了图层/删除了图层 需要把当前图层显示在最顶层
  useEffect(() => {
    groupRefs.current[pictureState.currentLayerId] && groupRefs.current[pictureState.currentLayerId].moveToTop()
    // groupRefs.current = [];
  }, [pictureState.loadedImages, pictureState.currentLayerId])

  /*cache相关-------------------------------------------------------------------*/
  const isMounted = useMounted();
  useEffect(() => {
    if (isMounted) {
      for (let key in groupRefs.current) {
        console.log(key);
        //每个组都要重新cache, 因为历史记录操作会涉及所有Group
        groupRefs.current[key] && groupRefs.current[key].cache();
      }
    }
  }, [stepIndex])
  /*cache相关-------------------------------------------------------------------*/

  //画线  需要重新开启新的历史记录
  const handleMouseDown = (e: any) => {
    if (mode === MODE.paint || mode === MODE.erase) {
      if (pictureState.currentLayerId === '背景图层001') {
        return
      }
      isPaint.current = true;
      const pos: Vector2d = groupRefs.current[pictureState.currentLayerId].getRelativePointerPosition();
      const oldHistory = history.slice(0, stepIndex + 1);
      switch (mode) {
        case MODE.paint:
          //画线
          setHistory([...oldHistory, {
            id: pictureState.currentLayerId,
            lines: [pos.x, pos.y],
            strokeWidth: currentStrokeWidth,
            lineColor: currentColor
          }])
          setStepIndex(oldHistory.length); //newHistoryObj === newHistory[stepIndex]
          break;
        case MODE.erase:
          //橡皮擦
          setHistory([...oldHistory, {
            id: pictureState.currentLayerId,
            eraseLines: [pos.x, pos.y],
            strokeWidth: currentStrokeWidth
          }])
          setStepIndex(oldHistory.length)
          break;
      }
    }
  }

  const handleMouseMove = (e: any) => {
    if (!isPaint.current) {
      return
    }
    const pos: Vector2d = groupRefs.current[pictureState.currentLayerId].getRelativePointerPosition();

    const currentHistoryObj: historyObj = history.slice(-1)[0];

    if (mode === MODE.paint) {
      //lastLine初始值是mouseDown事件中画下的那个点
      let lastLine: number[] = currentHistoryObj.lines!;
      //将后续的点连上之前的点
      lastLine = lastLine.concat([pos.x, pos.y]);
      const oldHistory = history.slice();
      oldHistory[oldHistory.length - 1].lines = lastLine;
      setHistory(oldHistory);
      groupRefs.current[pictureState.currentLayerId].cache()

    } else if (mode === MODE.erase) {
      //lastLine初始值是mouseDown事件中画下的那个点
      let lastEraseLine: number[] = currentHistoryObj.eraseLines!;
      //将后续的点连上之前的点
      lastEraseLine = lastEraseLine.concat([pos.x, pos.y]);
      const oldHistory = history.slice();
      oldHistory[oldHistory.length - 1].eraseLines = lastEraseLine;
      setHistory(oldHistory)
      groupRefs.current[pictureState.currentLayerId].cache()
    }
  }

  const handleMouseUp = () => {
    isPaint.current = false;
  }

  const generateImg = () => {
    const imgBase64Obj = {
      paint: '',
      mask: ''
    }
    imgBase64Obj.paint = getFinishedPic().split(',')[1]

    layerRef.current.cache();
    layerRef.current.filters([filterTransparent2Black])
    imgBase64Obj.mask = getFinishedPic().split(',')[1]

    layerRef.current.clearCache();
    layerRef.current.filters([]);
    console.log(imgBase64Obj);
    for (let key in groupRefs.current) {
      //每个组都要重新cache, 因为历史记录操作会涉及所有Group
      groupRefs.current[key].cache();
    }
    return imgBase64Obj;
  }


  return (
    <div className={styles.container}>
      <ul className={'basic-operate'}>
        <li className={mode === MODE.move ? 'active' : ''}>
          <button onClick={() => {
            setMode(MODE.move)
          }}>
            <i className={'iconfont icon-Pan'}></i>
            移动
          </button>
        </li>
        <li className={mode === MODE.erase ? 'active' : ''}>
          <button onClick={() => {
            setMode(MODE.erase)
          }}>
            <i className={'iconfont icon-22'}></i>
            擦除
          </button>
        </li>
        <li className={mode === MODE.paint ? 'active' : ''}>
          <button onClick={() => {
            setMode(MODE.paint)
          }}
          >
            <i className={'iconfont icon-Draw'}></i>
            绘图
          </button>
        </li>
        <li>
          <button onClick={() => {
            if (stepIndex === 0) {
              return;
            }
            setStepIndex(stepIndex - 1)
          }}>
            <i className="iconfont icon-Back"></i>
            撤销
          </button>
        </li>
        <li>
          <button onClick={() => {
            if (stepIndex + 1 >= history.length) {
              return
            }
            setStepIndex(stepIndex + 1)
          }}>
            <i className="iconfont icon-Back"></i>
            还原
          </button>
        </li>
      </ul>
      <div
        className="detail-operate"
        style={{visibility: (mode === MODE.paint || mode === MODE.erase) ? 'visible' : 'hidden'}}
      >
        <div className="radius">
          <p>画笔大小</p>
          <Slider
            value={currentStrokeWidth}
            onChange={(e, radius) => {
              setCurrentStrokeWidth(radius as number)
            }}
          >
          </Slider>
          <span className={'width'}>{currentStrokeWidth}</span>
        </div>
        {
          mode === MODE.paint &&
					<div className="color">
						<p>颜色</p>
						<input
							value={currentColor}
							onChange={(e) => {
                setCurrentColor(e.target.value)
              }} type="color" name="" id=""/>
					</div>
        }
      </div>
      <div
        className={'drawing-area'}
        ref={drawingAreaRef}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault(); //防止打开新窗口
          const fileReader = new FileReader();
          const file = e.dataTransfer.files[0]
          console.log(file);
          //限制上传类型为image
          if (!file.type.includes('image')) {
            message.warning('请上传图片格式文件')
            return;
          }
          if (file.size > SIZE_LIMIT) {
            message.warning('上传图片不得超过10MB');
            return
          }
          fileReader.readAsDataURL(file);
          fileReader.onload = (e) => {
            const id = file.name + Date.now()
            dispatch(setLoadedImages([...pictureState.loadedImages, {
              src: fileReader.result,
              name: file.name,
              id: id
            }]));
            //每次上传新图片 将当前图层改变为新上传的图片的图层
            dispatch(setCurrentLayerId(id));
          }
          e.stopPropagation(); //firefox中防止打开新窗口
        }}
      >
        <Stage
          ref={stageRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={(e) => {
            handleMouseDown(e)
          }}

          onMouseMove={(e) => {
            handleMouseMove(e)
          }}
          onMouseUp={handleMouseUp}
        >
          <Layer
            ref={layerRef}
          >
            {/*<Rect
              width={canvasWidth}
              height={canvasHeight}
              fill={"#fff"}
            >
            </Rect>*/}
            {
              pictureState.loadedImages.filter(img => img.id !== '背景图层001').map((imgObj, i) => {
                return (
                  <React.Fragment key={imgObj.id}>
                    <Group
                      ref={(ele) => {
                        groupRefs.current[imgObj.id] = ele
                      }}
                      draggable={mode === MODE.move && imgObj.id !== '背景图层001'}
                      onDragEnd={(e) => {
                      }}
                    >
                      <URLImage
                        imgUrl={imgObj.src}
                        maxWidth={canvasWidth}
                        maxHeight={canvasHeight}
                        onMouseEnter={() => {
                          if (mode === MODE.move) {
                            stageRef.current.container().style.cursor = 'move';
                          }
                        }}
                        onMouseLeave={() => {
                          stageRef.current.container().style.cursor = 'default';
                        }}
                      />
                      {
                        //画线
                        history.slice(0, stepIndex + 1)
                          .filter(historyObj => historyObj.id === imgObj.id)
                          .map((lineHistory, i) => {
                            return (
                              <React.Fragment key={'line' + i}>
                                {
                                  lineHistory.lines &&
																	<Line
																		stroke={lineHistory.lineColor}
																		strokeWidth={lineHistory.strokeWidth}
																		lineJoin={'round'}
																		points={lineHistory.lines}
																		lineCap={'round'}
																		bezier={true}
																	/>
                                }
                                {
                                  lineHistory.eraseLines &&
																	<Line
																		draggable={mode === MODE.move}
																		stroke={'#000000'}
																		strokeWidth={lineHistory.strokeWidth}
																		lineJoin={'round'}
																		points={lineHistory.eraseLines}
																		lineCap={'round'}
																		bezier={true}
																		globalCompositeOperation={'destination-out'}
																	/>
                                }
                              </React.Fragment>
                            )
                          })
                      }

                    </Group>
                    {
                      <Transformer
                        ref={trRef}
                      />
                    }
                  </React.Fragment>
                )
              })
            }
          </Layer>
        </Stage>
      </div>
    </div>
  )
    ;
})
export default Paint
