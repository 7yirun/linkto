import React, {useState, useEffect} from 'react';
import Bookmark from "apps/web/pages/Bookmark/Bookmark";
import ArtistCard from "apps/web/components/ArtistCard/ArtistCard";
import {getPersonalInfo, focus, unFocus} from 'service/service'
import qs from "qs";
import "./SeeArtist.scss"
import CapsuleButton from "apps/web/components/CapsuleButton/CapsuleButton";

const SeeArtist = (props:any) => {
  const [accountInfo, setAccountInfo] = useState(null);
  //是否已关注此用户
  const [focused, setFocused] = useState(false)
  let index = props.location.pathname.indexOf('id');
  const accountId = qs.parse(props.location.pathname.slice(index)).id || ''
  const handleFocus = ()=>{
    //如果已关注 则取关   反之 关注
    if(focused){
      unFocus({
        focusedAccountId: +accountId
      }, ()=>{
        setFocused(false)
      })
    } else {
      focus({
        focusedAccountId: +accountId
      }, ()=>{
        setFocused(true)
      })
    }
  }
  useEffect(()=>{
    getPersonalInfo({
      //@ts-ignore
      id: accountId
    }, ({data}:{data:any})=>{
      setFocused(data.hasFocused);
      setAccountInfo(data);
    })
  }, [])
  return (
    <div className={'see-artist'}>
      {/* <div className="see-artist-header">
        {
          accountInfo &&
          <>
	          <ArtistCard
		          accountName={(accountInfo as any).accountName}
		          headPic={(accountInfo as any).headPic}
		          fansNum={(accountInfo as any).fansNum}
		          focusNum={(accountInfo as any).focusNum}
		          picClipNum={(accountInfo as any).picClipNum}
	          >
	          </ArtistCard>
	          <CapsuleButton
              onClick={handleFocus}
              className={focused ? 'gray': ''}
            >
              {focused ? "已关注":"关注"}
            </CapsuleButton>
          </>
        }
      </div> */}
      <Bookmark accountId={accountId} others={true}></Bookmark>
    </div>
  );
};

export default SeeArtist;