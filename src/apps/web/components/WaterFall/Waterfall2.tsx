import React, { useEffect, useState, ReactNode} from 'react';
import "./WaterFall.scss"

type Prop = {
  layout: {
    cols: number
    colWidth: number
  },
  heightArr: number[],
  children: ReactNode[]
}
//Waterfall只做排版, 不发请求
const Waterfall:React.FC<Prop> = ({layout, heightArr,children}) => {
  // const position:any[] = [];
  const [position, setPosition] = useState<any[]>([]);

  const heightArrRef:number[] = layout.cols>0 ?Array(layout.cols).fill(0):[];
  const GAP = 24 //column gap 24
  useEffect(()=>{
    if(layout.cols <=0){
      return
    }
    //所有图片加载完后
    const tempPosition:any[] = [];
    for (let i = 0; i < heightArr.length; i++) {
      //该元素排哪一列
      let colIndex = heightArrRef.findIndex((val, index) => {
        //浮点数不能用===判断
        const delta = 1e-3;
        return (val >= Math.min(...heightArrRef) - delta) && (val <= Math.min(...heightArrRef) + delta)
      })
      tempPosition[i] = {
        left: layout.colWidth * colIndex + colIndex * GAP,
        top: heightArrRef[colIndex],
        height: heightArr[i]
      }
      heightArrRef[colIndex] += heightArr[i];
    }
    setPosition(tempPosition);
  }, [heightArr, layout])
  return (
    <>
      {
        heightArr.length > 0 && children.length >0 &&
	      <div className="waterfall">
          {children.map((child, i)=>{
            return (
              <div
                key={i}
                className={'waterfall-item'}
                style={{
                  width: layout.colWidth,
                  left: position[i] ? position[i].left : "",
                  top: position[i] ? position[i].top : '',
                  height: position[i]?position[i].height : '',
                }}
              >
                {child}
              </div>
            )
          })}
	      </div>
      }
    </>
  )
};
export default Waterfall