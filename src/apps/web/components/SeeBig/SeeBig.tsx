import {useEffect, useState} from 'react';
import "./SeeBig.scss"
import Icons from "lib/icons";
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import {addNewBookmark} from "service/service";
import AddToBookmark from "../AddToBookmark/AddToBookmark";
import {queryImg, getImgDetail} from "service/service"

const SeeBig = (props:any) => {
  const [showAddTo, setShowAddTo] = useState(false);

  const [recommendList, setRecommendList] = useState([])
  useEffect(()=>{
    //显示弹窗时禁止滚动滚动条
    document.documentElement.style.overflow = 'hidden';
    return ()=>{
      document.documentElement.style.overflow = 'auto';
    }
  }, [])
  useEffect(()=>{
    //获取相关推荐图片
    queryImg({
      pageNum: 1,
      pageSize: 7,
      withOutPicId: props.info.id
    }, (res:any)=>{
      setRecommendList(res.data.list)
    })
  }, [props.info])

  const handleAdd = ()=>{
    setShowAddTo(true)
  }
  const cancelAdd=()=>{
    setShowAddTo(false)
  }
  const handleClose = ()=>{
    props.close();
  }
  //图片有3:2, 1:1, 2:3三种比例 布局根据比例不同做切换
  //size1,2,3分别代表1:1, 2:3, 3:2
  enum SIZE{
    size1,
    size2,
    size3
  }
  const [style, setStyle] = useState(SIZE.size1);

  return (
    <div className={'see-big'}>
      <div className="content">
        <div
          className={props.info.width === props.info.high
            ?
            'content-in size1'
            :
            (props.info.width < props.info.high
            ?
            'content-in size2' : 'content-in size3')
          }
        >
          <div className="title">
            <div className="user-info">
              <img src={props.info.headPic} className={'profile'} alt=""/>
              <div className="text-info">
                <p>{props.info.accountName}</p>
                <ul>
                  <li>关注·1111</li>
                  <li>粉丝·1111</li>
                  <li>创作·1111</li>
                  <li>画夹·1111</li>
                </ul>
              </div>
            </div>
            <div onClick={handleClose} className="close">
              <span className={'iconfont icon-close'}></span>
            </div>
          </div>
          <div className="img-wrapper">
            <div className="img">
              <img src={props.info.url} alt=""/>
            </div>
            <div className="text-pannel">
              <div className="head">
                <p className={'icons'}>
                  <span className="iconfont icon-9"></span>
                  <span className="iconfont icon-13"></span>
                  <span className="iconfont icon-16"></span>
                </p>
                {
                  <CapsuleButton
                    onClick={()=>{
                      setShowAddTo(true);
                    }}
                  >收藏{props.info.collectCount}</CapsuleButton>
                }
                {/*{
                  <CapsuleButton>已收藏</CapsuleButton>
                }*/}
              </div>
              <p className="body">
                {
                  props.info.description
                }
              </p>
            </div>
          </div>
        </div>
        <div className="recommend">
          {
            recommendList.map((img:any)=>{
              return (
                <div
                  key={img.id}
                  className="recommend-img"
                  onClick={()=>{
                    getImgDetail(props.info.id)
                  }}
                >
                  <img src={img.smallUrl} alt=""/>
                </div>
              )
            })
          }
        </div>
      </div>
      {/*{
        showAddTo && <AddToBookmark type={0} onCancle={cancelAdd} url={props.info.url}></AddToBookmark>
      }*/}
    </div>
  );
};

export default SeeBig;