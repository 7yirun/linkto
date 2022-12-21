import {useEffect, useState} from 'react';
import "./SeeBig.scss"
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import AddToBookmark from "../AddToBookmark/AddToBookmark";
import {getImgDetail, focus, unFocus, setLike} from "service/service"
import {message} from 'antd'
import {downloadURI} from "utils/utils"

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
}

const SeeBig = (props: { id: number, close: () => void }) => {
  const [showAddTo, setShowAddTo] = useState(false);
  const [imgDetailInfo, setImgDetailInfo] = useState<imgDetailType>()
  useEffect(() => {
    //显示弹窗时禁止滚动滚动条
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = 'auto';
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
									<img src={imgDetailInfo.accountInfo.headPic} className={'profile'} alt=""/>
									<div className="text-info">
										<p>
                      <span className={'accountName'}>{imgDetailInfo.accountInfo.accountName}</span>
                      {
                        imgDetailInfo.accountInfo.hasFocused &&
                        <span
                          className={'focused'}
                          onClick={()=>{
                            unFocus({
                              focusedAccountId: imgDetailInfo.accountId
                            }, ()=>{
                              setImgDetailInfo({
                                ...imgDetailInfo,
                                accountInfo: {
                                  ...imgDetailInfo.accountInfo,
                                  hasFocused: false
                                }
                              })
                              //刷新信息
                              updateImgDetailInfo()
                            }, (err:any)=>{
                              message.warning(err.msg);
                            })
                          }}
                        >已关注</span>
                      }
                    </p>
										<ul>
											<li>关注·{imgDetailInfo.accountInfo.focusNum}</li>
											<li>粉丝·{imgDetailInfo.accountInfo.fansNum}</li>
											<li>创作·{11111}</li>
											<li>画夹·{imgDetailInfo.accountInfo.picClipNum}</li>
										</ul>
									</div>
								</div>
                {
                  !imgDetailInfo.accountInfo.hasFocused &&
                  <div
                    className="follow"
                    onClick={()=>{
                      focus({
                        focusedAccountId: imgDetailInfo.accountId
                      }, ()=>{
                        //请求关注
                        setImgDetailInfo({
                          ...imgDetailInfo,
                          accountInfo: {
                            ...imgDetailInfo.accountInfo,
                            hasFocused: true
                          }
                        })
                        //刷新信息
                        updateImgDetailInfo()
                      }, (err:any)=>{
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
											<span
                        className="iconfont icon-9"
                        onClick={()=>{
                          //点赞
                          setLike({picId: imgDetailInfo.id}, ()=>{
                            updateImgDetailInfo()
                          })
                        }}
                      />
											<span
                        className="iconfont icon-13"
                        onClick={()=>{
                          //二次创作
                        }}
                      />
											<span
                        className="iconfont icon-16"
                        onClick={()=>{
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