import React, {useEffect, useState, useRef} from 'react';
import PopPanel from "layouts/PopPanel/PopPanel";
import './Register.scss'
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import Icons from "lib/icons"
import {useDispatch, useSelector} from "react-redux";
import {setShowRegister, setShowLogin} from "../../store/store";
import {queryVerifyCode, register} from "service/service"
import {TimeoutId} from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import md5 from 'js-md5'

const formData = [{
  type: 'nickname',
  placeholder: '请设置昵称',
  icon: Icons.nickname
}, {
  type: 'phoneNum',
  placeholder: '请输入手机号',
  icon: Icons.phone
}, {
  type: 'verifyCode',
  placeholder: '请输入验证码',
  icon: Icons.pwd
}, {
  type: 'password',
  placeholder: '请设置密码',
  icon: Icons.pwd
}, {
  type: 'repeatPassword',
  placeholder: '请确认密码',
  icon: Icons.pwd
}]
const phoneNumRegExp = /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-9])|(18[0-9])|166|198|199|191|(147))\d{8}$/;
let timerId:TimeoutId;
const Register = () => {
  const dispatch = useDispatch();
  const [formState, setFormState] = useState<any>({
    nickname: '',
    phoneNum: '',
    verifyCode: '',
    password: '',
    repeatPassword: ''
  });

  //表单数据合法性校验
  const [formDataCheck, setFormDataCheck] = useState({
    nickname: false,
    phoneNum: false,  //目前没用到
    verifyCode: false,
    password: false,  //目前没用到
    repeatPassword: false,//目前没用到
    agree: false //是否同意协议
  })

  enum Waiting {
    Start,
    Waiting,
    End
  }

  const [codeWaiting, setCodeWaiting] = useState<Waiting>(Waiting.Start)
  const [errInfo, setErrInfo] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const close = () => {
    dispatch(setShowRegister(false));
  }

  //请求发送验证码
  const handleQueryVerifyCode = (e:any) => {
    e.preventDefault()
    //如果手机号合法才请求
    if (phoneNumRegExp.test(formState.phoneNum)) {
      queryVerifyCode(formState.phoneNum);
      setErrInfo('');
      setCodeWaiting(Waiting.Waiting);
      startWaiting();
    } else {
      setErrInfo('请输入正确的手机号!');
    }
  }
  const [restTime, setRestTime] = useState<number>(-1);
  //验证码等待输入
  const startWaiting = () => {
    setRestTime(60)
  }
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

  //返回登录
  const backToLogin = ()=>{
    close();
    dispatch(setShowLogin(true))
  }

  //提交注册表单
  const handleSubmit = (e:any) => {
    e.preventDefault();
    let flag = true;
    for (let key in formState) {
      flag = flag && formState[key];
    }
    //如果当前表单存在空值
    if(!flag){
      setErrInfo('请填写完整！')
      return
    }
    if(!phoneNumRegExp.test(formState.phoneNum)){
      setErrInfo('请输入正确的手机号！')
      return
    }
    if(!formDataCheck.agree){
      setErrInfo('请阅读并接受用户协议！')
      return
    }
    if(formState.password !== formState.repeatPassword){
      setErrInfo('两次输入密码不一致！')
      return
    }
    register({
      accountName: formState.nickname,
      bindPhone: formState.phoneNum,
      password: md5(md5(formState.password)),
      verifyCode: formState.verifyCode
    }, (res: any) => {
      //如果注册成功 则返回到登录页面
      setSuccessInfo("注册成功！")
      setTimeout(()=>{
        dispatch(setShowRegister(false));
        dispatch(setShowLogin(true));
      }, 1000)
    }, (err:any)=>{
      err && setErrInfo(err.msg);
    })
  }
  return (
    <PopPanel
      warning={errInfo}
      success={successInfo}
      close={close}
      className={'register'}
      returnTo={'返回登录'}
      handleReturn={backToLogin}
      title={'注册'}
    >
      <form>
        {
          formData.map((item, index) => {
            return (
              <div key={index} className="form-item">
                <img src={item.icon} alt=""/>
                <input placeholder={item.placeholder}
                       type={item.type === "password" || item.type === "repeatPassword" ? "password" : "text"}
                       value={((formState as any)[item.type])}
                       onChange={(e) => {
                         setFormState({
                           ...formState,
                           [item.type]: (e.target as any).value
                         })
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
        <p onClick={()=>{setFormDataCheck({
          ...formDataCheck,
          agree: true
        })}}>
          <img src={formDataCheck.agree ? Icons.checked : Icons.unchecked} alt=""/>
          已经阅读并接受
          <span>《灵图用户协议》</span>
        </p>
        <CapsuleButton onClick={handleSubmit}>确认</CapsuleButton>
      </form>
    </PopPanel>
  );
};

export default Register;