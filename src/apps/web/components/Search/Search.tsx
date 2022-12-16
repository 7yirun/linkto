import React, {useEffect, useRef, useState} from "react";
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import Icons from "../../../../lib/icons";
import {useSelector, useDispatch} from 'react-redux'
import {setDescription, setMapArr, StateType, SearchStateType} from "apps/web/store/store";
import styles from "./Search.module.scss"
// import gasp from "gsap"
import {CSSTransition} from 'react-transition-group'


const Search: React.FC = () => {
  const dispatch = useDispatch();
  const searchState = useSelector<StateType, SearchStateType>(state => state.searchState)
  // const [text, setText] = useState(searchState.description);
  const [showTags, setShowTags] = useState<boolean>(false);
  const smallTagsRef = useRef<HTMLDivElement>(null);
  //当所有标签都未选中时 隐藏small-tag
  useEffect(()=>{
    if(!searchState.mapArr.join('').split(',').join('')){
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
          onChange={(e) => {
            if (e.target.value.length > 200) {
              return;
            }
            dispatch(setDescription(e.target.value));
          }}
        />
        <div className="text-limit">{searchState.description.length + '/200'}</div>
      </div>
      <CSSTransition
        classNames={'small-tags'}
        in={showTags}
        unmountOnExit={true}
        addEndListener={(node, done)=>{
          node.addEventListener('transitionend', done);
        }}
      >
        <div className={'small-tags'}>
          {
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