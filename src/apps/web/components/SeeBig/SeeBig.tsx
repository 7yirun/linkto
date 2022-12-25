import {useEffect, useState} from 'react';
import "./SeeBig.scss"
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import AddToBookmark from "../AddToBookmark/AddToBookmark";
import {getImgDetail, focus, unFocus, setLike, cancelLike} from "service/service"
import {message} from 'antd'
import {downloadURI} from "utils/utils"
import {setLoadedImages} from "../../store/store";
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {pictureStateType} from "../../pages/Create/Create";

type imgDetailType = {
  id: number //要查看的大图的图片id
  width: number
  high: number
  url: string
  starCount: number  //点赞数
  collectCount: number //收藏数
  accountId: number //作者id
  description: string
  isCollect: number  //0未收藏 1已收藏
  relationList: recommendType[]
  accountInfo: accountInfoType
  isStar: number   //0未点赞 1已点赞
}
type recommendType = {
  id: number
  smallUrl: string
}
type accountInfoType = {
  accountName: string,
  headPic: string,
  focusNum: number  //关注数
  fansNum: number
  picClipNum: number
  hasFocused: boolean //是否关注
  picNum: number //创作数
}

const SeeBig = (props: { id: number, close: () => void }) => {
  const [showAddTo, setShowAddTo] = useState(false);
  const [imgDetailInfo, setImgDetailInfo] = useState<imgDetailType>()
  const history = useHistory()
  const dispatch = useDispatch();
  const pictureState = useSelector<any, pictureStateType>(state => state.pictureState);
  useEffect(() => {
    //显示弹窗时禁止滚动滚动条
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = 'visible';
    }
  }, [])
  useEffect(() => {
    //获取相关推荐图片
    getImgDetail({
      id: props.id,
    }, ({data}: { data: imgDetailType }) => {
      setImgDetailInfo(data);
    })
  }, [props.id])

  //收藏图片后 需要重新请求img信息 更新收藏状态
  const updateImgDetailInfo = () => {
    getImgDetail({
      id: imgDetailInfo!.id
    }, ({data}: { data: imgDetailType }) => {
      setImgDetailInfo(data);
    })
  }

  const cancelAdd = () => {
    setShowAddTo(false)
  }
  const handleClose = () => {
    props.close();
  }
  return (
    <div className={'see-big'}>
      <div className="content">
        {
          imgDetailInfo &&
					<>
						<div
							className={imgDetailInfo.width === imgDetailInfo.high
                ?
                'content-in size1'
                :
                (imgDetailInfo.width < imgDetailInfo.high
                  ?
                  'content-in size2' : 'content-in size3')
              }
						>
							<div className="title">
								<div className="user-info">
									<img
                    onClick={()=>{
                      history.push('/my-space?id=' + imgDetailInfo.accountId)
                    }}
                    src={imgDetailInfo.accountInfo.headPic} className={'profile'} alt=""/>
									<div className="text-info">
										<p>
											<span className={'accountName'}>{imgDetailInfo.accountInfo.accountName}</span>
                      {
                        imgDetailInfo.accountInfo.hasFocused &&
												<span
													className={'focused'}
													onClick={() => {
                            unFocus({
                              focusedAccountId: imgDetailInfo.accountId
                            }, () => {
                              //刷新信息
                              updateImgDetailInfo()
                            }, (err: any) => {
                              message.warning(err.msg);
                            })
                          }}
												>已关注</span>
                      }
										</p>
										<ul>
											<li>关注·{imgDetailInfo.accountInfo.focusNum}</li>
											<li>粉丝·{imgDetailInfo.accountInfo.fansNum}</li>
											<li>创作·{imgDetailInfo.accountInfo.picNum}</li>
											<li>画夹·{imgDetailInfo.accountInfo.picClipNum}</li>
										</ul>
									</div>
								</div>
                {
                  !imgDetailInfo.accountInfo.hasFocused &&
									<div
										className="follow"
										onClick={() => {
                      focus({
                        focusedAccountId: imgDetailInfo.accountId
                      }, () => {
                        //刷新信息
                        updateImgDetailInfo()
                      }, (err: any) => {
                        message.warning(err.msg);
                      })
                    }}
									>
										关注
									</div>
                }
								<div onClick={handleClose} className="close">
									<span className={'iconfont icon-close'}></span>
								</div>
							</div>
							<div className="img-wrapper">
								<div className="img">
									<img src={imgDetailInfo?.url} alt=""/>
								</div>
								<div className="text-pannel">
									<div className="head">
										<p className={'icons'}>
                      {
                        imgDetailInfo.isStar === 0 ? <span
                            className="iconfont icon-9"
                            onClick={() => {
                              //点赞
                              setLike({picId: imgDetailInfo.id}, () => {
                                updateImgDetailInfo()
                              })
                            }}
                          />
                          :
                          <span
                            className="iconfont icon-9 stared"
                            onClick={() => {
                              //取消点赞
                              cancelLike({picId: imgDetailInfo.id}, () => {
                                updateImgDetailInfo()
                              })
                            }}
                          />
                      }
											<span
												className="iconfont icon-13"
												onClick={() => {
                          //二次创作
                          history.push('/create')
                          dispatch(setLoadedImages([
                            ...pictureState.loadedImages,
                            {
                              name: "LinkTo_IMG_" + imgDetailInfo.id,
                              src: imgDetailInfo.url,
                              id: imgDetailInfo.id
                            }
                          ]))
                        }}
											/>
											<span
												className="iconfont icon-16"
												onClick={() => {
                          //下载
                          imgDetailInfo.url && downloadURI(imgDetailInfo.url, 'picture')
                        }}
											/>
										</p>
                    {
                      <CapsuleButton
                        onClick={() => {
                          setShowAddTo(true);
                        }}
                      >
                        {
                          imgDetailInfo.isCollect === 0 ?
                            `收藏${imgDetailInfo.collectCount}` :
                            `已收藏`
                        }
                      </CapsuleButton>
                    }
									</div>
									<p className="body">
                    {
                      imgDetailInfo.description
                    }
									</p>
								</div>
							</div>
						</div>
						<div className="recommend">
							<ul>
                {
                  [...Array(7)].map((v, index) => {
                    return (
                      imgDetailInfo &&
											<li
												key={index}
												className="recommend-img"
												onClick={() => {
                          getImgDetail({
                            id: imgDetailInfo.relationList[index].id
                          }, ({data}: { data: imgDetailType }) => {
                            setImgDetailInfo(data);
                          })
                        }}
											>
                        {
                          imgDetailInfo.relationList[index] &&
													<img src={imgDetailInfo.relationList[index].smallUrl} alt=""/>
                        }
											</li>
                    )
                  })
                }
							</ul>
						</div>
					</>
        }
      </div>
      {
        showAddTo && imgDetailInfo &&
				<AddToBookmark
					type={1}
					onCancle={cancelAdd}
					picId={imgDetailInfo.id}
					myPictureDto={{url: imgDetailInfo.url}}
					updateCallBack={updateImgDetailInfo}
				/>
      }
    </div>
  );
};

export default SeeBig;