import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Vant UI库
import {
  Button,
  List,
  Cell,
  CellGroup,
  Loading,
  Toast,
  NavBar,
  Tab,
  Tabs,
  Swipe,
  SwipeItem,
  Lazyload,
  Icon,
  Tag,
  Divider,
  Skeleton
} from 'vant'

// 创建Vue应用实例
const app = createApp(App)

// 使用Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 使用路由
app.use(router)

// 注册Vant组件
app.use(Button)
app.use(List)
app.use(Cell)
app.use(CellGroup)
app.use(Loading)
app.use(Toast)
app.use(NavBar)
app.use(Tab)
app.use(Tabs)
app.use(Swipe)
app.use(SwipeItem)
app.use(Lazyload)
app.use(Icon)
app.use(Tag)
app.use(Divider)
app.use(Skeleton)

// 挂载应用
app.mount('#app')