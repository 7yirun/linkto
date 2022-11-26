import React, {useEffect} from 'react';
import {Route, Switch, Redirect, useHistory} from 'react-router-dom'
import Home from 'pages/Home/Home'
import Create from 'pages/Create/Create'
import Pictures from 'pages/Pictures/Pictures'
import Bookmark from 'pages/Bookmark/Bookmark'
import Tutorial from 'pages/Tutorial/Tutorial'
import MySpace from "pages/MySpace/MySpace";
import SeeArtist from "pages/SeeArtist/SeeArtist";
import Header from "components/Header/Header"
import Login from "components/Login/Login";
import Register from "components/Register/Register";
import {useSelector, useDispatch} from 'react-redux'
import routerMap from "routers"
import {setShowRegister, setShowLogin, setIsLogin} from 'store/store'
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
