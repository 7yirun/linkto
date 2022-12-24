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
import { getStore ,setStore} from "utils/utils";
import CapsuleButton from "../../../../components/CapsuleButton/CapsuleButton";
import { editUser, queryVerifyCode ,getPersonalInfo} from "service/service";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import PopPanel from "apps/web/layouts/PopPanel/PopPanel";
import md5 from "js-md5";
import { message } from 'antd';

const SubPersonalinfo = (props: any) => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const loginState = useSelector((state: any) => state.loginState);
  const accountInfo = JSON.parse(getStore("accountInfo", true) || loginState.accountInfo);
  const [nickname, setNickname] = useState(accountInfo.accountName || "");
  const [sex, setSex] = useState(accountInfo.sex || 0);
  const [age, setAge] = useState(accountInfo.age || 0);
  const [interestIds, setInterestIds] = useState(accountInfo.interestIds || "");
  //兴趣集合
  const [interestList, setinterestList] = useState<Array<any>>([]);
  //选中的兴趣
  const [interestIdList, setinterestIdList] = useState<Array<any>>([]);
  //预览头像
  const [headPic, setHeadPic] = useState(accountInfo.headPic || "");
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
  const [errInfo, setErrInfo] = useState("");
  const [successInfo, setSuccessInfo] = useState("");
  const [avatarFile, setAvatarFile] = useState();

  useEffect(() => {
    handleWords(0);
  }, []);

  //获取个人信息
  const hanledPersonInfo = ()=>{
    getPersonalInfo({
      //@ts-ignore
      id: accountInfo.id
    }, ({data}:{data:any})=>{
      setStore('accountInfo', JSON.stringify(data), true);
    })
  }

  const handleWords = (type:number) => {
    getWords({ type: 0 }, (res: any) => {
      let list = res.data;
      let interestSelected:any = [];
      type ? interestSelected = accountInfo.interestIds.split(',') : interestSelected =  interestIds.split(',');
      let interestSelectedList :any= []
       list.map((item: any) => {
        interestSelected.forEach((id: any) => {
          if(item.id == JSON.parse(id)){
            item.checked = true;
            interestSelectedList.push(item)
          }
        });
      });
      setinterestIdList(interestSelectedList)
      setinterestList(list);

      console.log("interestList==", interestSelectedList,list);
    });
  };

  const handleInterest = (obj: any, index: number,type :number) => {
    return () => {
      let isChecked = interestIds.includes(obj.id);
      let newListData;

      newListData = interestList.map((list: any) => {
        if (list.id == obj.id) {
          return {
            ...list,
            checked: obj.checked ? false: true,
          };
        } else {
          return list;
        }
      });
      if(type){
         interestIdList.map((list: any,i:number) => {
          if (list.id == obj.id) {
            interestIdList.splice(index, 1);
          }
        });
      }else{
        isChecked
        ? interestIdList.splice(
            interestIdList.findIndex((item) => item === obj.id),
            1
          )
        : interestIdList.push(obj);
        setinterestIdList(interestIdList)
      }
     let ids:any = []
     interestIdList.map((item:any)=>{
      ids.push(item.id)
     })
      setInterestIds(ids.toString());
      setinterestList(newListData);
    };
  };

  const handleClose = () => {
    // dispatch(setEditUser(false));
    setNickname(accountInfo.accountName);
    setSex(accountInfo.sex);
    setAge(accountInfo.age);
    setHeadPic(accountInfo.headPic);
    setInterestIds(accountInfo.interestIds);
    handleWords(1);
  };

  useEffect(() => {
   
  }, [loginState.editUser]);

  const confirm = () => {
    const req: any = {};
    req.id = accountInfo.id;
    if (nickname) {
      req.accountName = nickname;
    }
    if (avatarFile) {
      req.headPicFile = avatarFile || accountInfo.headPic;
    }
    req.sex = sex;
    req.age = age;
    if (interestIdList.length) {
      let interIds:any = []
       interestIdList.map((item:any)=>{
        interIds.push(item.id)
      })
      req.interestIds = interIds.toString();
    }

    editUser(
      req,
      () => {
        console.log("succeed");
        message.success('修改成功！')
        hanledPersonInfo();
        // setTimeout(() => {
          // window.location.reload();
        // }, 2000);
      },
      (err: any) => {
        message.success(err.msg)
      }
    );
  };
  const close = () => {
    setErrInfo("");
  };
  return (
    <div className={style["personal-info"]}>
     
      { (
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
              <select
                value={sex}
                onChange={(e) => {
                  setSex(e.target.value);
                }}
              >
                <option value="0">男</option>
                <option value="1">女</option>
              </select>
            </div>
          </div>
          <div className="column-content">
            <div className="column-left">年龄</div>
            <div className={"input-frame"}>
              <select
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                }}
              >
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
              <div className="interest">
                {/*使用请求回来的数据*/}
                <ul>
                  {interestIdList.map((obj: any, i: number) => (
                    <li
                      key={"interest" + i}
                      className={obj.checked ? "choosed" : `${obj.checked}`}
                      onDoubleClick={handleInterest(obj, i,1)}
                    >
                      {obj.chinese}
                    </li>
                  ))}
                  <li
                    className="add-btn"
                    onClick={(e) => {
                      setOpen(true);
                    }}
                  >
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

      <PopPanel
        close={close}
        title={"告诉我们您的兴趣所在"}
        warning={errInfo}
        className={"panel-wrapper"}
        open={open}
      >
        <ul>
          {interestList.map((obj: any, i: number) => (
            <li
              key={"interest" + i}
              className={obj.checked ? "choosed" : `${obj.checked}`}
            >
              <CapsuleButton onClick={handleInterest(obj, i,0)}>
                {obj.chinese}
              </CapsuleButton>
            </li>
          ))}
        </ul>
        <div className="pannel-buttons">
          <CapsuleButton
            className={"cancel"}
            onClick={(e: MouseEvent) => {
              setOpen(false);
            }}
          >
            取消
          </CapsuleButton>
          <CapsuleButton className={"confirm"} onClick={(e: MouseEvent) => {
            setOpen(false);
          }}>
            {"完成"}
          </CapsuleButton>
        </div>
      </PopPanel>
    </div>
  );
};

export default SubPersonalinfo;
