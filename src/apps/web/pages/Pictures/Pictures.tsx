import Waterfall from "apps/web/components/WaterFall/Waterfall";
import {useEffect, useState, useRef, SyntheticEvent} from "react";
import Header from "apps/web/components/Header/Header"
import {getSearchWords} from "../../../../service/service";
import "./Picture.scss"
import Icons from "lib/icons"
import debounce from 'lodash/debounce.js'
import {useWindowResize} from "apps/web/hooks";
import {Dropdown} from "antd";
import {setDescription, StateType, SearchStateType, setConfirmSearch} from "apps/web/store/store";
import {useSelector, useDispatch} from 'react-redux'

const Pictures = () => {
  const dispatch = useDispatch();
  const searchState = useSelector<StateType, SearchStateType>(state => state.searchState)
  const clientWidth = useWindowResize();
  debugger
  const [isLeft, setIsLeft] = useState<boolean>(false);
  /*  1.根据240的列宽 左右48的padding 24px的gap 算出需要多少列: cols*240+24*(cols-1) + 48*2 <= innerWidth
  *   cols <= (innerWidth -72)/264
  *   2.根据cols和24px的gap,算出自适应列宽colWidth:  cols*colWidth + 24*(cols-1) + 48*2 = innerWidth
  *   colWidth = (innerWidth-24*cols-72) / cols
  * */
  const currentCols = Math.floor((clientWidth - 72) / 264);
  const currentWidth = Math.floor((clientWidth - 24 * currentCols - 72) / currentCols);
  const layout = {
    cols: currentCols,
    colWidth: currentWidth
  }
  //搜索下方的推荐关键词
  const [keywords, setKeywords] = useState<string[]>([''])
  useEffect(() => {
    // 清空Header里的搜索栏
    dispatch(setDescription(''))
    getSearchWords({
      topNum: 5,
      word: ''
    },({data}:{data: string[]})=>{
      setKeywords(data)
    })
    return ()=>{
      // 清空Header里的搜索栏
      dispatch(setDescription(''))
    }
  }, [])
  return (
    <div className={'pictures'}>
      <Header></Header>
      <div className="similar-words-wrapper">
        {/*<Dropdown
          className=""
          menu={{items: [{key: 1, label: <li>行业1</li>}, {key: 2, label: <li>行业3</li>},{key: 1, label: <li>行业3</li>}], onClick: ()=>{}}}
          trigger={['click']}
        >
          <div className={'choose-words-type'}>
            <p>热门关键词</p>
            <span className={'iconfont icon-down'}></span>
          </div>
        </Dropdown>*/}
        <ul className="similar-words">
          {
            keywords.map((word: string, i)=>{
              return (
                <li
                  key={i}
                  onClick={()=>{
                    dispatch(setDescription(word))
                    dispatch(setConfirmSearch(true));
                  }}
                >{word}</li>
              )
            })
          }
        </ul>
      </div>
      {/*{
        layout.cols > 0 && layout.colWidth > 0 &&
				<Waterfall
          layout={layout}
        ></Waterfall>
      }*/}
    </div>
  )
}
export default Pictures