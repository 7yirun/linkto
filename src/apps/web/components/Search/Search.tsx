import React, {useCallback, useEffect, useRef, useState} from "react";
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import Icons from "../../../../lib/icons";
import {useSelector, useDispatch} from 'react-redux'
import {setDescription, setMapArr, StateType, SearchStateType, setConfirmSearch} from "apps/web/store/store";
import {getSearchWords} from "service/service"
import styles from "./Search.module.scss"
import {CSSTransition} from 'react-transition-group'
import debounce from 'lodash/debounce.js'


const Search: React.FC<{isPictures: boolean}> = (props) => {
  const dispatch = useDispatch();
  const searchState = useSelector<StateType, SearchStateType>(state => state.searchState)
  const [showTags, setShowTags] = useState<boolean>(false);
  const [recommendList, setRecommendList] = useState<string[]>([]);
  const debouncedSearch = useCallback(debounce(getSearchWords, 500), [])
  useEffect(() => {
    //确认搜索时(点击或回车) 关闭下拉推荐词
    if (searchState.confirmSearch) {
      setShowTags(false);
    } else {
      debouncedSearch({
        topNum: 5,
        word: searchState.description
      }, (res: any) => {
        setRecommendList(res.data)
      })
    }
  }, [searchState.confirmSearch, searchState.description])

  //当所有标签都未选中时 隐藏small-tag
  useEffect(() => {
    if (!searchState.mapArr.join('').split(',').join('')) {
      setShowTags(false);
    }
  }, [searchState.mapArr])


  return (
    <div className={styles["textarea-wrapper"]}>
      <span style={{display: 'none'}} className={'iconfont icon-search'}></span>
      <div className="user-input-area">
        <input
          type="text"
          value={searchState.description}
          placeholder={'在此输入描述词:'}
          onFocus={() => {
            if(props.isPictures){
              setShowTags(true);
            }
          }}
          onBlur={() => {
            setShowTags(false);
          }}
          onChange={(e) => {
            if (e.target.value.length > 200) {
              return;
            }
            dispatch(setDescription(e.target.value));
          }}
          onKeyDown={(e)=>{
            //监听enter 仅在图库搜索中有用
            if(props.isPictures && e.key === 'Enter'){
              dispatch(setConfirmSearch(true));
            }
          }}
        />
        <div className="text-limit">{searchState.description.length + '/200'}</div>
      </div>
      <CSSTransition
        classNames={'small-tags'}
        in={showTags}
        unmountOnExit={true}
        addEndListener={(node, done) => {
          node.addEventListener('transitionend', done);
        }}
      >
        <div className={'small-tags'}>
          {
            //创作选的关键词
            searchState.mapArr.map((arr: string[], i: number) => {
              return (
                <React.Fragment key={i}>
                  {
                    arr.map((keyword: string, j: number) => {
                      return (
                        keyword !== '' &&
												<CapsuleButton key={j}>
                          {
                            <span>{searchState.lanMap[keyword]}</span>
                          }
													<i onClick={() => {
                            let temp: string[][] = [];
                            for (let i = 0; i < searchState.mapArr.length; i++) {
                              temp[i] = []
                              for (let j = 0; j < searchState.mapArr[i].length; j++) {
                                temp[i][j] = searchState.mapArr[i][j];
                              }
                            }
                            temp[i][j] = '';
                            dispatch(setMapArr(temp));
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
          {
            props.isPictures &&
            <div className="recommend-wrapper">
              <p>推荐关键词</p>
              <ul className={'recommend-words'}>
                {
                  recommendList.map((word,i)=>(
                    <li
                      key={i}
                    >
                      <CapsuleButton
                        onClick={()=>{
                          dispatch(setDescription(word));
                          dispatch(setConfirmSearch(true));
                        }}
                      >{
                        word
                      }</CapsuleButton>
                    </li>
                  ))
                }
              </ul>
            </div>
          }
        </div>
      </CSSTransition>
      {
        searchState.mapArr.join('').split(',').join('') &&
				<>
					<div
						className="toggle-tags">
            {
              '+' + searchState.mapArr.join().split(',').filter(str => str).length
            }
					</div>
					<div className={'drop-down'}
					     onClick={() => {
                 setShowTags(!showTags);
               }}
					>
						<span className={'iconfont icon-down'}></span>
					</div>
				</>
      }
    </div>
  )
}
export default Search