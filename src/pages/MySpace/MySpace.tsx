import "./MySpace.scss"
import React, {useState} from 'react';
import Personal from "components/Personal/Personal"
import {getStore} from "../../utils/utils";
import EditUser from "components/EditUser/EditUser"
import {useSelector, useDispatch} from 'react-redux'
import {setShowRegister, setShowLogin, setIsLogin, setAccountInfo} from 'store/store'

const MySpace = () => {
  const accountInfo = JSON.parse(getStore("accountInfo", true) || '{}');
  const accountId = accountInfo.id;
  const [edit, setEdit] = useState();
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.loginState);

  return (
    <>
      <Personal id={accountId}></Personal>
      {
        state.editUser &&
        <EditUser type={state.editUser}></EditUser>
      }
    </>
  );
};

export default MySpace;