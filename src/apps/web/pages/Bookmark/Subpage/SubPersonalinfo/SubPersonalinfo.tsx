import { useState, useEffect } from "react";
import style from "./index.module.scss";
import Icons from "lib/icons";
import { getFocusList , getWords} from "service/service";
import ArtistCard from "../../../../components/ArtistCard/ArtistCard";
import qs from "qs";
import { useSelector, useDispatch } from "react-redux";
import {
  setEditUser,
  setShowEditUser,
  setShowRegister,
} from "apps/web/store/store";
import styles from "./EditUser.module.scss";
import { getStore } from "utils/utils";
import CapsuleButton from "../../../../components/CapsuleButton/CapsuleButton";
import { editUser, queryVerifyCode } from "service/service";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import PopPanel from "apps/web/layouts/PopPanel/PopPanel";
import md5 from "js-md5";

const SubPersonalinfo = (props: any) => {
  const dispatch = useDispatch();
  const loginState = useSelector((state: any) => state.loginState);

  const accountInfo = loginState.accountInfo;

  const [nickname, setNickname] = useState(accountInfo.accountName || "");
  const [sex, setSex] = useState(accountInfo.sex || "");
  const [age, setAge] = useState(accountInfo.age || "");
  const [interestIds, setInterestIds] = useState(accountInfo.interestIds || "");
  const [interestList, setinterestList] = useState<Array<any>>([])
  const [interestIdList, setinterestIdList] = useState<Array<any>>([])
  //预览头像
  const [headPic, setHeadPic] = useState(accountInfo.headPic || "");
  //原密码
  const [prevPwd, setPrevPwd] = useState("");
  //新密码
  const [password, setPassword] = useState("");
  //重复新密码
  const [password2, setPassword2] = useState("");
  //新手机号
  const [phoneNum, setPhoneNum] = useState("");
  //验证码
  const [verifyCode, setVerifyCode] = useState("");
  const [errInfo, setErrInfo] = useState("");
  const [successInfo, setSuccessInfo] = useState("");
  const [avatarFile, setAvatarFile] = useState();

  useEffect(() => {
    getWords({type: 0}, (res: any) => {
      let list = res.data
      list.forEach((item:any )=> {
         item.checked = false
      })
      setinterestList(list);
      console.log("interestList==",interestList)
    })
  }, [])

  const handleInterest = (obj:any,index:number)=>{
    return ()=>{
      console.log("点击兴趣---",obj,interestIds)
      let isChecked = interestIds.includes(obj.id)
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
      // setFormState({
      //   ...formState,
      //   interestIds: interestIdList.toString()
      // })
      setInterestIds(interestIdList.toString())
      setinterestList(interestIdList);
      setinterestList(newListData);
   }
  }

  const handleClose = () => {
    dispatch(setEditUser(false));
  };

  enum Waiting {
    Start,
    Waiting,
    End,
  }

  const [restTime, setRestTime] = useState<number>(-1);
  let timerId: TimeoutId;
  useEffect(() => {
    if (restTime === 60) {
      timerId = setInterval(() => {
        setRestTime((time) => --time);
      }, 1000);
    } else if (restTime === 0) {
      setCodeWaiting(Waiting.End);
      clearInterval(timerId);
    }
  }, [restTime]);
  const phoneNumRegExp =
    /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-9])|(18[0-9])|166|198|199|191|(147))\d{8}$/;

  const [codeWaiting, setCodeWaiting] = useState<Waiting>(Waiting.Start);
  //请求发送验证码
  const handleQueryVerifyCode = (e: any) => {
    e.preventDefault();
    //如果手机号合法才请求
    if (phoneNumRegExp.test(phoneNum)) {
      queryVerifyCode(phoneNum);
      setErrInfo("");
      setCodeWaiting(Waiting.Waiting);
      startWaiting();
    } else {
      setErrInfo("请输入正确的手机号!");
    }
  };
  //验证码等待输入
  const startWaiting = () => {
    setRestTime(60);
  };
  useEffect(() => {
    setErrInfo("");
  }, [loginState.editUser]);

  const confirm = () => {
    const req: any = {};
    req.id = loginState.accountInfo.id;
    if (nickname) {
      req.accountName = nickname;
    }
    if (avatarFile) {
      req.headPicFile = avatarFile;
    }
    if (prevPwd) {
      req.oldPassword = md5(md5(prevPwd));
      if (!password) {
        setErrInfo("请输入新密码！");
        return;
      }
    }
    if (password || password2) {
      if (password !== password2) {
        setErrInfo("两次输入密码不一致！");
        return;
      }
      req.password = md5(md5(password));
    }
    if (phoneNum) {
      req.bindPhone = phoneNum;
    }
    if (verifyCode) {
      req.verifyCode = verifyCode;
    }

    editUser(
      req,
      () => {
        console.log("succeed");
        setSuccessInfo("修改成功！");
        setTimeout(() => {
          handleClose();
          window.location.reload();
        }, 2000);
      },
      (err: any) => {
        err && setErrInfo(err.msg);
      }
    );
  };
  const close = () => {
   
    setErrInfo('')
  }
  return (
    <div className={style["personal-info"]}>
      <ul className="sub-title-wrapper">
        <li
          onClick={() => {
            dispatch(setEditUser("nickname"));
            console.log("accountInfo====",accountInfo)
          }}
          className={`sub-title ${props.type === "nickname" ? "active" : ""}`}
        >
          <span>修改头像昵称</span>
        </li>
        <li
          className={`sub-title ${props.type === "password" ? "active" : ""}`}
          onClick={() => {
            // setEditType('password')
            dispatch(setEditUser("password"));
          }}
        >
          <span>修改密码</span>
        </li>
        <li
          className={`sub-title ${props.type === "phoneNum" ? "active" : ""}`}
          onClick={() => {
            dispatch(setEditUser("phoneNum"));
          }}
        >
          <span>修改手机号</span>
        </li>
      </ul>
      {loginState.editUser === "nickname" && (
        <div className="info">
          <div className="column-content">
            <div className="column-left">头像</div>
            <div className="column-right profile">
              <img src={headPic} alt="" />
              <p>更换</p>
              <input
                type="file"
                name=""
                id=""
                onChange={(e: any) => {
                  let fileReader = new FileReader();
                  console.log(e.target.files[0]);
                  setAvatarFile(e.target.files[0]);
                  fileReader.readAsDataURL(e.target.files[0]);
                  fileReader.onload = () => {
                    const url = fileReader?.result || "";
                    setHeadPic(url);
                  };
                }}
              />
            </div>
          </div>
          <div className="column-content">
            <div className="column-left">昵称</div>
            <div className={"input-frame"}>
              <input
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                }}
                type="text"
              />
            </div>
          </div>
          <div className="column-content">
            <div className="column-left">性别</div>
            <div className={"input-frame"}>
              <select value={sex}
                onChange={(e) => {
                  setSex(e.target.value);
                }}>
                <option value="0">男</option>
                <option value="1">女</option>
              </select>
            </div>
          </div>
          <div className="column-content">
            <div className="column-left">年龄</div>
            <div className={"input-frame"}>
              <select value={sex}
                onChange={(e) => {
                  setAge(e.target.value);
                }}>
                <option value="0">80后</option>
                <option value="1">90后</option>
                <option value="2">00后</option>
                <option value="3">10后</option>
              </select>
            </div>
          </div>
          <div className="column-content">
            <div className="column-left interest-title">兴趣</div>
            <div className="interest-wrapper">
							<div className="interest" >
                {/*使用请求回来的数据*/}
								<ul>
                  {
                    interestList.map((obj: any, i:number) =>
                      (
                        <li
                          key={'interest' + i}
                          className={obj.checked ? 'choosed' : `${obj.checked}`}  onClick={handleInterest(obj, i)}>
                            {obj.chinese}
                        </li>
                      ))
                  }
                  <li className="add-btn" onClick={(e) => {
                    
                    }}>
                      +
                  </li>
								</ul>
                <span>双击标签可取消兴趣</span>
							</div>
            </div>
          </div>
          <div className="confirm-buttons">
        <CapsuleButton
          onClick={() => {
            handleClose();
          }}
          className={"cancel"}
        >
          重置
        </CapsuleButton>
        <CapsuleButton className={"confirm"} onClick={confirm}>
          保存
        </CapsuleButton>
      </div>
        </div>
      )}

      
      {loginState.editUser === "password" && (
        <div className="content">
          <div className={"input-frame original-pwd"}>
            <input
              type="password"
              value={prevPwd}
              onChange={(e) => {
                setPrevPwd(e.target.value);
              }}
              placeholder={"请输入原密码"}
            />
            <img className={"nickname-icon"} src={Icons.pwd} alt="" />
          </div>
          <div className="input-frame pwd">
            <input
              value={password}
              placeholder={"请设置新密码"}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type="password"
            />
            <img className={"nickname-icon"} src={Icons.pwd} alt="" />
          </div>
          <div className="input-frame pwd">
            <input
              value={password2}
              placeholder={"请确认密码"}
              onChange={(e) => {
                setPassword2(e.target.value);
              }}
              type="password"
            />
            <img className={"nickname-icon"} src={Icons.pwd} alt="" />
          </div>
        </div>
      )}
      {loginState.editUser === "phoneNum" && (
        <div className="content">
          {/*@ts-ignore*/}
          <p className={"tip"}>
            当前绑定手机号码：
            {loginState.accountInfo.bindPhone.replace(
              /^(\d{3})(\d{4})(\d{4})$/,
              "$1-$2-$3"
            )}
          </p>
          <div className="input-frame">
            <input
              value={phoneNum}
              placeholder={"请输入新手机号"}
              onChange={(e) => {
                setPhoneNum(e.target.value);
              }}
              type="text"
            />
            <img className={"nickname-icon"} src={Icons.phone} alt="" />
            <CapsuleButton
              className={codeWaiting === Waiting.Waiting ? "waiting" : ""}
              onClick={handleQueryVerifyCode}
            >
              {codeWaiting === Waiting.Start
                ? "获取验证码"
                : codeWaiting === Waiting.Waiting
                ? `${restTime}秒后可重发`
                : "重新获取验证码"}
            </CapsuleButton>
          </div>
          <div className="input-frame code">
            <img className={"nickname-icon"} src={Icons.pwd} alt="" />
            <input
              value={verifyCode}
              placeholder={"请输入验证码"}
              onChange={(e) => {
                setVerifyCode(e.target.value);
              }}
              type="text"
            />
          </div>
        </div>
      )}
      {/* <div className="confirm-buttons">
        <CapsuleButton
          onClick={() => {
            handleClose();
          }}
          className={"cancel"}
        >
          取消修改
        </CapsuleButton>
        <CapsuleButton className={"confirm"} onClick={confirm}>
          确认修改
        </CapsuleButton>
      </div> */}

    <PopPanel
          close={close}
          className={'login'}
          title={'告诉我们您的兴趣所在'}
          warning={errInfo}
          open={true}
        >
          <div className="interest-wrapper">
							<div className="interest" >
								<ul>
                  {
                    interestList.map((obj: any, i:number) =>
                      (
                        <li
                          key={'interest' + i}
                          className={obj.checked ? 'choosed' : `${obj.checked}`}>
                          <CapsuleButton
                            onClick={handleInterest(obj, i)}
                          >
                            {obj.chinese}
                          </CapsuleButton>
                        </li>
                      ))
                  }
								</ul>
							</div>
            </div>
        </PopPanel>
    </div>
  );
};

export default SubPersonalinfo;
