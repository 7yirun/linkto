import {useEffect, useState} from 'react';
import style from "./index.module.scss"
import {queryBookmarkList, queryImg, setPicture} from "service/service"
import Icons from "lib/icons"
import EditClip from "../../../../components/EditClip/EditClip";
import ClipPictures from "../ClipPictures/ClipPictures";
import qs from 'qs'

const SubCreate = (props: any) => {
  let index = props.location.pathname.indexOf('id');
  const accountId = qs.parse(props.location.pathname.slice(index)).id
  const showPrivate = props.location.pathname.includes('showPrivate');

  const [list, setList] = useState([])
  //搜索画夹
  const [keyword, setKeyword] = useState("");
  const [showClip, setShowClip] = useState(false)
  const [clipName, setClipName] = useState('')
  const [clipId, setClipId] = useState(-1);
  //是否查看画夹详情
  const [enterClip, setEnterClip] = useState(false);
  const closePanel = () => {
    setShowClip(false)
  }
  const clipDetail = (id: number) => {
    setClipId(id);
  }

  useEffect(() => {
    let willUnmount = false;
    let request = accountId ? {
      type: 0,
      accountId: accountId
    } : {
      type: 0
    }

    //@ts-ignore
    queryBookmarkList(request, (res: any) => {
      if (!willUnmount) {
        setList(res.data)
      }
    })
    return () => {
      willUnmount = true
    };
  }, [])


  return (
    <div className={style['content-wrapper']}>
      {
        !enterClip?
          <>
            <p className={'search'}>
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                }}
                placeholder={'搜索画夹'} type="text"/>
              <i className={'search-icon'}>
                <img src={Icons.search} alt=""/>
              </i>
            </p>
            <div className="content">
              {
                list.filter((val: any) => {
                  return val.name.includes(keyword)
                }).map((val: any, index) => {
                  return (
                    <div key={val.id} className="img-wrapper">
                      <div onClick={() => {
                        setEnterClip(true)
                        clipDetail(val.id)
                      }} className="img">
                        <div
                          onClick={(e) => {
                            setClipId(val.id);
                            setShowClip(true);
                            setClipName(val.name);
                            e.stopPropagation();
                          }}
                          className="edit"
                        >
                          <img className="edit-icon" src={Icons.edit_book_mark} alt=""/>
                        </div>
                        {/*画夹封面图片：*/}
                        <img src={val.coverPic || Icons.logo} alt=""/>
                      </div>
                      <h6>{val.name}</h6>
                      <p>
                        <span>{`创作·${val.picNum}`}</span>
                        {/*<span>粉丝·6</span>*/}
                      </p>
                    </div>
                  )
                })
              }
            </div>
            {
              showClip &&
							<EditClip close={closePanel} name={clipName} id={clipId}></EditClip>
            }
          </>
          :
          <ClipPictures showPrivate={showPrivate} id={clipId}></ClipPictures>
      }
    </div>
  );
};

export default SubCreate;