import React, {useState, useEffect} from 'react';
import PopPanel from "../../layouts/PopPanel/PopPanel";
import {useSelector, useDispatch} from 'react-redux'
import {setEditUser, setShowEditUser, setShowRegister} from 'store/store'
import styles from "./EditUser.module.scss"
import {getStore} from 'utils/utils'
import Icons from "lib/icons"
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import {editUser, queryVerifyCode} from "../../service/service";
import {TimeoutId} from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
// import {getPersonalInfo} from "service/service"
import md5 from 'js-md5'

const EditUser = (props: any) => {
  const dispatch = useDispatch();
  const loginState = useSelector((state: any) => state.loginState);

  // console.log(loginState.accountInfo);
  // const accountInfo = JSON.parse(getStore('accountInfo', true) || "{}")
  const accountInfo = loginState.accountInfo;
  const [nickname, setNickname] = useState(accountInfo.accountName || '');
  //预览头像
  const [headPic, setHeadPic] = useState(accountInfo.headPic || '');
  //原密码
  const [prevPwd, setPrevPwd] = useState('')
  //新密码
  const [password, setPassword] = useState("");
  //重复新密码
  const [password2, setPassword2] = useState("");
  //新手机号
  const [phoneNum, setPhoneNum] = useState('');
  //验证码
  const [verifyCode, setVerifyCode] = useState('');
  const [errInfo, setErrInfo] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [avatarFile, setAvatarFile] = useState();

  const handleClose = () => {
    dispatch(setEditUser(false));
  }

  enum Waiting {
    Start,
    Waiting,
    End
  }

  const [restTime, setRestTime] = useState<number>(-1);
  let timerId: TimeoutId;
  useEffect(() => {
    if (restTime === 60) {
      timerId = setInterval(() => {
        setRestTime(time => --time)
      }, 1000)
    } else if (restTime === 0) {
      setCodeWaiting(Waiting.End);
      clearInterval(timerId);
    }
  }, [restTime])
  const phoneNumRegExp = /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-9])|(18[0-9])|166|198|199|191|(147))\d{8}$/;

  const [codeWaiting, setCodeWaiting] = useState<Waiting>(Waiting.Start)
  //请求发送验证码
  const handleQueryVerifyCode = (e: any) => {
    e.preventDefault()
    //如果手机号合法才请求
    if (phoneNumRegExp.test(phoneNum)) {
      queryVerifyCode(phoneNum);
      setErrInfo('');
      setCodeWaiting(Waiting.Waiting);
      startWaiting();
    } else {
      setErrInfo('请输入正确的手机号!');
    }
  }
  //验证码等待输入
  const startWaiting = () => {
    setRestTime(60)
  }
  useEffect(() => {
    setErrInfo('')
  }, [loginState.editUser])

  const confirm = () => {
    const req: any = {};
    req.id = loginState.accountInfo.id
    if (nickname) {
      req.accountName = nickname
    }
    if (avatarFile) {
      req.headPicFile = avatarFile
    }
    if(prevPwd){
      req.oldPassword = md5(md5(prevPwd))
      if(!password){
        setErrInfo('请输入新密码！')
        return
      }
    }
    if(password || password2){
      if(password !== password2){
        setErrInfo('两次输入密码不一致！')
        return
      }
      req.password = md5(md5(password))
    }
    if(phoneNum){
      req.bindPhone = phoneNum;
    }
    if(verifyCode){
      req.verifyCode = verifyCode
    }


    editUser(req, () => {
      console.log('succeed');
      setSuccessInfo('修改成功！')
      setTimeout(()=>{
        handleClose()
        window.location.reload();
      }, 2000)
    }, (err: any) => {
      err && setErrInfo(err.msg);
    })
  }


  return (
    <PopPanel warning={errInfo}
              success={successInfo}
              className={styles['edit-user']} close={handleClose} title={'用户资料'}>
      <ul className="sub-title-wrapper">
        <li
          onClick={() => {
            dispatch(setEditUser('nickname'))
          }} className={`sub-title ${props.type === 'nickname' ? 'active' : ''}`}>
          <span>修改头像昵称</span>
        </li>
        <li className={`sub-title ${props.type === 'password' ? 'active' : ''}`} onClick={() => {
          // setEditType('password')
          dispatch(setEditUser('password'))
        }}>
          <span>修改密码</span>
        </li>
        <li className={`sub-title ${props.type === 'phoneNum' ? 'active' : ''}`} onClick={() => {
          dispatch(setEditUser('phoneNum'))
        }}>
          <span>修改手机号</span>
        </li>
      </ul>
      {
        loginState.editUser === 'nickname' &&
				<div className="content">
					<div className="profile">
						<img src={headPic} alt=""/>
						<p>点击上传新头像</p>
						<input type="file" name="" id=""
						       onChange={(e: any) => {
                     let fileReader = new FileReader();
                     console.log(e.target.files[0]);
                     setAvatarFile(e.target.files[0])
                     fileReader.readAsDataURL(e.target.files[0])
                     fileReader.onload = () => {
                       const url = fileReader?.result || '';
                       setHeadPic(url);
                     }
                   }}
						/>
					</div>
					<div className={'input-frame'}>
						<input value={nickname} onChange={(e) => {
              setNickname(e.target.value)
            }} type="text"/>
						<img className={'nickname-icon'} src={Icons.nickname} alt=""/>
            {
              nickname &&
							<img className={'clear-text'}
							     src={Icons.clear_text}
							     onClick={() => {
                     setNickname('')
                   }}
							/>
            }
					</div>
				</div>
      }
      {
        loginState.editUser === 'password' &&
				<div className="content">
					<div className={'input-frame original-pwd'}>
						<input type="password" value={prevPwd} onChange={(e)=>{
              setPrevPwd(e.target.value)
            }} placeholder={'请输入原密码'}/>
						<img className={'nickname-icon'} src={Icons.pwd} alt=""/>
					</div>
					<div className="input-frame pwd">
						<input value={password} placeholder={'请设置新密码'} onChange={(e) => {
              setPassword(e.target.value)
            }} type="password"/>
						<img className={'nickname-icon'} src={Icons.pwd} alt=""/>
					</div>
					<div className="input-frame pwd">
						<input value={password2} placeholder={'请确认密码'} onChange={(e) => {
              setPassword2(e.target.value)
            }} type="password"/>
						<img className={'nickname-icon'} src={Icons.pwd} alt=""/>
					</div>
				</div>
      }
      {
        loginState.editUser === 'phoneNum' &&
				<div className="content">
          {/*@ts-ignore*/}
					<p
						className={'tip'}>当前绑定手机号码：{loginState.accountInfo.bindPhone.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3')}</p>
					<div className="input-frame">
						<input value={phoneNum} placeholder={'请输入新手机号'} onChange={(e) => {
              setPhoneNum(e.target.value)
            }} type="text"/>
						<img className={'nickname-icon'} src={Icons.phone} alt=""/>
						<CapsuleButton className={codeWaiting === Waiting.Waiting ? 'waiting' : ''}
						               onClick={handleQueryVerifyCode}>
              {
                codeWaiting === Waiting.Start ? "获取验证码" : (codeWaiting === Waiting.Waiting ? `${restTime}秒后可重发` : "重新获取验证码")
              }
						</CapsuleButton>
					</div>
					<div className="input-frame code">
						<img className={'nickname-icon'} src={Icons.pwd} alt=""/>
						<input value={verifyCode} placeholder={'请输入验证码'} onChange={(e) => {
              setVerifyCode(e.target.value)
            }} type="text"/>
					</div>
				</div>
      }
      <div className="confirm-buttons">
        <CapsuleButton onClick={() => {
          handleClose();
        }} className={'cancel'}>取消修改</CapsuleButton>
        <CapsuleButton className={'confirm'}
                       onClick={confirm}
        >确认修改</CapsuleButton>
      </div>
    </PopPanel>
  );
};

export default EditUser;