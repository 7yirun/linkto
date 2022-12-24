import command from "./command"
import axios, {AxiosResponse} from "axios";
// import {getStore} from "utils/utils"

const uuid = require("uuid");
const url = process.env.REACT_APP_API_URL;



axios.interceptors.response.use((res) => {
  if (res.data.code > 0) {
    if(res.data.code == 401){
      (window as any).logout()
    }
    return Promise.reject(res.data)
  }
  return res;
}, (err)=>{
  console.log(err);
  return Promise.reject(err)
})

//get请求防止使用缓存值 要加随机数
export const sendGet = (command: string, request: any, success?: any, error?: any, headers?:any) => {
  request.serialNo = uuid.v1();
  let token = localStorage.getItem('token');
  axios.get(url + command, {params: request, headers: {token, ...headers}}).then((res) => {
    const response = res.data
    success && success(response)
  }).catch((err) => {
    error && error(err);
  })
}
export const sendPost = (command: string, request: any, success?: any, error?: any, headers?: any) => {
  let token = localStorage.getItem('token');
  axios.post(url + command, request, {headers: {token, ...headers}}).then((res) => {
    const response = res.data;
    success && success(response)
    console.log(command);
  }).catch((err) => {
    error && error(err);
  })
}

//请求验证码
export const queryVerifyCode = (bindPhone: string, success?: any): void => {
  sendGet(command.GET_VERIFY_CODE, {bindPhone: bindPhone}, success);
}

interface IRequestVerifyCode{
  bindPhone: string,
  verifyCode: string,
  accountName: string
}
//验证注册时 手机and验证码 有效性
export const verifyCode = (request: IRequestVerifyCode, success?:any, err?:any)=>{
  sendGet(command.VERIFY_CODE, request, success, err)
}
//验证注册时 手机and验证码 有效性
export const verifyCodeApi = (request: IRequestVerifyCode, success?:any, err?:any)=>{
  sendGet(command.VERIFY_CODE, request, success, err)
}

//注册
interface IRequestRegister {
  accountName: string
  age: number      //0  1  2  3
  bindPhone: string,
  interestIds: string,
  password: string,
  sex: number    //0男 1女
}
export const register = (request: IRequestRegister, success?: any, err?: any) => {
  sendPost(command.REGISTER, request, success, err);
}


//手机号+密码登录
interface IRequestLogin {
  bindPhone: string
  password: string
}

export const pwdLogin = (request: IRequestLogin, success?: any, err?: any) => {
  sendGet(command.PWD_LOGIN, request, success, err);
}

//手机号+验证码登录
interface IRequestPhoneLogin {
  bindPhone: string
  verifyCode: string
}

export const phoneLogin = (request: IRequestPhoneLogin, success?: any, err?:any) => {
  sendGet(command.PHONE_LOGIN, request, success, err)
}

interface IRequestImg {
  pageSize: number; //每页几张图
  pageNum: number; //几页图
  description?: string
  withOutPicId?:number //根据图片id获取相关推荐图片
}
export const queryImg = (request: IRequestImg, success?: any) => {
  sendPost(command.QUERY_IMG, request, success)
}

export const getImgDetail = (request: {id: number}, success?: any, err?:any)=>{
  sendGet(command.GET_IMG_DETAIL, request, success, err);
}


interface IRequestBookmarkList {
  accountId?: string|number
  name?: string        //艺术家名字
  type: number   //0创作 1收藏
}

//查询画夹列表
export const queryBookmarkList = (request: IRequestBookmarkList, success?: any, err?: any) => {
  sendPost(command.GET_BOOKMARK_LIST, request, success, err)
}

export const logout = (success?: any) => {
  sendGet(command.LOGOUT, {}, success);
}

//获取创作page的关键词
export const queryKeywords = (success?: any) => {
  sendGet(command.QUERY_KEYWORDS, {}, success)
}


interface ITextRequest {
  guidance: number
  width: number
  height: number
  keywords: string
  numImages: number
  prompt: string
  profession?: string  //行业词汇
  negativePrompt?: string
}

export const text2img = (request: ITextRequest, success?: any, err?:any) => {
  sendPost(command.TEXT2IMG, request, success, err, {'Content-Type': 'multipart/form-data'})
}

