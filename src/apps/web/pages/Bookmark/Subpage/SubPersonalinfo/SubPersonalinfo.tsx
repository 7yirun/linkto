import React, { useState, useEffect } from "react";
import style from "./index.module.scss";
import { getWords } from "service/service";
import { useSelector, useDispatch } from "react-redux";
import { setAccountInfo } from "apps/web/store/store";
import { getStore, setStore } from "utils/utils";
import CapsuleButton from "../../../../components/CapsuleButton/CapsuleButton";
import { editUser, getPersonalInfo } from "service/service";
import PopPanel from "apps/web/layouts/PopPanel/PopPanel";
import { message } from "antd";

const SubPersonalinfo = (props: any) => {
  const dispatch = useDispatch();
  const loginState = useSelector((state: any) => state.loginState);
  const accountInfo = JSON.parse(
    getStore("accountInfo", true) || loginState.accountInfo
  );
  const [nickname, setNickname] = useState(accountInfo.accountName || "");
  const [sex, setSex] = useState(accountInfo.sex || 0);
  const [age, setAge] = useState(accountInfo.age || 0);
  //兴趣id字符
  const [interestIds, setInterestIds] = useState(accountInfo.interestIds || "");
  //兴趣集合
  const [interestList, setinterestList] = useState<Array<any>>([]);
  //预览头像
  const [headPic, setHeadPic] = useState(accountInfo.headPic || "");
  const [open, setOpen] = useState(false);
  const [errInfo, setErrInfo] = useState("");
  const [avatarFile, setAvatarFile] = useState();

  useEffect(() => {
    handleWords(0);
  }, []);

  //获取个人信息
  const hanledPersonInfo = () => {
    getPersonalInfo(
      {
        //@ts-ignore
        id: accountInfo.id,
      },
      ({ data }: { data: any }) => {
        setStore("accountInfo", JSON.stringify(data), true);
        console.log(data);
        dispatch(
          setAccountInfo({
            accountInfo: {
              data,
            },
          })
        );
      }
    );
  };

  const handleWords = (type: number) => {
    getWords({ type: 0 }, (res: any) => {
      let list:any = res.data;
      let interestSelected: any = [];
      if(accountInfo.interestIds == '' || interestIds == ''){
        interestSelected = []
      }else{
        type
        ? (interestSelected = accountInfo.interestIds.split(","))
        : (interestSelected = interestIds.split(","));
      }
       
      list.map((item: any) => {
        interestSelected.forEach((id: any) => {
          if (item.id == JSON.parse(id)) {
            item.checked = true;
          }
        });
      });
      setinterestList(list);
    });
  };

  const handleInterest = (obj: any, index: number, type: number) => {
    return () => {
      let status: boolean = false;
      type
        ? (status = false)
        : obj.checked
        ? (status = false)
        : (status = true);

        let newListData: any = [];
        newListData = interestList.map((list: any) => {
          if (list.id == obj.id) {
            return {
              ...list,
              checked: status,
            };
          } else {
            return list;
          }
        });
        setinterestList(newListData);

    };
  };

  const handleClose = () => {
    setNickname(accountInfo.accountName);
    setSex(accountInfo.sex);
    setAge(accountInfo.age);
    setHeadPic(accountInfo.headPic);
    setInterestIds(accountInfo.interestIds);
    handleWords(1);
  };

  const confirm = () => {
    const req: any = {};
    req.id = accountInfo.id;
    let interIds: any = [];
    if (interestList.length) {
      interestList.forEach((item: any) => {
        if(item.checked){
          interIds.push(item.id);
        }
      });
    }
    if(!interIds.length){
        message.error("请最少选择一项兴趣！");
        return;
    }
    req.interestIds = interIds.toString();
    if (nickname) {
      req.accountName = nickname;
    }
    if (avatarFile) {
      req.headPicFile = avatarFile || accountInfo.headPic;
    }
    req.sex = sex;
    req.age = age;

   
    editUser(
      req,
      () => {
        message.success("修改成功！");
        hanledPersonInfo();
      },
      (err: any) => {
        message.success(err.msg);
      }
    );
  };
  const close = () => {
    setErrInfo("");
  };
  return (
    <div className={style["personal-info"]}>
      {
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
                  if (e.target.files && e.target.files[0]) {
                    setAvatarFile(e.target.files[0]);
                    fileReader.readAsDataURL(e.target.files[0]);
                    fileReader.onload = () => {
                      const url = fileReader?.result || "";
                      setHeadPic(url);
                    };
                  }
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
                  {interestList.map((obj: any, i: number) => (
                    obj.checked && <li
                      key={"interest" + i}
                      className={obj.checked ? "choosed" : `${obj.checked}`}
                      onDoubleClick={handleInterest(obj, i, 1)}
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
      }

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
              <CapsuleButton onClick={handleInterest(obj, i, 0)}>
                {obj.chinese}
              </CapsuleButton>
            </li>
          ))}
        </ul>
        <div className="pannel-buttons">
          <CapsuleButton
            className={"cancel"}
            onClick={(e: MouseEvent) => {
              handleWords(1);
              setOpen(false);
            }}
          >
            取消
          </CapsuleButton>
          <CapsuleButton
            className={"confirm"}
            onClick={(e: MouseEvent) => {
              setOpen(false);
            }}
          >
            {"完成"}
          </CapsuleButton>
        </div>
      </PopPanel>
    </div>
  );
};

export default SubPersonalinfo;
