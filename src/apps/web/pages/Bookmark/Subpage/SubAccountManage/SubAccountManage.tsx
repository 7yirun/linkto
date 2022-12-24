import { useState, useEffect } from "react";
import style from "./index.module.scss";
import Icons from "lib/icons";
import { getFocusList, getWords } from "service/service";
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
import { editUser, queryVerifyCode, verifyCodeApi } from "service/service";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import PopPanel from "apps/web/layouts/PopPanel/PopPanel";
import md5 from "js-md5";
import { message } from "antd";

const SubPersonalinfo = (props: any) => {
  const dispatch = useDispatch();
  const loginState = useSelector((state: any) => state.loginState);
  const accountInfo = JSON.parse(
    getStore("accountInfo", true) || loginState.accountInfo
  );
  console.log("accountInfo===", accountInfo);
  //原密码
  const [prevPwd, setPrevPwd] = useState("");
  //新密码
  const [password, setPassword] = useState("");
  //重复新密码
  const [password2, setPassword2] = useState("");
  const [open, setOpen] = useState(false);
  //新手机号
  const [phoneNum, setPhoneNum] = useState("");
  //验证码
  const [verifyCode, setVerifyCode] = useState("");
  //控制当前步骤
  const [current, setCurrent] = useState({
    type: "phone", //password,phone
    step: 0,
  });
  enum Waiting {
    Start,
    Waiting,
    End,
  }

  const [codeWaiting, setCodeWaiting] = useState<Waiting>(Waiting.Start);
  useEffect(() => {}, []);
  const phoneNumRegExp =
    /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-9])|(18[0-9])|166|198|199|191|(147))\d{8}$/;
  let timerId: TimeoutId;
  const [restTime, setRestTime] = useState<number>(-1);
  //验证码等待输入
  const startWaiting = () => {
    setRestTime(60);
  };
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

  useEffect(() => {}, [loginState.editUser]);

  const confirm = () => {
    const req: any = {};
    req.id = accountInfo.id;
    if (prevPwd) {
      req.oldPassword = md5(md5(prevPwd));
      if (!password) {
        message.error("请输入新密码！");
        return;
      }
    }
    if (password || password2) {
      if (password !== password2) {
        message.error("两次输入密码不一致！");
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
        message.success("修改成功！");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      (err: any) => {
        message.error(err.msg);
      }
    );
  };
  const close = () => {
    message.error("");
  };
  return (
    <div className={style["personal-info"]}>
      {
        <div className="info">
          {current.type == "phone" && current.step == 0 && (
            <div>
              <div className="column-content">
                <div className="column-left">手机号</div>
                <div className={"input-frame"}>
                  <input value={accountInfo.bindPhone} disabled type="text" />
                </div>
                <CapsuleButton
                  onClick={() => {
                    setCurrent({
                      type: "phone",
                      step: 1,
                    });
                  }}
                  className={"change"}
                >
                  更换
                </CapsuleButton>
              </div>

              <div className="column-content">
                <div className="column-left">密码</div>
                <div className={"input-frame"}>
                  <input
                    value={prevPwd}
                    type="password"
                    onChange={(e) => {
                      setPrevPwd(e.target.value);
                    }}
                  />
                </div>
                <CapsuleButton
                  onClick={() => {
                    setCurrent({
                      type: "password",
                      step: 1,
                    });
                  }}
                  className={"change"}
                >
                  更换
                </CapsuleButton>
              </div>
            </div>
          )}

          {current.type == "phone" && current.step == 1 && (
            <div>
              <div className="column-content">
                <div className="column-left">手机号</div>
                <div className={"input-frame"}>
                  <input value={accountInfo.bindPhone} disabled type="text" />
                </div>
              </div>

              <div className="column-content">
                <div className="column-left"></div>
                <div className={"input-frame"}>
                  <input
                    value={verifyCode}
                    type="text"
                    placeholder="请输入验证码"
                    onChange={(e) => {
                      setVerifyCode(e.target.value);
                    }}
                  />
                  <CapsuleButton
                    className={codeWaiting === Waiting.Waiting ? "waiting" : ""}
                    onClick={(e:any) => {
                      e.preventDefault()
                      if (phoneNumRegExp.test(accountInfo.bindPhone)) {
                        queryVerifyCode(accountInfo.bindPhone);
                        setCodeWaiting(Waiting.Waiting);
                        startWaiting();
                      } else {
                        message.error("请输入正确的手机号!");
                      }
                    }}
                    
                  >
                    {codeWaiting === Waiting.Start
                      ? "获取验证码"
                      : codeWaiting === Waiting.Waiting
                      ? `${restTime}s`
                      : "重新获取验证码"}
                  </CapsuleButton>
                </div>
              </div>
            </div>
          )}

          {current.type == "phone" && current.step == 2 && (
            <div>
              <div className="column-content">
                <div className="column-left">手机号</div>
                <div className={"input-frame"}>
                  <input
                    value={phoneNum}
                    type="text"
                    placeholder="请输入新手机号"
                    onChange={(e) => {
                      setPhoneNum(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="column-content">
                <div className="column-left"></div>
                <div className={"input-frame"}>
                  <input
                    value={verifyCode}
                    type="text"
                    placeholder="请输入验证码"
                    onChange={(e) => {
                      setVerifyCode(e.target.value);
                    }}
                  />
                  <CapsuleButton
                    className={codeWaiting === Waiting.Waiting ? "waiting" : ""}
                    onClick={(e:any) => {
                      e.preventDefault()
                      if (phoneNumRegExp.test(phoneNum)) {
                        queryVerifyCode(phoneNum);
                        setCodeWaiting(Waiting.Waiting);
                        startWaiting();
                      } else {
                        message.error("请输入正确的手机号!");
                      }
                    }}
                  >
                    {codeWaiting === Waiting.Start
                      ? "获取验证码"
                      : codeWaiting === Waiting.Waiting
                      ? `${restTime}s`
                      : "重新获取验证码"}
                  </CapsuleButton>
                </div>
              </div>
            </div>
          )}

          {current.type == "password" && current.step == 1 && (
            <div>
              <div className="column-content">
                <div className="column-left">手机号</div>
                <div className={"input-frame"}>
                  <input value={accountInfo.bindPhone} disabled type="text" />
                </div>
              </div>

              <div className="column-content">
                <div className="column-left">密码</div>
                <div className={"input-frame"}>
                  <input
                    value={prevPwd}
                    type="password"
                    placeholder="旧密码"
                    onChange={(e) => {
                      setPrevPwd(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="column-content">
                <div className="column-left"></div>
                <div className={"input-frame"}>
                  <input
                    value={password}
                    type="password"
                    placeholder="新密码"
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="column-content">
                <div className="column-left"></div>
                <div className={"input-frame"}>
                  <input
                    value={password2}
                    type="password"
                    placeholder="确认密码"
                    onChange={(e) => {
                      setPassword2(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {current.step > 0 && (
            <div className="confirm-buttons">
              <CapsuleButton
                onClick={() => {
                  setCurrent({
                    type: "phone",
                    step: 0,
                  });
                }}
                className={"cancel"}
              >
                取消
              </CapsuleButton>
              <CapsuleButton
                className={"confirm"}
                onClick={() => {
                  if (current.type == "phone" && current.step == 1) {
                    const req: any = {};
                    req.accountName = accountInfo.accountName;
                    req.bindPhone = accountInfo.bindPhone;
                    req.verifyCode = verifyCode;

                    verifyCodeApi(
                      req,
                      () => {
                        setCodeWaiting(Waiting.Start);
                        setVerifyCode("");
                        clearInterval(timerId);
                        setCurrent({
                          type: "phone",
                          step: 2,
                        });
                      },
                      (err: any) => {
                        message.error(err.msg);
                      }
                    );
                  } else {
                    confirm();
                  }
                }}
              >
                {current.type == "phone" && current.step == 1
                  ? "下一步"
                  : current.step == 2
                  ? "完成"
                  : "保存"}
              </CapsuleButton>
            </div>
          )}
        </div>
      }
    </div>
  );
};

export default SubPersonalinfo;
