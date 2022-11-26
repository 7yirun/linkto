import React, {useState, useEffect} from 'react';
import PopPanel from "layouts/PopPanel/PopPanel";
import './Login.scss'
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import Icons from "lib/icons"
import {useSelector, useDispatch} from 'react-redux'
import {setShowRegister, setShowLogin, setIsLogin, setAccountInfo} from 'store/store'
import {pwdLogin, queryVerifyCode, phoneLogin} from "service/service"
import {setStore, getStore} from "utils/utils"
import {TimeoutId} from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import md5 from 'js-md5'

const formData = [
  {
    type: 'phoneNum',
    placeholder: '请输入手机号',
    icon: Icons.phone,
    codeLogin: true,
    pwdLogin: true
  }, {
    type: 'password',
    placeholder: '请输入密码',
    icon: Icons.pwd,
    pwdLogin: true
  }, {
    type: 'verifyCode',
    placeholder: '请输入验证码',
    icon: Icons.pwd,
    codeLogin: true
  }
];

enum Waiting {
  Start,
  Waiting,
  End
}

const phoneNumRegExp = /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-9])|(18[0-9])|166|198|199|191|(147))\d{8}$/;
const Login = () => {
  const dispatch = useDispatch();
  const close = () => {
    dispatch(setShowLogin(false))
  }
  const [phoneNum, setPhoneNum] = useState('');
  const [password, setPassWord] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [errInfo, setErrInfo] = useState('');
  //是否采用验证码登录
  const [codeLogin, setCodeLogin] = useState(false);
  const [codeWaiting, setCodeWaiting] = useState<Waiting>(Waiting.Start)
  const [restTime, setRestTime] = useState<number>(-1);
  const startWaiting = () => {
    setRestTime(60)
  }
  let timerId:TimeoutId;
  useEffect(()=>{
    setErrInfo('');
  }, [codeLogin])
  useEffect(()=>{
    if(restTime === 60){
      timerId = setInterval(()=>{
        setRestTime(time=>--time)
      }, 1000)
    } else if(restTime === 0){
      setCodeWaiting(Waiting.End);
      clearInterval(timerId);
    }
  }, [restTime])
  useEffect(()=>{
    //这里不确定是否需要clear timer, 因为它可能是闭包 下次组件创建时是有值的
    timerId && clearInterval(timerId);
    return ()=>{
      clearInterval(timerId);
    }
  }, [])
  useEffect(()=>{
    setErrInfo("");
  }, [phoneNum, password, ])
  const backToPwdLogin = () => {
    setCodeLogin(false);
  }
  const login = (e:any) => {

    e.preventDefault()
    //账号密码登录
    if (!codeLogin) {
      if (!phoneNumRegExp.test(phoneNum)) {
        setErrInfo('请输入正确的手机号!')
        return
      }
      if (password == '') {
        setErrInfo('请输入密码!');
        return
      }
      pwdLogin({
        bindPhone: phoneNum,
        password: md5(md5(password))
      }, afterLogin, (err: any) => {
        err && setErrInfo(err.msg);
      })
    }
    //验证码登录
    else {
      if (!phoneNumRegExp.test(phoneNum)) {
        setErrInfo('请输入正确的手机号!')
        return
      }
      if (verifyCode === '') {
        setErrInfo('请输入验证码!');
        return
      }
      phoneLogin({
        bindPhone: phoneNum,
        verifyCode: verifyCode
      }, afterLogin, (err:any)=>{
        err && setErrInfo(err.msg)
      })
    }

  }

  //登录成功后
  const afterLogin = (res: any) => {
    const token: string = res.data.token;
    const accountInfo: string = JSON.stringify(res.data.accountInfo);
    setStore('token', token, true);
    setStore('accountInfo', accountInfo, true);
    dispatch(setIsLogin(true));
    dispatch(setShowLogin(false));
    dispatch(setAccountInfo(res.data.accountInfo));
  }

  //请求发送验证码
  const handleQueryVerifyCode = (e:any) => {
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

  return (
    <PopPanel
      close={close}
      className={'login'}
      title={'用户登录'}
      warning={errInfo}
      returnTo={codeLogin ? '返回账号密码登录' : undefined}
      handleReturn={codeLogin ? backToPwdLogin : undefined}
    >
      <form>
        {
          !codeLogin ?
            formData.filter(item => item.pwdLogin).map((item, index) => {
              return (
                <div key={'pwd' + index} className="form-item">
                  <img src={item.icon} alt=""/>
                  <input type={item.type === "password" ? "password" : "text"}
                         placeholder={item.placeholder}
                         value={((formData as any)[item.type])}
                         onChange={(e) => {
                           if (item.type === "password") {
                             setPassWord(e.target.value)
                           } else if (item.type === "phoneNum") {
                             setPhoneNum(e.target.value)
                           }
                         }}
                  />
                  {
                    item.type === "verifyCode"
                    &&
										<CapsuleButton className={codeWaiting === Waiting.Waiting ? 'waiting' : ''}
										               onClick={handleQueryVerifyCode}>
                      {
                        codeWaiting === Waiting.Start ? "获取验证码" : (codeWaiting === Waiting.Waiting ? `${restTime}秒后可重发` : "重新获取验证码")
                      }
										</CapsuleButton>
                  }
                </div>
              )
            })
            :
            formData.filter(item => item.codeLogin == true).map((item, index) => {
              return (
                <div key={'code' + index} data-key={'code' + index} className="form-item">
                  <img src={item.icon} alt=""/>
                  <input type={item.type === "password" ? "password" : "text"}
                         placeholder={item.placeholder}
                         value={((formData as any)[item.type])}
                         onChange={(e) => {
                           if (item.type === "phoneNum") {
                             setPhoneNum(e.target.value)
                           } else if (item.type === "verifyCode") {
                             setVerifyCode(e.target.value)
                           }
                         }}
                  />
                  {
                    item.type === "verifyCode"
                    &&
                    <CapsuleButton className={codeWaiting === Waiting.Waiting ? 'waiting' : ''}
                                   onClick={handleQueryVerifyCode}>
                      {
                        codeWaiting === Waiting.Start ? "获取验证码" : (codeWaiting === Waiting.Waiting ? `${restTime}秒后可重发` : "重新获取验证码")
                      }
                    </CapsuleButton>
                  }
                </div>
              )
            })

        }
        <CapsuleButton onClick={login}>登录</CapsuleButton>
        {
          !codeLogin &&
					<>
						<div className={'cannot-login'}>
							<p onClick={() => {
                dispatch(setShowRegister(true))
                dispatch(setShowLogin(false))
              }}>立即注册</p>
							<p onClick={() => {
                setCodeLogin(true);
                setPhoneNum("");
                setErrInfo("");
              }}>忘记密码</p>
						</div>
						<div className={'other-login'}>
							<p className={'wechat'}
                onClick={()=>{
                  setErrInfo('该功能暂未开通')
                }}
              >
								<img src={Icons.wechat} alt=""/>
								<span>微信扫码登录</span>
							</p>
							<p className={'varify-code'}
							   onClick={()=>{
                   setCodeLogin(true);
                   setPhoneNum("");
                   setErrInfo("");
                 }}
              >
								<img src={Icons.varify} alt=""/>
								<span>手机验证码登录</span>
							</p>
						</div>
					</>
        }
      </form>
    </PopPanel>
  );
};

export default Login;