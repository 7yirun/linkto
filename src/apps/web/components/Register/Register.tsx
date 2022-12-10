import React, {useEffect, useState, useRef} from 'react';
import PopPanel from "apps/web/layouts/PopPanel/PopPanel";
import './Register.scss'
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import Icons from "lib/icons"
import {useDispatch, useSelector} from "react-redux";
import {setShowRegister, setShowLogin} from "../../store/store";
import {queryVerifyCode, register, verifyCode,getList} from "service/service"
import {TimeoutId} from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import {Steps} from 'antd'
import md5 from 'js-md5'

const formData = [{
  type: 'nickname',
  placeholder: '请设置昵称',
  icon: 'icon-21'
}, {
  type: 'phoneNum',
  placeholder: '请输入手机号',
  icon: 'icon-14'
}, {
  type: 'verifyCode',
  placeholder: '请输入验证码',
  icon: 'icon-18'
}, {
  type: 'password',
  placeholder: '请设置密码',
  icon: 'icon-6'
}, {
  type: 'repeatPassword',
  placeholder: '请确认密码',
  icon: 'icon-6'
}]

const steps = [{title: ''}, {title: ''}, {title: ''}, {title: ''}];

const phoneNumRegExp = /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-9])|(18[0-9])|166|198|199|191|(147))\d{8}$/;
let timerId: TimeoutId;


