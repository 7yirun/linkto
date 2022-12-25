import React from 'react';
import styles from "./ArtistCard.module.scss"
import {setEditUser} from "../../store/store";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import {focus, unFocus} from "service/service"
import {IAccountInfo} from "../Personal/Personal"


interface IProps {
  accountInfo: IAccountInfo
  canEditName: boolean
  setAccountInfo?: (arg:IAccountInfo)=>void  //用于更新关注信息
}

const ArtistCard = ({accountInfo, canEditName, setAccountInfo}: IProps) => {
  interface item {
    key: string;
    value: string | number
  }

  const history = useHistory()
  const listInfo: item[] = [];
  const dispatch = useDispatch();

  return (
    <div className={styles['artist-card']}>
      <div className="profile">
        {
          accountInfo &&
					<img src={accountInfo.headPic} alt=""/>
        }
      </div>
      <div className={'personal-info'}>
        <h5 className="personal-name">
          <span>{accountInfo && accountInfo.accountName}</span>
        </h5>
        <ul className={'other-info'}>
          <li>{'关注'}·{accountInfo.focusNum}</li>
          <li>{'粉丝'}·{accountInfo.fansNum}</li>
          <li>{'创作'}·{accountInfo.picClipNum}</li>
          <li>{'画夹'}·{accountInfo.picClipNum}</li>
        </ul>
      </div>
      {
        canEditName ?
          <span
            className="edit"
            onClick={() => {
              dispatch(setEditUser('nickname'))
              history.push('/bookmark/sub-personalinfo')
            }}
          >
            编辑个人资料
          </span>
          :
          <span
            className={`${accountInfo.hasFocused ? 'followed' : 'follow'}`}
            onClick={() => {
              if (accountInfo.hasFocused) {
                setAccountInfo && setAccountInfo({
                  ...accountInfo,
                  hasFocused: false
                });
                unFocus({
                  focusedAccountId: accountInfo.id
                })
              } else {
                setAccountInfo && setAccountInfo({
                  ...accountInfo,
                  hasFocused: true
                });
                focus({
                  focusedAccountId: accountInfo.id
                })
              }
            }}
          >
            {`${accountInfo.hasFocused ? "已关注" : "关注"}`}
          </span>
      }
    </div>
  );
};

export default ArtistCard;