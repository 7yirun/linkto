import React, {useEffect, useState, useRef} from 'react';
import Icons from "lib/icons"
import style from "./ClipPicture.module.scss"
import {clipPictures, setPicture, queryImg, addToBookMark, removeFromBookMark} from "service/service"
const ClipPictures = (props:any) => {
  //显示 私密/公开按钮
  const {showPrivate=false} = props;
  //显示 收藏/取消收藏按钮
  const {showBookmark=false} = props;
  const [list, setList] = useState([]);
  const handleSetPublic = (id:number, index: number)=>{
    return ()=>{
      setPicture({
        isPrivate: 0,
        picId: id
      }, ()=>{
        let templist = [...list];
        // @ts-ignore
        templist[index].isPrivate = 0;
        setList(templist)
      })
    }
  }
  const handleSetPrivate = (id:number, index:number)=>{
    return ()=>{
        setPicture({
          isPrivate: 1,
          picId: id
        }, ()=>{
          let templist = [...list];
          // @ts-ignore
          templist[index].isPrivate = 1;
          setList(templist)
        })
    }
  }
  const handleAddToClip = (id:number, index:number)=>{
    return ()=>{
      if(!(list[index] as any).inBookmark){
        addToBookMark({
          picId: id,
          picClipId: props.id
        }, ()=>{
          let templist = [...list];
          (templist[index] as any).inBookmark = true;
          setList(templist)
        })
      }
    }
  }
  const handleRemoveFromClip = (id:number, index:number)=>{
    return ()=>{
      if((list[index] as any).inBookmark){
        removeFromBookMark({
          picId: id,
          pictureClipId: props.id
        }, ()=>{
          let templist = [...list];
          (templist[index] as any).inBookmark = false;
          setList(templist)
        });
      }
    }
  }
  const firstRef = useRef(true);
  useEffect(() => {
    if(firstRef.current || true){
      clipPictures({
        id: props.id
      }, (res: any) => {

        setList(res.data.pictureList.map((item:any)=>{
          item.inBookmark=true
          return item
        }));
      })
    }
  }, [])
  return (
          <div className={style["content"]}>
            <div className="clip-name">
            </div>
            {
              list.map((val: any, index) => {
                return (
                  <div key={val.url+index} className="img-wrapper">
                    <div className="img">
                      <img src={val.url} alt=""/>
                      {
                        val.isPrivate &&
									      <i className={'private'}>
										      <img src={Icons.private} alt=""/>
									      </i>
                      }

                    </div>
                    <p className={'info'}>
                      <span>{`收藏·${val.collectCount}`}</span>
                      {
                        showPrivate &&
                        (
                          val.isPrivate ?
                            <span onClick={handleSetPublic(val.id, index)} className={'set-public'}>公开创作</span>
                            :
                            <span onClick={handleSetPrivate(val.id, index)} className={'set-private'}>设为私密</span>
                        )
                      }
                      {
                        showBookmark &&
                        (
                          !val.inBookmark ?
                            <span onClick={handleAddToClip(val.id, index)} className={'set-public'}>收藏画作</span>
                            :
                            <span onClick={handleRemoveFromClip(val.id, index)} className={'set-private'}>取消收藏</span>
                        )
                      }
                    </p>
                  </div>
                )
              })
            }
          </div>
  );
};

export default ClipPictures;