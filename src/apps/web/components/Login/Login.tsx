import React, {useState, useEffect} from 'react';
import PopPanel from "apps/web/layouts/PopPanel/PopPanel";
import './Login.scss'
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import Icons from "lib/icons"
import {useSelector, useDispatch} from 'react-redux'
import {setShowRegister, setShowLogin, setIsLogin, setAccountInfo} from 'apps/web/store/store'
import {pwdLogin, queryVerifyCode, phoneLogin} from "service/service"
import {setStore, getStore} from "utils/utils"
import {TimeoutId} from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import md5 from 'js-md5'

const formData = [
  {
    type: 'phoneNum',
    placeholder: '手机号',
    icon: 'icon-14',
    codeLogin: true,
    pwdLogin: true
  }, {
    type: 'password',
    placeholder: '密码',
    icon: 'icon-6',
    pwdLogin: true
  }, {
    type: 'verifyCode',
    placeholder: '请输入验证码',
    icon: 'icon-18',
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
  const state = useSelector((state: any) => state.loginState);
  const close = () => {
    dispatch(setShowLogin(false));
    setVerifyError(0)
    setErrInfo('')
  }
  const [phoneNum, setPhoneNum] = useState('');
  const [password, setPassWord] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [errInfo, setErrInfo] = useState('');
  //是否采用验证码登录
  const [codeLogin, setCodeLogin] = useState(false);
  const [codeWaiting, setCodeWaiting] = useState<Waiting>(Waiting.Start)
  const [restTime, setRestTime] = useState<number>(-1);
  const [verifyError, setVerifyError] = useState<number>(0);
  const startWaiting = () => {
    setRestTime(60)
  }
  let timerId:TimeoutId;
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
  }, [phoneNum, password, verifyCode, codeLogin])
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
        setVerifyError(1)
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
    <>
      {
        !state.isLogin && state.showLogin &&
        <PopPanel
          className={'login'}
          title={'用户登录'}
          warning={errInfo}
          returnTo={codeLogin}
          handleReturn={codeLogin ? backToPwdLogin : undefined}
          open={!state.isLogin && state.showLogin}
        >
          <form>
            {
              !codeLogin ?
                formData.filter(item => item.pwdLogin).map((item, index) => {
                  return (
                    <div key={'pwd' + index} className="form-item">
                       {
                    //  ( item.type === "password" || item.type === "phoneNum") && verifyError ? 
                    //     <img src={Icons.unchecked} alt=""/>
                    //     : 
                    //     <img src={item.icon} alt=""/>
                    <i className={`iconfont ${item.icon } ${( item.type === "password" || item.type === "phoneNum") &&verifyError ? 'pwd-error' : ''}`}></i>
                      }
                      <input type={item.type === "password" ? "password" : "text"}
                             placeholder={item.placeholder}
                             value={((formData as any)[item.type])}
                             className={ ( item.type === "password" || item.type === "phoneNum") && verifyError ? `password-error` : ''}
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
                      {
                        ( item.type === "password" || item.type === "repeatPassword") ? 
                        <img src={Icons.unchecked} alt=""/>
                        : 
                        <img src={item.icon} alt=""/>
                      }
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
            <div className="pannel-buttons">
              <CapsuleButton onClick={close} className={'cancel'}>取消</CapsuleButton>
              <CapsuleButton onClick={login} className={'confirm'}>登录</CapsuleButton>
            </div>
            {/* {
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
            } */}
          </form>
        </PopPanel>
      }
    </>
  );
};

export default Login;