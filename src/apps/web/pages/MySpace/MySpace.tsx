import styles from "./MySpace.module.scss"
import React, {useCallback, useEffect, useState} from 'react';
import Personal from "apps/web/components/Personal/Personal"
import {getStore} from "utils/utils";
import EditUser from "apps/web/components/EditUser/EditUser"
import {useSelector, useDispatch} from 'react-redux'
import {queryBookmarkList, setClipPrivateStaus} from "service/service"
import Waterfall from "apps/web/components/WaterFall/Waterfall2";
import {useWindowResize} from "../../hooks";
import Header from "apps/web/components/Header/Header"
import ClipPictures from "../Bookmark/Subpage/ClipPictures/ClipPictures";
import EditClip from "apps/web/components/EditClip/EditClip";

const MySpace = (props: any) => {
  const accountInfo = JSON.parse(getStore("accountInfo", true) || '{}');
  const accountId = accountInfo.id;
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.loginState);

  type clipInfo = {
    id: number
    coverPic: string
    type: number
    accountId: number
    isPrivate: number
    name: string
    picNum: number
  }
  //当前展示的画夹
  const [displayedList, setDisplayedList] = useState<clipInfo[]>([]);

  enum COLLECT_TYPE {
    CREATE = 0,  //创作画夹
    BOOKMARK = 1 //收藏画夹
  }

  const [collect, setCollect] = useState(COLLECT_TYPE.CREATE);
  useEffect(() => {
    if (collect === COLLECT_TYPE.CREATE) {
      queryBookmarkList({
        type: COLLECT_TYPE.CREATE,
      }, (res: any) => {
        setDisplayedList(res.data)
      })
    } else {
      queryBookmarkList({
        type: COLLECT_TYPE.BOOKMARK,
      }, (res: any) => {
        setDisplayedList(res.data)
      })
    }
  }, [collect])

  const [clipToEdit, setClipToEdit] = useState<{name:string, id:number}|null>(null)
  const closePanel = useCallback(()=>{
    setClipToEdit(null)
  }, []);
  return (
    <div className={'my-space'}>
      <Header></Header>
      <Personal id={accountId}></Personal>
      <div className={styles.tabs}>
        <div className={collect === COLLECT_TYPE.CREATE ? "sub-tab active" : "sub-tab"}
             onClick={() => {
               setCollect(COLLECT_TYPE.CREATE)
             }}>
          创作
        </div>
        <div className={collect === COLLECT_TYPE.BOOKMARK ? "sub-tab active" : "sub-tab"}
             onClick={() => {
               setCollect(COLLECT_TYPE.BOOKMARK)
             }}>
          收藏
        </div>
      </div>
      <div className={styles['collect-list']}>
        <ul>
          {
            displayedList.map((clip, i) => (
              <li key={i}>
                <div className={'img-wrapper'}>
                  {
                    clip.coverPic ?
                      <img src={clip.coverPic} alt=""/>
                      :
                      <div className="default-cover">
                        <span className={'cover-pic iconfont icon-icon'}>
                          <span className={'path1'}></span>
                          <span className={'path2'}></span>
                          <span className={'path3'}></span>
                      </span>
                      </div>
                  }
                  <div
                    className="hover-icons"
                    onClick={() => {
                      props.history.push("/clip-detail?id=" + clip.id)
                    }}
                  >
                    <span
                      className="iconfont icon-Draw"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(clip);
                        setClipToEdit({
                          name: clip.name,
                          id: clip.id
                        })
                      }}
                    />
                    {
                      clip.isPrivate === 1 ?
                        <span
                          className="iconfont icon-6 locked"
                          onClick={(e) => {
                            e.stopPropagation();
                            //公开
                            setClipPrivateStaus({
                              id: clip.id,
                              isPrivate: 0
                            }, () => {
                              setDisplayedList(displayedList.map((item) => {
                                if (item.id === clip.id) {
                                  item.isPrivate = 0;
                                  return item
                                }
                                return item
                              }))
                            })
                          }}
                        /> :
                        <span
                          className="iconfont icon-23"
                          onClick={(e) => {
                            e.stopPropagation();
                            //设为私密
                            setClipPrivateStaus({
                              id: clip.id,
                              isPrivate: 1
                            }, () => {
                              setDisplayedList(displayedList.map((item) => {
                                if (item.id === clip.id) {
                                  item.isPrivate = 1;
                                  return item
                                }
                                return item
                              }))
                            })
                          }}
                        />
                    }
                  </div>
                  {
                    clip.isPrivate === 1 && <p className={'private-flag'}>私密画夹</p>
                  }
                </div>
                <p>
                  <span className={'collect-name'}>{clip.name}</span>
                  <span className={'pictures-count'}>{clip.picNum}</span>
                </p>
              </li>
            ))
          }
        </ul>
      </div>
      {
        clipToEdit &&
		    <EditClip
          close={closePanel}
          clipInfo={clipToEdit}
		    ></EditClip>
      }
    </div>
  );
};

export default MySpace;