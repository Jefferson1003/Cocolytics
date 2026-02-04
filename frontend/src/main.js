import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Import views
import Home from './views/Home.vue'
import About from './views/About.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import StaffDashboard from './views/StaffDashboard.vue'
import AddCocolumber from './views/AddCocolumber.vue'
import UserOrders from './views/UserOrders.vue'
import Cart from './views/Cart.vue'
import StaffOrders from './views/StaffOrders.vue'
import CameraScanner from './views/CameraScanner.vue'
import StaffPaperUploads from './views/StaffPaperUploads.vue'
import AdminPaperApprovals from './views/AdminPaperApprovals.vue'
import StaffInventory from './views/StaffInventory.vue'
import WarehouseDispatch from './views/WarehouseDispatch.vue'

// Define routes
const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Home,
    meta: { requiresAuth: true }
  },
  { 
    path: '/about', 
    name: 'About', 
    component: About,
    meta: { requiresAuth: true }
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
    meta: { guest: true }
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/staff',
    name: 'StaffDashboard',
    component: WarehouseDispatch,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/staff/add-cocolumber',
    name: 'AddCocolumber',
    component: AddCocolumber,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/staff/orders',
    name: 'StaffOrders',
    component: StaffOrders,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/staff/camera-scanner',
    name: 'CameraScanner',
    component: CameraScanner,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/staff/paper-uploads',
    name: 'StaffPaperUploads',
    component: StaffPaperUploads,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/staff/inventory',
    name: 'StaffInventory',
    component: StaffInventory,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/admin/paper-approvals',
    name: 'AdminPaperApprovals',
    component: AdminPaperApprovals,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/user/orders',
    name: 'UserOrders',
    component: UserOrders,
    meta: { requiresAuth: true, roles: ['user', 'staff', 'admin'] }
  },
  {
    path: '/orders',
    redirect: '/user/orders'
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { requiresAuth: true, roles: ['user', 'staff', 'admin'] }
  }
]

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')
  const isAuthenticated = !!token
  const user = userData ? JSON.parse(userData) : null

  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  // If route is for guests only and user is authenticated
  else if (to.meta.guest && isAuthenticated) {
    // Redirect based on role
    if (user?.role === 'admin') {
      next('/admin')
    } else if (user?.role === 'staff') {
      next('/staff')
    } else {
      next('/')
    }
  }
  // Check role-based access
  else if (to.meta.roles && isAuthenticated) {
    if (user && to.meta.roles.includes(user.role)) {
      next()
    } else {
      // Redirect to appropriate dashboard based on role
      if (user?.role === 'admin') {
        next('/admin')
      } else if (user?.role === 'staff') {
        next('/staff')
      } else {
        next('/')
      }
    }
  }
  else {
    next()
  }
})

// Create and mount app
const app = createApp(App)
app.use(router)
app.mount('#app')

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service worker registration failed')
    })
  })
}
