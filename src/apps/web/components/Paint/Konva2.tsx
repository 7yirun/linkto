import React, {useRef, useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Stage, Layer,Group, Circle} from 'react-konva';
import {Vector2d} from "konva/lib/types"
import URLImage from "./URLImage"
import styles from "./Konva.module.scss"
import {setLoadedImages} from "apps/web/store/store";
import {useDispatch, useSelector} from "react-redux"
import {pictureStateType, LayerInfoType} from "apps/web/pages/Create/Create"
import {message} from "antd";
import Slider from '@mui/material/Slider';
import PaintLine from "./PaintLine"
import PaintGroup from "./PaintGroup";
import Grid from "./Grid"
import { ReactReduxContext, Provider } from 'react-redux';

enum MODE {
  none,
  move,
  erase,  //橡皮擦
  paint,//自由画图
}

//每一条line / eraseLine
type LineType = {
  line: number[], //保存点的坐标
  layerId: string  //图层id
  strokeWidth: number
  lineColor?: string
  type: string    //实线还是擦除 type = 'paint' || 'erase'
}
export type LayerType = {
  name: string,    //图层名
  layerId: string,
  imgUrl: string   //该图层的图片地址
}

//每个historyObj都可以单独还原出当前画布所有信息 相当于是每一次快照都完全保存了
interface IHistoryObj {
  lines: LineType[],       //当前画布上所有线条信息+擦除信息
  layers: LayerType[]       //当前画布上所有图层信息
  currentLayerId: string   //当前选中的图层id
}

interface IProps {
  imgUrl?: string
  updateLayerInfo: (arg: LayerInfoType) => void  //删除/恢复图层时, 引起父组件图层下拉框的变化
}

const SIZE_LIMIT = 10 * 1024 * 1024 //限制上传的最大图片大小为10MB

