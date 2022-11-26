import {useEffect, useState, useRef} from 'react';
import {createPortal} from "react-dom";
import "./AddToBookmark.scss"
import Icons from "lib/icons"
import {queryBookmarkList} from "service/service";
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import {addNewBookmark, addToBookMark} from "service/service";
import ScrollBar from '@better-scroll/scroll-bar'
import BScroll from '@better-scroll/core'
import MouseWheel from "@better-scroll/mouse-wheel";
BScroll.use(ScrollBar);
BScroll.use(MouseWheel);
const root = document.getElementById('confirm-root') as HTMLElement;

const AddToBookmark = (props:any) => {
  //画夹列表
  const [list,setList] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const unmountRef = useRef(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [filteredList, setFilteredList] = useState([])
  const wrapperRef = useRef<any>()
  const bsRef = useRef(null);
  useEffect(()=>{
    bsRef.current = new BScroll(wrapperRef.current, {
      scrollY: true,
      scrollbar: {
        fade: false
      },
      bounce: false,
      mouseWheel: {}
    });
    console.log(bsRef.current);

    queryBookmarkList({type: props.type}, (res:any)=>{
      if(!unmountRef.current){
        // console.log(bsRef.current);
        setList(res.data);
        setFilteredList((res.data));
        requestAnimationFrame(() => {
          (bsRef.current as any).refresh();
        })
      }
    })
    return ()=>{
      unmountRef.current = true;
    }
  },[]);
  useEffect(()=>{
    setFilteredList(list.filter((val)=>{
      //@ts-ignore
      return val && val.name.includes(searchVal)
    }));
  }, [searchVal, list])

  const onCancle = ()=>{
    props.onCancle()
  }
  const search = (e:any)=>{
    setSearchVal(e.target.value);
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        (bsRef.current as any).refresh()
      })
    })
  }
  return createPortal(
    <div className={'add-to-bookmark-wrapper'}>
      <div className="add-to-bookmark">
        <div className="left">
          <div className="img-wrapper">
            <img src={props.url} alt=""/>
          </div>
        </div>
        <div className="right">
          <h6>收录到画夹</h6>
          <i className={'close'} onClick={onCancle}>
            <img src={Icons.close} alt=""/>
          </i>
          <div className="search">
            <input type="text" value={searchVal} onChange={search} placeholder={"搜索或创建画夹"}/>
            <img src={Icons.search} alt=""/>
          </div>
          <div ref={wrapperRef} className="scroll-wrapper">
            <ul>
              {
                filteredList.length > 0 &&
                  filteredList.map((val: any, i) => {
                    return (
                      <li key={val.id} className={'pic-folder'}>
                        <p>{val.name}</p>
                        <p className={'info'}>
                          <span>{val.picNum}</span>
                          <CapsuleButton onClick={()=>{
                            addToBookMark({
                              picClipId: val.id,
                              myPictureDto: {
                                url: props.url,
                              }
                            }, ()=>{
                              queryBookmarkList({type:props.type}, (res:any)=>{
                                setList(res.data)
                                setSearchVal('');
                                requestAnimationFrame(()=>{
                                  requestAnimationFrame(()=>{
                                    (bsRef.current as any).refresh()
                                  })
                                })
                              })
                            });
                          }}>收录</CapsuleButton>
                        </p>
                      </li>
                    )
                  })
              }
              {
                searchVal !==  '' &&
                <li className="add">
                  <CapsuleButton onClick={()=>{
                    addNewBookmark({
                      clipName: searchVal,
                      type: props.type
                    }, ()=>{
                      queryBookmarkList({type:props.type}, (res:any)=>{
                        setList(res.data)
                        setSearchVal('');
                        requestAnimationFrame(() => {
                          requestAnimationFrame(()=>{
                            (bsRef.current as any).refresh();
                          })
                        })
                      })
                    })
                  }}>创建画夹</CapsuleButton>
                  <p>{searchVal}</p>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
    , root);
};

export default AddToBookmark;