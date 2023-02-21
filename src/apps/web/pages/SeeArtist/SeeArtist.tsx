import React from 'react';
import Bookmark from "apps/web/pages/Bookmark/Bookmark";
import qs from "qs";
import "./SeeArtist.scss"

const SeeArtist = (props:any) => {
  //是否已关注此用户
  // const [focused, setFocused] = useState(false)
  let index = props.location.pathname.indexOf('id');
  const accountId = qs.parse(props.location.pathname.slice(index)).id || ''
  return (
    <div className={'see-artist'}>
      <Bookmark accountId={accountId} others={true}></Bookmark>
    </div>
  );
};

export default SeeArtist;