import {createSlice, configureStore} from '@reduxjs/toolkit'

const loginSlice = createSlice({
  name: 'loginSlice', //自动生成action中的type
  //state初始值
  initialState: {
    showLogin: false,   //是否显示登录框
    showRegister: false,
    isLogin: false,  //用户是否登录
    showEditUser: false, //修改用户资料
    accountInfo: {}, //已登录用户的信息
    editUser: ''   //type:nickname, password, phoneNum
  },
  reducers: {  //state的操作
    setShowLogin(state, action) {
      state.showLogin = action.payload
    },
    setShowRegister(state, action) {
      state.showRegister = action.payload
    },
    setIsLogin(state, action){
      state.isLogin = action.payload
    },
    setShowEditUser(state, action){
      state.showEditUser = action.payload
    },
    setAccountInfo(state, action){
      state.accountInfo = action.payload
    },
    setEditUser(state, action){
      state.editUser = action.payload
    },
  }
})
//搜索框相关
const searchSlice = createSlice({
  name: 'searchSlice',
  initialState: {
    description: '',
    mapArr: [['']],
    lanMap: {}    //英文转中文
  },
  reducers: {
    //创作时或者搜索图库时自己输入的描述词
    setDescription(state, action){
      state.description = action.payload
    },
    //创作时选中的keyword
    setMapArr(state, action){
      state.mapArr = action.payload
    },
    setLanMap(state, action){
      state.lanMap = action.payload
    }
  }
})
export const {setShowLogin, setShowRegister, setIsLogin, setShowEditUser, setAccountInfo,setEditUser} = loginSlice.actions
export const {setDescription, setMapArr, setLanMap} = searchSlice.actions

const store = configureStore({
  reducer: {
    loginState: loginSlice.reducer,
    searchState: searchSlice.reducer
  }
})
export default store