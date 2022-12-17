import styles from "./MySpace.module.scss"
import React, {useEffect, useState} from 'react';
import Personal from "apps/web/components/Personal/Personal"
import {getStore} from "utils/utils";
import EditUser from "apps/web/components/EditUser/EditUser"
import {useSelector, useDispatch} from 'react-redux'
import {queryBookmarkList} from "service/service"
import Waterfall from "apps/web/components/WaterFall/Waterfall2";
import {useWindowResize} from "../../hooks";

const MySpace = () => {
  const accountInfo = JSON.parse(getStore("accountInfo", true) || '{}');
  const accountId = accountInfo.id;
  const [edit, setEdit] = useState();
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.loginState);

  enum COLLECT_TYPE {
    CREATE=0,  //创作画夹
    BOOKMARK=1 //收藏画夹
  }

  const [collect, setCollect] = useState(COLLECT_TYPE.CREATE);
  useEffect(()=>{
    queryBookmarkList({
      type: COLLECT_TYPE.CREATE,
    }, (res:any)=>{
      console.log(res.data);
    })
  }, [])



  /*瀑布流相关=====================================start*/
  /*const clientWidth = useWindowResize();
  const currentCols = Math.floor((clientWidth - 72) / 264);
  const currentWidth = Math.floor((clientWidth - 24 * currentCols - 72) / currentCols);
  const [imgList, setImgList] = useState<any[]>([]);
  const layout = {
    cols: currentCols,
    colWidth: currentWidth
  }*/
  /*瀑布流相关=====================================end*/


  return (
    <>
      <Personal id={accountId}></Personal>
      <div className={styles.tabs}>
        <div className="sub-tab"
             onClick={() => {
               setCollect(COLLECT_TYPE.CREATE)
             }}>
          创作
        </div>
        <div className="sub-tab"
             onClick={() => {
               setCollect(COLLECT_TYPE.BOOKMARK)
             }}>
          收藏
        </div>
      </div>
      {/*画夹列表*/}
      <div className={styles['collect-list']}>
        <ul>
          {/*{
            .map(()=>(
            <li>
            <div className={'img-wrapper'}>
            </div>
            <p>
            <span className={'collect-name'}>图片名称</span>
            <span className={'pictures-count'}>图片数量</span>
            </p>
            </li>
            ))
          }*/}
        </ul>
      </div>
    </>
  );
};

export default MySpace;