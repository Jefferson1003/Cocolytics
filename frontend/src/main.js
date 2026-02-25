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
import Cart from './views/Cart.vue'
import StaffOrders from './views/StaffOrders.vue'
import CameraScanner from './views/CameraScanner.vue'
import StaffPaperUploads from './views/StaffPaperUploads.vue'
import AdminPaperApprovals from './views/AdminPaperApprovals.vue'
import StaffInventory from './views/StaffInventory.vue'
import WarehouseDispatch from './views/WarehouseDispatch.vue'
import SellersList from './views/SellersList.vue'
import SellerProducts from './views/SellerProducts.vue'
import StaffProfile from './views/StaffProfile.vue'
import StaffStoreView from './views/StaffStoreView.vue'
import AdminReports from './views/AdminReports.vue'
import AdminUsers from './views/AdminUsers.vue'
import AdminFeatures from './views/AdminFeatures.vue'
import StaffReports from './views/StaffReports.vue'
import NotificationsPage from './views/NotificationsPage.vue'

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
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/features',
    name: 'AdminFeatures',
    component: AdminFeatures,
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
    path: '/staff/profile',
    name: 'StaffProfile',
    component: StaffProfile,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/staff/reports',
    name: 'StaffReports',
    component: StaffReports,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/admin/paper-approvals',
    name: 'AdminPaperApprovals',
    component: AdminPaperApprovals,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/sellers',
    name: 'SellersList',
    component: SellersList,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/sellers/:sellerId',
    name: 'SellerProducts',
    component: SellerProducts,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/staff-store/:staffId',
    name: 'StaffStoreView',
    component: StaffStoreView,
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationsPage,
    meta: { requiresAuth: true }
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
    } else {
      next('/staff')
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
      } else {
        next('/staff')
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
