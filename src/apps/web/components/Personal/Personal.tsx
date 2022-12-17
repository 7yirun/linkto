import React, {useEffect, useState, useRef} from 'react';
import style from "./Personal.module.scss"
import Icons from "lib/icons"
import {getPersonalInfo} from "service/service";
import {setShowEditUser, setShowRegister, setEditUser, setAccountInfo} from 'apps/web/store/store'
import ArtistCard from "../ArtistCard/ArtistCard";
import {useSelector, useDispatch} from "react-redux";

interface AccountInfo {
  accountName: string
  id: number,
  picClipNum: string
  focusNum: string
  bindPhone?: string
  headPic?: string
  fansNum?: number,
  wechat?: string
}

const Personal = (props: any) => {
  const loginState = useSelector((state: any) => state.loginState);
  const dispatch = useDispatch();
  const willUmount = useRef(false);
  const accountId = props.id
  useEffect(() => {
    return () => {
      willUmount.current = true;
    }
  }, [])
  useEffect(() => {
    getPersonalInfo({
      id: accountId
    }, (res: any) => {
      if (!willUmount.current) {
        dispatch(setAccountInfo(res.data))
      }
    })
  }, [])
  const [editName, setEditName] = useState(false)

  return (
    <div className={style['personal']}>
      <div className="personal-header">
        {
          loginState.accountInfo &&
					<ArtistCard
						headPic={loginState.accountInfo.headPic}
						accountName={loginState.accountInfo.accountName}
						fansNum={loginState.accountInfo.fansNum}
						picClipNum={loginState.accountInfo.picClipNum}
						focusNum={loginState.accountInfo.focusNum}
						canEditName={true}
					></ArtistCard>
        }
      </div>
    </div>
  );
};

export default Personal;