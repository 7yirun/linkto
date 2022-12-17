import Home from 'apps/web/pages/Home/Home'
import Create from 'apps/web/pages/Create/Create'
import Pictures from 'apps/web/pages/Pictures/Pictures2'
import Bookmark from 'apps/web/pages/Bookmark/Bookmark'
import Tutorial from 'apps/web/pages/Tutorial/Tutorial'
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