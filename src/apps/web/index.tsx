import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import {HashRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import store from 'apps/web/store/store'
import "../../assets/iconfont/iconfont.css"

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App/>
    </HashRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
)
;
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
