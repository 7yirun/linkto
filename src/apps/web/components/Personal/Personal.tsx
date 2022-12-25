import React, {useEffect, useState, useRef} from 'react';
import style from "./Personal.module.scss"
import {getPersonalInfo} from "service/service";
import {setShowEditUser, setShowRegister, setEditUser} from 'apps/web/store/store'
import ArtistCard from "../ArtistCard/ArtistCard";
import {useSelector, useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import qs from "qs";

export interface IAccountInfo {
  accountName: string
  id: number,
  picClipNum: string
  focusNum: string
  bindPhone?: string
  headPic?: string
  fansNum?: number,
  wechat?: string
  hasFocused: boolean
}

const Personal = (props: any) => {
  const history = useHistory()
  //如果路由中传了其他人的id, 则是查看他人主页; 否则查看自己的主页
  const otherId = Number(qs.parse(history.location.search.replace('?', "")).id)

  const dispatch = useDispatch();
  const willUmount = useRef(false)
  const accountId = props.id

  const [accountInfo, setAccountInfo] = useState<IAccountInfo>();
  useEffect(() => {
    return () => {
      willUmount.current = true;
    }
  }, [])
  useEffect(() => {
    const id = otherId || accountId;
    getPersonalInfo({
      id: id
    }, (res: any) => {
      console.log(res.data);
      if (!willUmount.current) {
        setAccountInfo(res.data)
      }
    })
  }, [])
  const [editName, setEditName] = useState(false)

  return (
    <div className={style['personal']}>
      <div className="personal-header">
        {
          accountInfo &&
					<ArtistCard
            accountInfo={accountInfo}
						canEditName={!otherId}
            setAccountInfo={setAccountInfo}
					></ArtistCard>
        }
      </div>
    </div>
  );
};

export default Personal;