const Register = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.loginState);

  interface IFormState {
    nickname: string,
    phoneNum: string,
    verifyCode: string,
    password: string,
    repeatPassword: string,
    sex: number,
    age: number,
    interestIds: string,
    passwordError: number
  }

  const initialState = {
    nickname: '',
    phoneNum: '',
    verifyCode: '',
    password: '',
    repeatPassword: '',
    sex: 0,
    age: 0,
    interestIds: '',
    passwordError: 0
  }
  const [formState, setFormState] = useState<IFormState>(initialState);
  useEffect(() => {
    setErrInfo("");
    setSuccessInfo("");
  }, [formState])

  //控制当前步骤
  const [current, setCurrent] = useState(0);

  const [registerTitle, setRegisterTitle] = useState<string>('欢迎注册')
  useEffect(() => {
    switch (current) {
      case 0:
        setRegisterTitle('欢迎注册')
        break;
      case 1:
        setRegisterTitle('请问您的性别')
        break;
      case 2:
        setRegisterTitle('请问您的年龄')
        break;
      case 3:
        setRegisterTitle('告诉我们您的兴趣所在')
        break;
    }
  }, [current])

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
    setFormState({
      ...formState,
      passwordError: 0
    })

  }
  //每次打开/关闭时重置填写状态
  useEffect(()=>{
    setFormState(initialState);
    setCurrent(0);
  }, [state.showRegister])
  //请求发送验证码
  const handleQueryVerifyCode = (e: any) => {
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
  useEffect(() => {
    //这里不确定是否需要clear timer, 因为它可能是闭包 下次组件创建时是有值的
    timerId && clearInterval(timerId);
    return () => {
      clearInterval(timerId);
    }
  }, [])

  const handleReturn = () => {
    setCurrent(current - 1);
  }
  //检测数据合法性
  const handleCheck = (e: MouseEvent): boolean => {
    e.preventDefault();
    //如果当前表单存在空值
    if (!formState.phoneNum || !formState.password || !formState.repeatPassword || !formState.nickname || !formState.verifyCode) {
      setErrInfo('请填写完整！')
      return false
    }
    if (!phoneNumRegExp.test(formState.phoneNum)) {
      setErrInfo('请输入正确的手机号！')
      return false
    }
    if (formState.password !== formState.repeatPassword) {
      setErrInfo('密码不一致！')
      setFormState({
        ...formState,
        passwordError: 1
      })
      
      return false
    }
    return true
  }

  //提交注册表单
  const handleSubmit = (e: any) => {
    console.log("注册表单",formState)
    register({
      bindPhone: formState.phoneNum,
      accountName: formState.nickname,
      age: formState.age,
      sex: formState.sex,
      password: md5(md5(formState.password)),
      interestIds:formState.interestIds
    }, ()=>{
      setSuccessInfo("注册成功！")
      setTimeout(()=>{
        dispatch(setShowRegister(false))
        dispatch(setShowLogin(true));
      }, 1000)
    })
  }
  const resetPasswordError = () => {
    if(!formState.password && !formState.repeatPassword){
        setFormState({
          ...formState,
          passwordError: 0
        })
    }
  }
  const [interestList, setinterestList] = useState<Array<any>>(
    []
  )
  const [interestIdList, setinterestIdList] = useState<Array<any>>(
    []
  )

  useEffect(() => {
    getList({type: 0}, (res: any) => {
      let list = res.data
      list.forEach((item:any )=> {
         item.checked = false
      })
      setinterestList(list);
    })
  }, [])

  const handleInterest = (obj:any,index:number)=>{
    return ()=>{
      let isChecked = formState.interestIds.includes(obj.id)
      let newListData
      isChecked ? interestIdList.splice(interestIdList.findIndex(item => item === obj.id), 1) :interestIdList.push(obj.id)

      newListData = interestList.map((list:any)=>{  
        if(list.id == obj.id){
          return {
            ...list, 
            checked: !obj.checked
          }
        }else {
          return list;
        }
      })
      setFormState({
        ...formState,
        interestIds: interestIdList.toString()
      })
      setinterestList(interestIdList);
      setinterestList(newListData);
   }
  }
  
  return (
    <PopPanel
      warning={errInfo}
      success={successInfo}
      open={state.showRegister}
      className={'register'}
      returnTo={current > 0}
      handleReturn={handleReturn}
      title={registerTitle}
    >
      {
        <form>
          {
            current === 0 &&
            formData.map((item, index) => {
              return (
                <div key={index} className="form-item">
                  {
                     <i className={`iconfont ${item.icon } ${( item.type === "password" || item.type === "repeatPassword") &&formState.passwordError ? 'pwd-error' : ''}`}></i>
                  }
                  
                  <input placeholder={item.placeholder}
                         type={item.type === "password" || item.type === "repeatPassword" ? "password" : "text"}
                         value={((formState as any)[item.type])}
                         className={ ( item.type === "password" || item.type === "repeatPassword") && formState.passwordError ? `password-error` : ''}
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
                        codeWaiting === Waiting.Start ? "获取验证码" : (codeWaiting === Waiting.Waiting ? `${restTime}s` : "重新获取验证码")
                      }
										</CapsuleButton>
                  }
                  {
                 ( item.type === "password" || item.type === "repeatPassword") && formState.passwordError === 1  &&
                  <img src={Icons.close1} alt="" className="clear"
                      onClick={(e) => {
                        setFormState({
                          ...formState,
                          [item.type]: ''
                        })
                        resetPasswordError()
                        console.log("formState===",formState)
                        e.stopPropagation();
                      }}
									/>
                  }
                </div>
              )
            })
          }
          {
            current === 1 &&
						<div className={'sex'}>
							<div className={`male ${formState.sex === 0 ? 'choosed' : ''}`}>
								<div className="img">
									<img src={Icons.man} alt="" />
								</div>
								<CapsuleButton
									onClick={(e: MouseEvent) => {
                    e.preventDefault();
                    setFormState({
                      ...formState,
                      sex: 0
                    })
                  }}>男生</CapsuleButton>
							</div>
							<div className={`female ${formState.sex === 1 ? 'choosed' : ''}`}>
								<div className="img">
                   <img src={Icons.woman} alt="" />
								</div>
								<CapsuleButton
									onClick={(e: MouseEvent) => {
                    e.preventDefault()
                    setFormState({
                      ...formState,
                      sex: 1
                    })
                  }}
								>女生</CapsuleButton>
							</div>
						</div>
          }
          {
            current === 2 &&
						<div className="age">
							<div className="img">
              {
                formState.sex === 0 ? 
                <img src={Icons.man} alt="" />
                : 
                <img src={Icons.woman} alt="" />
              }
							</div>
							<ul>
                {
                  ['80后', '90后', '00后', '10后'].map((age: string, i) => (
                    <li
                      key={'age' + i}
                      className={i === formState.age ? 'choosed' : ''}>
                      <CapsuleButton
                        onClick={(e: MouseEvent) => {
                          e.preventDefault();
                          setFormState({
                            ...formState,
                            age: i
                          })
                        }}
                      >
                        {age}
                      </CapsuleButton>
                    </li>
                  ))
                }
							</ul>
						</div>
          }
          {
            current === 3 &&
						<div className="interest">
              {/*使用请求回来的数据*/}
							<ul>
                {
                interestList.map((obj: any, i:number) =>
                 (
                      <li key={'interest' + i} 

                      onClick={handleInterest(obj, i)}
                      
                      className={obj.checked ? 'choosed' : `${obj.checked}`}>
                        
                        <CapsuleButton>
                          {obj.chinese}
                         </CapsuleButton>
                      </li>
                    ))
                }
							</ul>
						</div>
          }
          <Steps
            current={current}
            items={steps}
          />
         
        </form>
      }
       <div className="pannel-buttons">
            <CapsuleButton
              className={'cancel'}
              onClick={close}
            >
              取消
            </CapsuleButton>
            <CapsuleButton
              className={'confirm'}
              onClick={(e: MouseEvent) => {
                if (current < steps.length - 1) {
                  if (current === 0) {
                    if (handleCheck(e)) {
                      //==============================================================================to do
                      verifyCode({
                        bindPhone: formState.phoneNum,
                        verifyCode: formState.verifyCode,
                        accountName: formState.nickname
                      }, ()=>{
                        setCurrent(current + 1)
                      }, (err:any)=>{
                        setErrInfo(err.msg)
                      })
                      // setCurrent(current + 1)
                      
                      //==============================================================================to do
                    }
                    return;
                  }
                  //选择性别
                  if (current === 1) {

                  }
                  //选择年龄
                  if (current === 2) {

                  }
                  setCurrent(current + 1)
                } else {
                  //提交所有数据 完成注册
                  handleSubmit(e)
                }
              }}>
              {
                current < steps.length - 1 ? '继续' : '完成'
              }
            </CapsuleButton>
          </div>
    </PopPanel>
  );
};

export default Register;