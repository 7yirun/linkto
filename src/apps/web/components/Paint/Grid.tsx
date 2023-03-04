import {Rect} from "react-konva";
import React from "react";
// import {useSelector} from "react-redux";
// import {pictureStateType} from "../../pages/Create/Create";

const Grid = ({pictureState, WIDTH, HEIGHT, grid}: any) => {
  // const pictureState = useSelector<any, pictureStateType>(state => state.pictureState)
  return (
    <>
      {
        [...Array(Math.ceil(pictureState.canvasWidth / WIDTH))].map((v1: any, i1: number) => {
          return [...Array(Math.ceil(pictureState.canvasHeight / HEIGHT))].map((v2, i2) => {
            return <Rect
              x={i1 * WIDTH}
              y={i2 * HEIGHT}
              width={WIDTH}
              height={HEIGHT}
              fill={grid[i1 % 2][i2 % 2]}
              key={`${i1}-${i2}`}
            ></Rect>
          })
        }).flat()
      }
    </>
  )
}
export default React.memo(Grid)