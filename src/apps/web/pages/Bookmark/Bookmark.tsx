import './Bookmark.scss';
import React, {useEffect, useState} from "react";
import {Route, Switch, Redirect} from 'react-router-dom'
import SubMyFollow from "./Subpage/SubMyfollow/SubMyfollow";
import SubMyHistory from "./Subpage/SubMyhistory/SubMyhistory";
import SubPersonalInfo from "./Subpage/SubPersonalinfo/SubPersonalinfo";
import SubAccountManage from "./Subpage/SubAccountManage/SubAccountManage";
import {NavLink} from "react-router-dom"
import Header from "../../components/Header/Header";

const Bookmark = (props: any) => {
  const nav = [
    {name: '个人信息', path: '/sub-personalinfo', component: SubPersonalInfo},
    {name: '账号管理', path: '/sub-accountmanage', component: SubAccountManage},
    {name: '我的关注', path: '/sub-myfollow', component: SubMyFollow},
    {name: '我的点赞', path: '/sub-myhistory', component: SubMyHistory}
  ];

  const [activePage, setActivePage] = useState(0);
  const {others, accountId} = props;
  if (others) {
    nav.map(item => {
      item.name = item.name.replace('我的', '他的')
    })
  }
  // const [showArtist, setShowArtist] = useState(true);
  return (
    <>
      <Header></Header>
      <div className={'bookmark'}>
        <div className="left">
          <ul className={'left-nav'}>
            <li>
              <NavLink
                className={'sub-nav'}
                exact
                to={ "/bookmark/sub-personalinfo"}
              >
                {'个人信息'}
              </NavLink>
            </li>
            <li>
              <NavLink
                className={'sub-nav'}
                exact
                to={ "/bookmark/sub-accountmanage"}
              >
                {'账号管理'}
              </NavLink>
            </li>
            {/* <li>
            <NavLink
              className={'sub-nav'}
              exact
              to={others ? "/see-artist/sub-mycreate/id=" + accountId : "/bookmark/sub-mycreate/showPrivate"}
            >
              {!others?'我的创作':'他的创作'}
            </NavLink>
          </li>
          <li>
            <NavLink
              className={'sub-nav'}
              exact
              to={others ? "/see-artist/sub-bookmark/id="+accountId : "/bookmark/sub-bookmark/showBookmark"}
            >
              {!others?'我的收藏':'他的收藏'}
            </NavLink>
          </li>
          <li>
            <NavLink
              className={'sub-nav'}
              exact
              to={others ? "/see-artist/sub-myfollow/id=" + accountId: "/bookmark/sub-myfollow/id=" + accountId}
            >
              {!others?'我的关注':'他的关注'}
            </NavLink>
          </li> */}
            {/* {
            nav.map((item, index) => {
              return (
                <li key={item.name}
                    className={nav[activePage] === item ? 'active' : ''}
                >
                  <NavLink className={'sub-nav'}
                           exact
                           to={
                             others
                               ?
                               "/see-artist" + item.path + '/id=' + accountId
                               :
                               "/bookmark" + item.path + "/showPrivate"
                           }
                  >
                    {item.name}
                  </NavLink>
                </li>
              )
            })
          } */}
          </ul>
        </div>
        <div className="right">
          {
            <Switch>
              {
                nav.map(item => {
                  return (
                    <Route key={item.name} path={(others ? '/see-artist' : '/bookmark') + item.path}
                           component={item.component}
                    />
                  )
                })
              }
              <Redirect to={(others ? '/see-artist/sub-mycreate' : '/bookmark/sub-mycreate/showPrivate')}/>
            </Switch>
          }
        </div>
      </div>
    </>
  )
}
export default Bookmark