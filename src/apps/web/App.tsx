import React, {useEffect} from 'react';
import {Route, Switch, Redirect, useHistory} from 'react-router-dom'
import Header from "apps/web/components/Header/Header"
import Login from "apps/web/components/Login/Login";
import Register from "apps/web/components/Register/Register";
import {useSelector, useDispatch} from 'react-redux'
import {setShowRegister, setShowLogin, setIsLogin} from 'apps/web/store/store'
import './App.scss'
import EditUser from "./components/EditUser/EditUser";
import {getStore} from "utils/utils"

const Home = React.lazy(() => import("apps/web/pages/Home/Home"));
const Create = React.lazy(() => import("apps/web/pages/Create/Create"));
const Pictures = React.lazy(() => import("apps/web/pages/Pictures/Pictures2"));
const Bookmark = React.lazy(() => import("apps/web/pages/Bookmark/Bookmark"));
const Tutorial = React.lazy(() => import("apps/web/pages/Tutorial/Tutorial"));
const MySpace = React.lazy(() => import("apps/web/pages/MySpace/MySpace"));
const SeeArtist = React.lazy(() => import("apps/web/pages/SeeArtist/SeeArtist"));

function App(props: any) {
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
      {/*<Header></Header>*/}
      <React.Suspense fallback={<></>}>
        <Switch>
          <Route path={'/see-artist'} component={SeeArtist}/>
          <Route path={'/create'} component={Create}/>
          <Route path={'/pictures'} component={Pictures}/>
          <Route path={'/bookmark'} component={Bookmark}/>
          <Route path={'/tutorial'} component={Tutorial}/>
          <Route path={'/my-space'} component={MySpace}/>
          <Route exact path={'/'} component={Home}/>
        </Switch>
      </React.Suspense>
      <Login></Login>
      <Register></Register>
      {
        state.showEditUser && <EditUser></EditUser>
      }
    </div>
  );
}

export default App;
