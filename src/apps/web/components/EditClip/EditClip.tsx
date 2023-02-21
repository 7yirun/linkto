import React, {useState} from 'react';
import PopPanel from "apps/web/layouts/PopPanel/PopPanel";
import styles from "./EditClip.module.scss"
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import {renameClip, deleteClip} from "service/service"
import Icons from "lib/icons"

type propType = {
  clipInfo: {
    name: string //原来的画夹名
    id: number //画夹id
  }
  close: () => void
}
const EditClip = (props: propType) => {
  const [value, setValue] = useState(props.clipInfo.name);
  //修改成功的提示
  const [success, setSuccess] = useState('');
  const [errInfo, setErrInfo] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  return (
    <>
         {
        <PopPanel
          open={!!props.clipInfo}
          title={'修改画夹'}
          success={success}
          warning={errInfo}
        >
          <div className={styles["wrapper"]}>
            <div className="clip-name-wrapper">
              <img src={Icons.nickname} alt="" className="nickname"/>
              <input type="text"
                     className={'clip-name'}
                     value={value}
                     onChange={(e) => {
                       setErrInfo("");
                       setValue(e.target.value);
                     }}
              />
              {
                value && <img src={Icons.clear_text} alt="" className="clear"
								              onClick={() => {
                                setValue("");
                              }}
								/>
              }
            </div>
            <div className="buttons">
              <CapsuleButton
                className={'cancel'}
                onClick={() => {
                props.close()
              }}>取消</CapsuleButton>
              <CapsuleButton onClick={() => {
                if (!value) {
                  setErrInfo('请输入画夹名称！');
                  return
                }
                renameClip({
                  clipName: value,
                  id: props.clipInfo.id
                }, () => {
                  setSuccess('修改成功！')
                  setTimeout(() => {
                    props.close();
                    window.location.reload()
                  }, 1000)
                })
              }}>确认</CapsuleButton>
            </div>
            <div className="del-clip"
                 onClick={() => {
                   setShowWarning(true)
                 }}
            >
              <img src={Icons.del_clip} alt=""/>
              <span>删除画夹</span>
            </div>
          </div>
        </PopPanel>
      }
      {
        <PopPanel
          open={showWarning}
          success={success}
          className={styles['warning-popup']}
          close={() => {
            setShowWarning(false)
          }}
          title={"温馨提示"}>
          <div className="content-in">
            <div className="note">
              <p>确认要删除画夹吗？画夹删除后不可恢复哦~</p>
              <p>删除后收录的创作会无法查看</p>
            </div>
            <div className="buttons">
              <CapsuleButton
                onClick={() => {
                  setShowWarning(false)
                }}
                className={'cancel'}>取消</CapsuleButton>
              <CapsuleButton
                onClick={() => {
                  deleteClip({
                    id: props.clipInfo.id
                  }, () => {
                    setSuccess('删除成功！')
                    setTimeout(() => {
                      props.close();
                    }, 2000)
                    window.location.reload();
                  })
                }}
                className={'del'}>删除</CapsuleButton>
            </div>
          </div>
        </PopPanel>
      }
    </>
  )
};

export default EditClip;