interface IBookmark {
  clipName: string
  type: number  //0创作 1收藏
}

export const addNewBookmark = (request: IBookmark, success?: any, err?: any) => {
  sendGet(command.ADD_NEW_BOOKMARK, request, success, err);
}

interface IRequestImgRefresh {
  taskId: string
}

export const imgRefresh = (request: IRequestImgRefresh, success?: any, err?: any) => {
  sendGet(command.IMG_REFRESH, request, success, err);
}

interface IImgRequest {
  guidance: number,
  height: number,
  width: number,
  initImage: any,
  keywords?: string,
  numImages: number,
  prompt?: string,
  strength: number,
  negativePrompt?:string
}

export const img2img = (request: IImgRequest, success?: any, err?:any) => {
  sendPost(command.IMG2IMG, request, success, err)
}

//收藏图片
interface IAddRequest {
  picClipId: number,
  picId?:number,
  myPictureDto?: {
    url: string,
    description: string
  }
}

export const addToBookMark = (request: IAddRequest, success ?: any, err?: any) => {
  sendPost(command.COLLECT_IMG, request, success, err);
}

export const removeFromBookMark = (request: {picId:number, pictureClipId:number}, success ?: any, err?: any)=>{
  sendGet(command.CANCEL_COLLECT_IMG, request, success, err);
}

export const setPicture = (request: any, success?: any, err?: any, headers?: any) => {
  sendPost(command.SET_PICTURE, request, success, err, {
    ['Content-Type']: 'multipart/form-data'
  })
}
//收藏图片
export const clipPictures = (request: any, success?: any) => {
  sendGet(command.CLIP_PICTURES, request, success);
}

//个人中心
export const getPersonalInfo = (request: {id:number|string}, success?: any) => {
  sendGet(command.PERSONAL_INFO, request, success);
}

//首页欢迎词
export const welcome = (success?:any)=>{
  sendGet(command.WELCOME, {}, success);
}

//关注用户
export const focus = (request: {focusedAccountId: number}, success?:any, err?:any)=>{
  sendGet(command.FOCUS, request, success, err)
}
//取关
export const unFocus = (request: {focusedAccountId: number}, success?:any, err?:any)=>{
  sendGet(command.UN_FOCUS, request, success, err)
}

//关注列表
export const getFocusList = (request:{focusType: number, pageNum:number,  pageSize: number, accountId?:number}, success?:any)=>{
  sendPost(command.FOCUS_LIST, request, success)
}

export const renameClip = (request: {clipName: string, id: number}, success?:any)=>{
  sendGet(command.RENAME_CLIP, request, success)
}

export const deleteClip = (request: {id: number}, success?:any)=>{
  sendGet(command.DELETE_CLIP, request, success)
}

interface IEditUser{
  id: number,
  bindPhone?: string|number,
  accountName?: string
  headPicFile?: any
  oldPassword?: string
  password?:string
  verifyCode?: string
}
export const editUser = (request:IEditUser, success?:any, err?:any)=>{
  sendPost(command.EDIT_USER, request, success, err, {'Content-Type': 'multipart/form-data'})
}

// 获取兴趣/行业关键词
//type 0 兴趣  1 行业
export const getWords = (request: {type: number}, success?:any, err?:any)=>{
  sendGet(command.GET_WORDS, request, success, err)
}

//图库搜索下方推荐关键词
export const getSearchWords = (request: {topNum:number, word: string},success?:any, err?:any)=>{
  sendGet(command.GET_SEARCH_WORDS,request, success, err);
}

//设置画夹私密/公开  0公開  1私密
export const setClipPrivateStaus = (reqest: {id:number, isPrivate: number}, success?:any, err?:any)=>{
  sendGet(command.SET_CLIP_PRIVATE_STATUS, reqest, success, err)
}

//点赞
export const setLike = (request: {picId: number}, success?:any, err?:any)=>{
  sendGet(command.SET_LIKE, request, success, err);
}

//取消点赞
export const cancelLike = (request: {picId: number}, success?:any, err?:any)=>{
  sendGet(command.CANCEL_LIKE, request, success, err);
}







