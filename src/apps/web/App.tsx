import React, {useEffect} from 'react';
import {Route, Switch, Redirect, useHistory} from 'react-router-dom'
import Home from 'apps/web/pages/Home/Home'
import Create from 'apps/web/pages/Create/Create'
import Pictures from 'apps/web/pages/Pictures/Pictures'
import Bookmark from 'apps/web/pages/Bookmark/Bookmark'
import Tutorial from 'apps/web/pages/Tutorial/Tutorial'
import MySpace from "apps/web/pages/MySpace/MySpace";
import SeeArtist from "apps/web/pages/SeeArtist/SeeArtist";
import Header from "apps/web/components/Header/Header"
import Login from "apps/web/components/Login/Login";
import Register from "apps/web/components/Register/Register";
import {useSelector, useDispatch} from 'react-redux'
import {setShowRegister, setShowLogin, setIsLogin} from 'apps/web/store/store'
import './App.scss'
import EditUser from "./components/EditUser/EditUser";
import {getStore} from "utils/utils"

function App(props:any) {
  const state = useSelector((state: any) => state.loginState);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (getStore('token', true)) {
      dispatch(setIsLogin(true));
    }
    (window as any).logout = () => {
      history.push('/');
      dispatch(setIsLogin(false));
      dispatch(setShowLogin(true));
      localStorage.clear();
    }
  }, []);
  return (
    <div className="App">
      <Header></Header>
      <Switch>
        <Route path={'/see-artist'} component={SeeArtist}/>
        <Route path={'/create'} component={Create}/>
        <Route path={'/pictures'} component={Pictures}/>
        <Route path={'/bookmark'} component={Bookmark}/>
        <Route path={'/tutorial'} component={Tutorial}/>
        <Route path={'/my-space'} component={MySpace}/>
        <Route exact path={'/'} component={Home}/>
      </Switch>
      {/*<Redirect to={'/home'}/>*/}
      {
        !state.isLogin && state.showLogin && <Login></Login>
      }
      {
        state.showRegister && <Register></Register>
      }
      {
        state.showEditUser && <EditUser></EditUser>
      }
    </div>
  );
}

export default App;
