import {useEffect, useState, useRef} from 'react';
import {createPortal} from "react-dom";
import "./AddToBookmark.scss"
import {message} from "antd";
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

interface IPictures extends Base{
  type: 1
  picId: number    //收藏他人图片用id
  myPictureDto: {
    url: string,   //仅用于展示 不传后台
  }
}

interface ICreate extends Base{
  type: 0
  myPictureDto: {
    url: string,   //收藏创作图片只用传url
  }
}
interface Base{
  onCancle: ()=>void
  updateCallBack?: ()=>void //收藏成功后更新父组件状态
}
type IProps = IPictures | ICreate

const AddToBookmark = (props:IProps) => {
  //画夹列表
  const [list,setList] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const unmountRef = useRef(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [filteredList, setFilteredList] = useState([])
  const wrapperRef = useRef<any>()
  const bsRef = useRef(null);
  const [createVal, setCreateVal] = useState('');
  const [isHover, setIsHover] = useState(0);
  const [isCreate, setIsCreate] = useState(0);
  const [createLen, setCreateLen] = useState(0);
  useEffect(()=>{
    bsRef.current = new BScroll(wrapperRef.current, {
      scrollY: true,
      scrollbar: {
        fade: false
      },
      bounce: false,
      mouseWheel: {}
    });

    queryBookmarkList({type: props.type}, (res:any)=>{
      if(!unmountRef.current){
        let newListData
        newListData = res.data.map((list:any)=>{  
            return {
              ...list, 
              ishover: 0
            }
        })
        setList(newListData);
        setFilteredList((newListData));
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
  const create = (e:any)=>{
    let len = e.target.value.length
    if(len > 16) return
    setCreateLen(e.target.value.length)
    setCreateVal(e.target.value);
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
            <img src={props.myPictureDto.url} alt=""/>
          </div>
        </div>
        <div className="right">
          <h6>收录到画夹</h6>
          <span className={'close '} onClick={onCancle}>
            <i className={'iconfont icon-close'}></i>
          </span>
          <div className="search">
            <input type="text" value={searchVal} onChange={search} placeholder={"搜索画夹"}/>
            <i className={'iconfont icon-search'}></i>
          </div>
          <div ref={wrapperRef} className="scroll-wrapper">
            <ul>
              {
                filteredList.length > 0 &&
                  filteredList.map((val: any, i) => {
                    return (
                      <li key={val.id} className={'pic-folder'} 
                        onMouseEnter={()=>{
                            const c = list.concat();
                            const t = list[i];
                            // @ts-ignore
                            t.ishover = 1;
                            c[i] = t;
                            setList(c);
                        }}
                        onMouseLeave={()=>{
                            const c = list.concat();
                            const t = list[i];
                            // @ts-ignore
                            t.ishover = 0;
                            c[i] = t;
                            setList(c);
                        }}
                        >
                        <p className='pic-info'>
                         { val.coverPic && <img src={val.coverPic} alt=""/>}
                         { !val.coverPic && <i className={'logo iconfont icon-icon'}>
                              <span className={'path1'}></span>
                              <span className={'path2'}></span>
                              <span className={'path3'}></span>
                            </i>
                          }
                          <span> {val.name}</span>
                        </p>
                        <p className={'info'}>
                          { val.ishover==0 && <span>{val.picNum}</span>}
                          { val.ishover==1 && <CapsuleButton onClick={()=>{
                            const req:any = {
                              picClipId: val.id
                            }
                            //收藏创作图片 传url
                            if(props.type === 0){
                              req.myPictureDto = props.myPictureDto
                            }
                            //收藏图库图片 传id
                            if(props.type === 1){
                              req.picId = props.picId
                            }
                            addToBookMark(req, ()=>{
                              message.success('收藏成功!')
                              queryBookmarkList({type:props.type}, (res:any)=>{
                                let newListData
                                newListData = res.data.map((list:any)=>{  
                                    return {
                                      ...list, 
                                      ishover: 0
                                    }
                                })
                                setList(newListData);
                                setSearchVal('');
                                requestAnimationFrame(()=>{
                                  requestAnimationFrame(()=>{
                                    (bsRef.current as any).refresh()
                                  })
                                })
                              })
                              props.updateCallBack && props.updateCallBack()
                            });
                          }}
                          >收藏</CapsuleButton>
                          }
                        </p>
                      </li>
                    )
                  })
              }
            </ul>
          </div>
          {
            isCreate === 0  &&
            <div className="create">
              <div className='establish' onClick={()=>{
                  setIsCreate(1);       
              }}>创建画夹</div> 
            </div>
          }
          {
            isCreate === 1  &&
            <div className="create">
              <div className='content'>
                <input type="text" value={createVal}  onChange={create} placeholder={"请输入画夹名称"}/>
                <span>{createLen}/16</span>
              </div>
              <div className='btns'>
              <CapsuleButton  onClick={()=>{
                            setIsCreate(0);     
                            setCreateVal('');
                        }} className={'cancel'}>取消</CapsuleButton>
               <CapsuleButton onClick={()=>{
                    if(createVal == ''){
                      return
                    }
                    addNewBookmark({
                      clipName: createVal,
                      type: props.type
                    }, ()=>{
                      queryBookmarkList({type:props.type}, (res:any)=>{
                        let newListData
                        newListData = res.data.map((list:any)=>{  
                            return {
                              ...list, 
                              ishover: 0
                            }
                        })
                        setList(newListData);
                        setIsCreate(0); 
                        setCreateVal('');
                        requestAnimationFrame(() => {
                          requestAnimationFrame(()=>{
                            (bsRef.current as any).refresh();
                          })
                        })
                      })
                    })
                  }}>创建</CapsuleButton>
              </div>
            </div>
          }
       
        </div>
      </div>
    </div>
    , root);
};

export default AddToBookmark;