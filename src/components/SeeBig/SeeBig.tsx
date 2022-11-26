import {useEffect, useState} from 'react';
import "./SeeBig.scss"
import Icons from "lib/icons";
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import {addNewBookmark} from "service/service";
import AddToBookmark from "../AddToBookmark/AddToBookmark";

const SeeBig = (props:any) => {
  const [showAddTo, setShowAddTo] = useState(false);
  useEffect(()=>{
    document.documentElement.style.overflow = 'hidden';
    return ()=>{
      document.documentElement.style.overflow = 'auto';
    }
  }, [])

  const handleAdd = ()=>{
    setShowAddTo(true)
  }
  const cancelAdd=()=>{
    setShowAddTo(false)
  }
  const handleClose = ()=>{
    props.close();
  }


  return (
    <div className={'see-big'}>
      <div className="content">
        <div className="title">
          <h5>我的创作</h5>
          <div onClick={handleClose} className="close">
            <img src={Icons.close} alt=""/>
          </div>
        </div>
        <div className="img-wrapper">
          <img src={props.url} alt=""/>
          {
            showAddTo && <AddToBookmark type={0} onCancle={cancelAdd} url={props.url}></AddToBookmark>
          }
        </div>
        <div className="buttons">
          <CapsuleButton >二次创作</CapsuleButton>
          <CapsuleButton>下载图片</CapsuleButton>
          <CapsuleButton onClick={handleAdd} className={'add'}>收录至画夹</CapsuleButton>
        </div>
      </div>
    </div>
  );
};

export default SeeBig;