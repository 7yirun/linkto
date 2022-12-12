import React, {useRef, useState, memo, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Stage, Layer, Line, Transformer, Group} from 'react-konva';
import {Vector2d} from "konva/lib/types"
import URLImage from "./URLImage"
import styles from "./Konva.module.scss"
import {setLoadedImages, setCurrentLayerId} from "apps/web/store/store";
import {useDispatch, useSelector} from "react-redux"
import {pictureStateType} from "apps/web/pages/Create/Create"
import {message} from "antd";
import Slider from '@mui/material/Slider';

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
  getImages?: (props: string[]) => void
  getFinishedPic?: (url: string) => any
}

const SIZE_LIMIT = 10 * 1024 * 1024 //限制上传的最大图片大小为10MB
const Konva = forwardRef((props: IProps, konvaRef) => {

  //用户操作的时候是橡皮功能, 提交数据的时候将此路径变为颜色填充从而生成蒙版图片
  const [eraseFill, setEraseFill] = useState<any>('destination-out');
  useImperativeHandle(konvaRef, () => ({
    getFinishedPic
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
  const [currentColor, setCurrentColor] = useState<string>('#202020');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(5);
  // const [selectedId, setSelectedId] = useState<string>('');

  const drawingAreaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>();

  const isPaint = useRef<boolean>(false);

  //画布最终生成的图片
  const getImgSrc = () => {
    stageRef.current.toDataURL({
      pixelRatio: 1
    })
  }

  /*TODO 暂时不加入历史记录功能 太复杂......*/
  /*  //有新图片加载时 history要变化
    useEffect(() => {
      const oldHistory = [...history];
      setHistory([...history,]);
    }, [pictureState])*/
  /*TODO 暂时不加入历史记录功能 太复杂......*/


  //第一次进入以及resize时, 自适应canvas画布的大小
  const updateCanvasArea = () => {
    setCanvasHeight(drawingAreaRef.current?.offsetHeight || 0)
    setCanvasWidth(drawingAreaRef.current?.offsetWidth || 0)
  }
  useEffect(() => {
    updateCanvasArea()
    window.addEventListener('resize', updateCanvasArea)
    return () => {
      window.removeEventListener('resize', updateCanvasArea)
    }
  }, [])

  // const [isSelected, setIsSelected] = useState<boolean>(false)
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>();

  // 当有新图加载/用户手动切换了图层/删除了图层 需要把当前图层显示在最顶层
  useEffect(() => {
    groupRef.current.moveToTop()
  }, [pictureState.loadedImages, pictureState.currentLayerId])


  //画线  需要重新开启新的历史记录
  const handleMouseDown = (e: any) => {
    if (mode === MODE.paint || mode === MODE.erase) {
      isPaint.current = true;
      // const pos: Vector2d = e.currentTarget.getPointerPosition();
      const pos: Vector2d = groupRef.current.getRelativePointerPosition();
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
          console.log(history);
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
    // const pos: Vector2d = e.currentTarget.getPointerPosition();
    const pos: Vector2d = groupRef.current.getRelativePointerPosition();

    const currentHistoryObj: historyObj = history.slice(-1)[0];

    if (mode === MODE.paint) {
      //lastLine初始值是mouseDown事件中画下的那个点
      let lastLine: number[] = currentHistoryObj.lines!;
      //将后续的点连上之前的点
      lastLine = lastLine.concat([pos.x, pos.y]);
      const oldHistory = history.slice();
      oldHistory[oldHistory.length - 1].lines = lastLine;
      setHistory(oldHistory);
    } else if (mode === MODE.erase) {
      //lastLine初始值是mouseDown事件中画下的那个点
      let lastEraseLine: number[] = currentHistoryObj.eraseLines!;
      //将后续的点连上之前的点
      lastEraseLine = lastEraseLine.concat([pos.x, pos.y]);
      const oldHistory = history.slice();
      oldHistory[oldHistory.length - 1].eraseLines = lastEraseLine;
      setHistory(oldHistory)
    }
  }

  const handleMouseUp = () => {
    isPaint.current = false;
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
            console.log(stepIndex);
            console.log(history);
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
            console.log(stepIndex);
            if (stepIndex + 1 >= history.length) {
              return
            }
            setStepIndex(stepIndex + 1)
          }}>
            <i className="iconfont icon-Back"></i>
            还原
          </button>
        </li>
        {/*<li>
          <button onClick={()=>{
            dispatch(setLoadedImages([]))
            setEraseFill('source-over')
          }}>
            test
          </button>
        </li>*/}
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
						<input value={currentColor} onChange={(e) => {
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
            console.log(id);
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
          <Layer>
            {
              pictureState.loadedImages.map((imgObj, i) => {
                return (
                  <React.Fragment key={imgObj.id}>
                    <Group
                      ref={imgObj.id === pictureState.currentLayerId  ? groupRef : null}
                      // draggable={mode === MODE.move && imgObj.id === pictureState.currentLayerId}
                      draggable={mode === MODE.move && imgObj.id !== '背景图层001'}
                      onDragEnd={(e)=>{
                      }}
                    >
                      <URLImage
                        imgUrl={imgObj.src}
                        maxWidth={canvasWidth}
                        maxHeight={canvasHeight}
                        onMouseEnter={() => {
                          console.log('mouseenter');
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
                          .filter(historyObj => historyObj.lines && historyObj.id === imgObj.id)
                          .map((lineHistory, i) => {
                            return (
                              <Line
                                key={'line' + i}
                                stroke={lineHistory.lineColor}
                                strokeWidth={lineHistory.strokeWidth}
                                lineJoin={'round'}
                                points={lineHistory.lines}
                                lineCap={'round'}
                                bezier={true}
                              >
                              </Line>
                            )
                          })
                      }
                      {
                        //擦除
                        history.slice(0, stepIndex + 1)
                          .filter(historyObj => historyObj.eraseLines && historyObj.id === imgObj.id)
                          .map((lineHistory, i) => (
                          <Line
                            key={'eraseLine' + i}
                            stroke={'#0f0'}
                            strokeWidth={lineHistory.strokeWidth}
                            lineJoin={'round'}
                            points={lineHistory.eraseLines}
                            lineCap={'round'}
                            bezier={true}
                            globalCompositeOperation={eraseFill}
                          >
                          </Line>
                        ))
                      }
                    </Group>
                   {/* {
                      <Transformer
                        ref={trRef}
                      />
                    }*/}
                  </React.Fragment>
                )
              })
            }
          </Layer>
        </Stage>
      </div>
    </div>
  );
})
export default Konva
