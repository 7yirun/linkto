import React from 'react';
import styles from "./ArtistCard.module.scss"
import Icons from "lib/icons";
import {setEditUser} from "../../store/store";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import {createBScroll} from "@better-scroll/core";
const ArtistCard = (props:any) => {
  interface item{
    key: string;
    value: string|number
  }
  const history = useHistory()
  const listInfo:item[] = [];
  const dispatch = useDispatch();
  const handleClick = ()=>{
    if(props.clickable){
      history.push('/see-artist/sub-mycreate/id=' + props.id)
    }
  }
  return (
    <div className={styles['artist-card']}>
      <div className="profile"
           onClick={handleClick}
           style={{
             pointerEvents: props.clickable? "auto":"none"
           }}
      >
        {
          props &&
			    <img src={props.headPic} alt=""/>
        }
      </div>
      <div className={'personal-info'}>
        <h5 className="personal-name">
          <span>{props && props.accountName}</span>
        </h5>
        <ul className={'other-info'}>
          <li>{'关注'}·{props.focusNum}</li>
          <li>{'粉丝'}·{props.fansNum}</li>
          <li>{'创作'}·{props.picClipNum}</li>
          <li>{'画夹'}·{props.picClipNum}</li>
        </ul>
      </div>
      {
        props.canEditName &&
		    <span className="edit" onClick={()=>{
          dispatch(setEditUser('nickname'))
        }}>
          编辑个人资料
            </span>
      }
    </div>
  );
};

export default ArtistCard;