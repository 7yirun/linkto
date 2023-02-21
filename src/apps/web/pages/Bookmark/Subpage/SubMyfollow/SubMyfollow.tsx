import {useState, useEffect} from 'react';
import style from "./index.module.scss";
import Icons from "lib/icons";
import {getFocusList} from "service/service";
import ArtistCard from "../../../../components/ArtistCard/ArtistCard";
import qs from "qs";
const SubMyFollow = (props: any) => {
  let index = props.location.pathname.indexOf('id');
  const accountId = qs.parse(props.location.pathname.slice(index)).id
  const [artistList, setArtistList] = useState([]);
  //搜索艺术家
  const [keyword, setKeyword] = useState("");
  useEffect(()=>{
    let request = {
      focusType: 1,        //1我的关注  2我的粉丝
      pageNum: 1,
      pageSize: 30,
    }
    if(accountId){
      //@ts-ignore
      request.accountId = +accountId;
    }
    getFocusList(request, (res:any)=>{
      setArtistList(res.data.list)
    })
  }, [])
  return (
    <div className={style['content-wrapper']}>
      <p className={'search'}>
        <input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
          }}
          placeholder={'搜索艺术家'}
          type="text"/>
        <i className={'search-icon'}>
          <img src={Icons.search} alt=""/>
        </i>
      </p>
      <div className="artist-list-wrapper">
        <ul className={'artist-list'}>
          {
            artistList.filter((val: any) => {
              return val.accountName.includes(keyword)
            }).map((item:any)=>{
              return (
                <li className={'list-item'} key={item.id}>
                  <ArtistCard
                    accountInfo={item}
                    canEditName={false}
                  ></ArtistCard>
                </li>
              )
            })
          }
        </ul>
      </div>
    </div>
  );
};

export default SubMyFollow;