const Paint = forwardRef((props: IProps, konvaRef) => {
  useImperativeHandle(konvaRef, () => ({
    generateImg,
    deleteLayer,
    changeCurrentLayer
  }))
  const dispatch = useDispatch();
  const pictureState = useSelector<any, pictureStateType>(state => state.pictureState)

  const pixelRatioRef = useRef<number>(1);
  useEffect(() => {
    pixelRatioRef.current = Math.max(window.devicePixelRatio, 1)
  }, [])
  const getFinishedPic = () => {
    return stageRef.current.toDataURL({
      pixelRatio: 1
    })
  }
  const [history, setHistory] = useState<IHistoryObj[]>([{
    lines: [],
    layers: [
      {
        name: '背景图层',
        layerId: '背景图层001',
        imgUrl: ''
      }
    ],
    currentLayerId: '背景图层001'
  }]);

  //记录历史记录的步骤
  const [stepIndex, setStepIndex] = useState(0);

  //操作模式 移动/画笔/橡皮等等
  const [mode, setMode] = useState<MODE>(MODE.move);

  //当前选择的颜色
  const [currentColor, setCurrentColor] = useState<string>('#43CF7C');
  //当前选择的线宽
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(10);
  //div绘图区 用于获取宽高 限制canvas宽高
  const drawingAreaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>();
  //记录是否正在画线/擦除 isPaint的时候不处理mousemove事件, 也不能操作历史记录的撤销/恢复
  const isPaint = useRef<boolean>(false);


  const deleteLayer = () => {
    if (pictureState.loadedImages.length === 1) {
      message.warning('无法删除背景层')
      return;
    }
    /*console.log(pictureState.loadedImages.length);
    if (pictureState.loadedImages.length === 2){
      dispatch(setCanvasWidth(2048))
      dispatch(setCanvasHeight(2048))
    }*/
    const oldHistory = history.slice(0, stepIndex + 1);
    const currentState = oldHistory.slice(-1)[0];

    //被删除的图层在history layers中的index   index一定是>=1的
    const index: number = currentState.layers.findIndex(layer => layer.layerId === history[stepIndex].currentLayerId);
    //新的currentLayerId 它是当前图层的前一个图层
    const newLayerId: string = currentState.layers[index - 1].layerId;
    setHistory([
      ...oldHistory,
      {
        lines: currentState.lines,
        layers: currentState.layers.filter((layer: LayerType) => layer.layerId !== history[stepIndex].currentLayerId),
        currentLayerId: newLayerId
      }
    ])
    setStepIndex(stepIndex + 1);
  }

  //通过父组件中的Dropdown组件下拉框切换当前图层 此方法暴露到ref给父组件调用
  //该函数仅修改当前historyObj的currentLayerId, 不产生新history
  const changeCurrentLayer = (layerId: string) => {
    //仅修改. 不改变长度
    const oldHistory = history.slice();
    const currentState = oldHistory[stepIndex];
    currentState.currentLayerId = layerId;
    oldHistory.splice(stepIndex, 1, currentState)
    setHistory(oldHistory)
  }
  //鼠标位置
  const [position, setPosition] = useState<{ x: number, y: number }>({x: 0, y: 0});


  //更新Create父组件中下拉框的图层信息
  useEffect(() => {
    props.updateLayerInfo({
      layerArr: history[stepIndex].layers,
      currentLayerId: history[stepIndex].currentLayerId
    })
  }, [stepIndex, history[stepIndex].currentLayerId])


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
  const [ratio, setRatio] = useState<number>(100)

  //Group元素有多个 需要用数组保存ref
  const groupRefs = useRef<{ [key: string]: any }>({});
  const layerRef = useRef<any>();

  // 当有新图加载/用户手动切换了图层/删除了图层 需要把当前图层显示在最顶层
  useEffect(() => {
    groupRefs.current[history[stepIndex].currentLayerId] && groupRefs.current[history[stepIndex].currentLayerId].moveToTop()
    // updateCanvasArea();

  }, [stepIndex, history[stepIndex].currentLayerId])
  useEffect(() => {
    //只有默认的初始图层时, history不发生变化
    if (pictureState.loadedImages.length <= 1) {
      return
    }
    // pictureState.loadedImages只会增加不会减少, 所以历史记录的stepIndex一定是增加
    const oldHistory = history.slice(0, stepIndex + 1);
    const currentState = oldHistory.slice(-1)[0];
    const arr = [
      ...oldHistory,                     //之前的历史步骤保留原样
      {
        lines: currentState.lines,  //lines保留原样
        layers: [
          ...oldHistory.slice(-1)[0].layers,
          {
            name: pictureState.loadedImages.slice(-1)[0].name,
            layerId: pictureState.loadedImages.slice(-1)[0].id,
            imgUrl: pictureState.loadedImages.slice(-1)[0].src
          }
        ],
        currentLayerId: pictureState.loadedImages.slice(-1)[0].id
      }
    ]
    setHistory(arr)
    setStepIndex(stepIndex + 1)
  }, [pictureState.loadedImages])

  const [showCircle, setShowCircle] = useState(true);

  //画线  需要重新开启新的历史记录
  const handleMouseDown = (e: any) => {
    if (mode === MODE.paint || mode === MODE.erase) {
      if (history[stepIndex].currentLayerId === '背景图层001') {
        return
      }
      isPaint.current = true;
      const pos: Vector2d = groupRefs.current[history[stepIndex].currentLayerId].getRelativePointerPosition();
      const oldHistory = history.slice(0, stepIndex + 1);
      const currentState: IHistoryObj = oldHistory.slice(-1)[0];
      if (mode === MODE.paint || mode === MODE.erase) {
        //画线或擦除
        setHistory([
          ...oldHistory,
          {
            ...currentState,
            lines: [
              ...currentState.lines,
              {
                type: mode === MODE.paint ? 'paint' : 'erase',
                line: [pos.x, pos.y],
                strokeWidth: currentStrokeWidth,
                lineColor: currentColor,
                layerId: currentState.currentLayerId
              }
            ]
          }])
        setStepIndex(stepIndex + 1);
      }
    }
  }

  const handleMouseMove = (e: any) => {
    if (!isPaint.current) {
      return
    }
    const pos: Vector2d = groupRefs.current[history[stepIndex].currentLayerId].getRelativePointerPosition();

    const currentHistoryObj: IHistoryObj = history.slice(-1)[0];

    if (mode === MODE.paint || mode === MODE.erase) {
      //lastLine初始值是mouseDown事件中画下的那个点
      let lastLine: number[] = currentHistoryObj.lines.slice(-1)[0].line;
      //将后续的点连上之前的点
      lastLine = lastLine.concat([pos.x, pos.y]);
      //拷贝之前的history
      const oldHistory = history.slice();
      //将之前history的最后一条line替换成新line
      oldHistory.slice(-1)[0].lines.slice(-1)[0].line = lastLine;
      //将修改完line之后的新的history整体替换
      setHistory(oldHistory);
      groupRefs.current[history[stepIndex].currentLayerId].cache()
      // groupRefs.current[history[stepIndex].currentLayerId].getLayer().cache()
      // groupRefs.current[history[stepIndex].currentLayerId].getLayer().batchDraw()
    }
  }


  const handleMouseUp = () => {
    isPaint.current = false;
  }

  const bgRef = useRef<any>(null);

  const generateImg = () => {
    //隐藏黑白方格
    bgRef.current && bgRef.current.hide()
    setTimeout(() => {
      bgRef.current && bgRef.current.show()
    }, 500)
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
    for (let key in groupRefs.current) {
      //每个组都要重新cache, 因为历史记录操作会涉及所有Group
      //有的Group可能被删掉了 要判断非null
      groupRefs.current[key] && groupRefs.current[key].cache();
    }
    return imgBase64Obj;
  }

  /*黑白方格*/
  const WIDTH = useRef<number>(Math.round(64 / pixelRatioRef.current));
  const HEIGHT = useRef<number>(Math.round(64 / pixelRatioRef.current));
  const grid = useRef([['white', 'grey'], ['grey', 'white']])


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
        <li>
          <span style={{whiteSpace: 'nowrap'}}>画布缩放比例: </span>
          <Slider
            value={ratio}
            max={200}
            min={50}
            onChange={(e, v) => {
              {
                setRatio(v as number)
              }
            }}
          >
          </Slider>
          <p>{ratio}%</p>
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
          }
          e.stopPropagation(); //firefox中防止打开新窗口
        }}
      >
        <ReactReduxContext.Consumer>
          {
            ({store})=>(
              <Stage
                ref={stageRef}
                width={pictureState.canvasWidth / pixelRatioRef.current}
                height={pictureState.canvasHeight / pixelRatioRef.current}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: `scale(${ratio / 100})`,
                }}
                onMouseDown={(e) => {
                  handleMouseDown(e)
                }}
                onMouseMove={(e) => {
                  const mousePos: { x: number, y: number } = stageRef.current.getPointerPosition();
                  setPosition({
                    x: mousePos.x,
                    y: mousePos.y
                  })
                  handleMouseMove(e)
                }}
                onMouseLeave={()=>{
                  setShowCircle(false);
                }}
                onMouseUp={handleMouseUp}
              >
                <Provider store={store}>
                  <Layer
                    ref={layerRef}
                    clip={{
                      x: 0,
                      y: 0,
                      width: pictureState.canvasWidth,
                      height: pictureState.canvasHeight,
                      draggable: false
                    }}
                    onMouseEnter={() => {
                      if (mode === MODE.erase || mode === MODE.paint) {
                        stageRef.current.container().style.cursor = 'none';
                        setShowCircle(true);
                      }
                    }}
                  >
                    <>
                      <Group ref={bgRef}>
                        <Grid
                          pictureState={pictureState}
                          WIDTH={WIDTH.current}
                          HEIGHT={HEIGHT.current}
                          grid={grid.current}
                        ></Grid>
                      </Group>
                      {
                        history[stepIndex].layers.filter((layer: LayerType) => layer.layerId !== '背景图层001').map((layer: LayerType) => {
                          return (
                            <React.Fragment key={layer.layerId}>
                              <PaintGroup
                                showTransformer={mode === MODE.move && layer.layerId === history[stepIndex].currentLayerId}
                                setNode={(ele: any) => {
                                  groupRefs.current[layer.layerId] = ele
                                }}
                                draggable={mode === MODE.move}
                              >
                                <URLImage
                                  imgUrl={layer.imgUrl}
                                  maxWidth={pictureState.canvasWidth}
                                  maxHeight={pictureState.canvasHeight}
                                  onMouseEnter={() => {
                                    if (mode === MODE.move) {
                                      stageRef.current.container().style.cursor = 'move';
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (mode === MODE.move) {
                                      stageRef.current.container().style.cursor = 'default';
                                    }
                                  }}
                                />
                                {
                                  //画线
                                  history[stepIndex].lines.map((line, i) => {
                                    return (
                                      <React.Fragment key={'line' + i}>
                                        {
                                          line && line.layerId === layer.layerId &&
													                <PaintLine
														                groupNode={groupRefs.current[layer.layerId]}
														                stroke={line.type === 'paint' ? line.lineColor : '#000000'}
														                strokeWidth={line.strokeWidth}
														                lineJoin={'round'}
														                points={line.line}
														                lineCap={'round'}
														                bezier={true}
														                perfectDrawEnabled={false}
														                globalCompositeOperation={line.type === 'paint' ? 'source-over' : 'destination-out'}
													                />
                                        }
                                      </React.Fragment>
                                    )
                                  })
                                }
                              </PaintGroup>
                            </React.Fragment>
                          )
                        })
                      }
                    </>
                  </Layer>
                </Provider>
                <Layer>
                  {
                    (mode === MODE.paint || mode === MODE.erase) && showCircle &&
				            <Circle
					            x={position.x}
					            y={position.y}
					            radius={currentStrokeWidth / 2}
					            strokeWidth={1}
					            stroke={'black'}
				            ></Circle>
                  }
                </Layer>
              </Stage>
            )
          }
        </ReactReduxContext.Consumer>
      </div>
    </div>
  )
    ;
})
export default Paint
