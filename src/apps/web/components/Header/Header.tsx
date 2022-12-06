import "./Header.scss"
import {useHistory, NavLink} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {setShowLogin, setIsLogin, setShowRegister} from 'apps/web/store/store'
import Icons from 'lib/icons'
import React, {useEffect, useState, useRef} from "react";
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import {logout} from "service/service";
import {getStore} from "utils/utils"
import Search from "../Search/Search"
const items = [
  {name: '创作', path: '/create'},
  {name: '图库', path: '/pictures'},
];

const Header = (props: any) => {
  const loginState = useSelector((state: any) => state.loginState);
  const [showLoginRelevant, setShowLoginRelevant] = useState(false)
  const dispatch = useDispatch();
  const history = useHistory();
  const userRef = useRef(null);
  const getLocalAccountInfo = () => {
    return JSON.parse(getStore('accountInfo', true) || '{}');
  }

  //判断当前路由是否是首页
  const [isHome, setIsHome] = useState<boolean>(true);
  useEffect(() => {
    setIsHome(history.location.pathname === '/')
    const removeListen = history.listen((location: { pathname: string }) => {
      setIsHome(location.pathname === '/')
    })
    return () => {
      removeListen()
    }
  }, [history])
  const handleLogout = () => {
    logout(() => {
      dispatch(setIsLogin(false));
      localStorage.removeItem("token");
    });
    history.replace("/")
  }

  useEffect(() => {
    const handler = (e: any) => {
      if (e.target !== userRef.current)
        setShowLoginRelevant(false);
    }
    document.body.addEventListener('mouseup', handler);
    return () => {
      document.body.removeEventListener('mouseup', handler);
    }
  }, [])
  return (
    <div className='header'>
      <div className="header-in">
        <nav>
          <NavLink className={'nav-btn'} to={'/'}>
            <div className="logo">
              <img src={Icons.logo} alt=""/>
            </div>
          </NavLink>
          {
            !isHome &&
						<ul className='nav'>
              {
                items.map((item, index) => {
                  return (
                    <li key={item.name} className={'nav-item'}>
                      <NavLink className={'nav-btn'} key={item.name} to={item.path}>
                        {
                          item.name
                        }
                      </NavLink>
                    </li>
                  )
                })
              }
						</ul>
          }
        </nav>
        {
          history.location.pathname !== '/' &&
          <Search></Search>
        }
        {
          !loginState.isLogin ?
            <div className={'login-register'}>
              <span>
                关于灵图
              </span>
              <CapsuleButton
                onClick={(e: any) => {
                  e.preventDefault();
                  dispatch(setShowRegister(true))
                }}
                className={'register'}
              >
                注册
              </CapsuleButton>
              <CapsuleButton
                onClick={(e: any) => {
                  e.preventDefault();
                  dispatch(setShowLogin(true))
                }}
                className={'login'}
              >
                登录
              </CapsuleButton>
            </div>
            :
            <div className={'logined'}>
              <img
                ref={userRef}
                onClick={() => {
                  setShowLoginRelevant(true);
                }
                }
                className={'user-profile'}
                src={loginState.accountInfo.headPic || getLocalAccountInfo().headPic || Icons.default_profile} alt=""/>
              <div
                className={'nickname'}>{loginState.accountInfo.accountName || getLocalAccountInfo().accountName}</div>
              <ul className={`user-relevant ${showLoginRelevant ? 'show' : ''}`}>
                <li onClick={() => {
                  history.push('/my-space')
                }}>个人中心
                </li>
                <li onClick={() => {
                  history.push('/bookmark')
                }}>我的画夹
                </li>
                <li>用户指引</li>
                <li onClick={handleLogout}>退出登录</li>
              </ul>
            </div>
        }
      </div>
    </div>
  )
}
export default Header