import React, {useRef, useState, memo, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Stage, Layer, Line, Transformer} from 'react-konva';
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
  erase,
  paint,//自由画图
}

type imgType = {
  name: string
  src: string
  id: string
}

interface historyObj {
  lines?: number[],       //画线
  eraseLines?: number[],  //橡皮擦
  imageObj?: imgType     //存放图片  每张图片会形成单独的history
  strokeWidth?: number  //笔触半径
  lineColor?: string     //画笔颜色
}


interface IProps {
  imgUrl?: string
  getImages?: (props: string[]) => void
  getFinishedPic?:(url: string)=>any
}

const SIZE_LIMIT = 10 * 1024 * 1024 //限制上传的最大图片大小为10MB
const Konva = forwardRef((props:IProps, konvaRef) => {

  useImperativeHandle(konvaRef, ()=>({
    getFinishedPic
  }))
  const dispatch = useDispatch();
  const pictureState = useSelector<any, pictureStateType>(state => state.pictureState)

  const getFinishedPic = ()=>{
    return stageRef.current.toDataURL({
      pixelRatio: 1
    })
  }
  const [history, setHistory] = useState<historyObj[]>([{}]);
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
  const getImgSrc = ()=>{
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
  useEffect(()=>{
    updateCanvasArea()
    window.addEventListener('resize',updateCanvasArea)
    return ()=>{
      window.removeEventListener('resize', updateCanvasArea)
    }
  }, [])

  //画线  需要重新开启新的历史记录
  const handleMouseDown = (e: any) => {
    if (mode === MODE.paint || mode === MODE.erase) {
      isPaint.current = true
      const pos: Vector2d = e.currentTarget.getPointerPosition();
      const oldHistory = history.slice(0, stepIndex + 1);
      if (mode === MODE.paint) {
        //画线
        setHistory([...oldHistory, {
          lines: [pos.x, pos.y],
          strokeWidth: currentStrokeWidth,
          lineColor: currentColor
        }])
        setStepIndex(oldHistory.length) //newHistoryObj === newHistory[stepIndex]
      } else {
        //橡皮擦
        setHistory([...oldHistory, {
          eraseLines: [pos.x, pos.y],
          strokeWidth: currentStrokeWidth
        }])
        setStepIndex(oldHistory.length)
      }
    }
  }

  const handleMouseMove = (e: any) => {
    if (!isPaint.current) {
      return
    }
    const pos: Vector2d = e.currentTarget.getPointerPosition();
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
      </ul>
      <div
        className="detail-operate"
        style={{visibility: (mode === MODE.paint || mode === MODE.erase)?'visible':'hidden'}}
      >
        <div className="radius">
          <p>画笔大小</p>
          <Slider
            value={currentStrokeWidth}
            onChange={(e, radius)=>{
              setCurrentStrokeWidth(radius as number)
            }}
          >
          </Slider>
          <span className={'width'}>{currentStrokeWidth}</span>
        </div>
        <div className="color">
          <p>颜色</p>
          <input value={currentColor}  onChange={(e)=>{
            setCurrentColor(e.target.value)
          }} type="color" name="" id=""/>
          {/*<span style={{background: currentColor}}></span>*/}
        </div>
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
            dispatch(setLoadedImages([...pictureState.loadedImages, {
              src: fileReader.result,
              name: file.name,
              id: file.name+Date.now()
            }]));
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
                  <URLImage
                    key={imgObj.id}
                    imgUrl={imgObj.src}
                    maxWidth={canvasWidth}
                    maxHeight={canvasHeight}
                    draggable={mode === MODE.move}
                    isSelected={pictureState.currentLayerId === imgObj.id && pictureState.currentLayerId !== '背景图层001'}
                    onMouseEnter={() => {
                      if (mode === MODE.move) {
                        stageRef.current.container().style.cursor = 'move';
                      }
                    }}
                    onMouseLeave={() => {
                      stageRef.current.container().style.cursor = 'default';
                    }}
                  />
                )
              })
            }
          </Layer>
          <Layer>
            {
              //画线
              history.slice(0, stepIndex+1).filter(historyObj => historyObj.lines).map((lineHistory, i) => (
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
              ))
            }
            {
              //擦除
              history.slice(0, stepIndex+1).filter(historyObj => historyObj.eraseLines).map((lineHistory, i) => (
                <Line
                  key={'eraseLine' + i}
                  stroke={'#0f0'}
                  strokeWidth={lineHistory.strokeWidth}
                  lineJoin={'round'}
                  points={lineHistory.eraseLines}
                  lineCap={'round'}
                  bezier={true}
                  globalCompositeOperation={"destination-out"}
                >
                </Line>
              ))
            }
          </Layer>

        </Stage>
      </div>
    </div>
  );
})
export default Konva
