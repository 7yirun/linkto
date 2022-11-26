import "./Header.scss"
import {useHistory, NavLink} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {setShowLogin, setIsLogin} from 'store/store'
import Icons from 'lib/icons'
import {useEffect, useState, useRef} from "react";
import CapsuleButton from "../CapsuleButton/CapsuleButton";
import {logout} from "service/service";
import {getStore} from "utils/utils"

const items = [
  {name: '首页', path: '/'},
  {name: '创作', path: '/create'},
  {name: '图库', path: '/pictures'},
  // {name: '我的画夹', path: '/bookmark/sub-mycreate'},
  {name: '我的画夹', path: '/bookmark'},
  {name: '教程', path: '/tutorial'}
];

const Header = () => {
  const loginState = useSelector((state: any) => state.loginState);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLoginRelevant, setShowLoginRelevant] = useState(false)
  const dispatch = useDispatch();
  const history = useHistory();
  const userRef = useRef(null);
  const getLocalAccountInfo = ()=>{
    return JSON.parse(getStore('accountInfo', true) || '{}');
  }

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
  useEffect(() => {
    let activeI = items.findIndex((item, index) => {
      return history.location.pathname.includes(item.path)
    });
    setActiveIndex(activeI);
  }, [activeIndex])
  return (
    <div className='header'>
      <div className="header-in">
        <div className="logo">
          <img src={Icons.logo} alt=""/>
          <span>LinkTo</span>
        </div>
        <ul className='nav'>
          {
            items.map((item, index) => {
              return (
                <li key={item.name} className={'nav-item'}>
                  <NavLink exact={index === 0} className={'nav-btn'} key={item.name} to={item.path}>
                    {
                      item.name
                    }
                  </NavLink>
                </li>
              )
            })
          }
        </ul>
        {
          !loginState.isLogin ?
            <CapsuleButton
              onClick={(e: any) => {
                e.preventDefault();
                dispatch(setShowLogin(true))
              }}
              className={'login'}
            >
              登录
            </CapsuleButton> :
            <div className={'logined'}>
              <img
                ref={userRef}
                onClick={() => {
                  setShowLoginRelevant(true);
                }
                }
                className={'user-profile'} src={loginState.accountInfo.headPic || getLocalAccountInfo().headPic || Icons.default_profile} alt=""/>
              <div className={'nickname'}>{loginState.accountInfo.accountName || getLocalAccountInfo().accountName}</div>
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