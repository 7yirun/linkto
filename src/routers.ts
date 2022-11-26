import Home from 'pages/Home/Home'
import Create from 'pages/Create/Create'
import Pictures from 'pages/Pictures/Pictures'
import Bookmark from 'pages/Bookmark/Bookmark'
import Tutorial from 'pages/Tutorial/Tutorial'
import SubBookmark from "pages/Bookmark/Subpage/SubBookmark/SubBookmark";
import SubMyFollow from "pages/Bookmark/Subpage/SubMyfollow/SubMyfollow";
import SubMyHistory from "pages/Bookmark/Subpage/SubMyhistory/SubMyhistory";
export default[
  {path:'/', name: 'Home', component: Home},
  {path:'/create', name: 'Create', component: Create, auth:true},
  {path:'/pictures', name: 'Pictures', component: Pictures, auth:true},
  {path:'/bookmark', name: 'Bookmark', component: Bookmark, auth:true},
  {path:'/bookmark/sub-bookmark', name: 'SubBookmark', component: Bookmark, auth:true},
  {path:'/bookmark/sub-myfollow', name: 'SubMyFollow', component: Bookmark, auth:true},
  {path:'/bookmark/sub-myhistory', name: 'SubMyHistory', component: Bookmark, auth:true},
  {path:'/tutorial', name: 'Bookmark', component: Tutorial, auth:true}
]