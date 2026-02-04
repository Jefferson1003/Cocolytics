<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to Cocolytics</h1>
        <p class="hero-subtitle">Your powerful analytics platform</p>
      </div>

      <div class="hero-images">
        <h2>🌴 Premium Quality</h2>
        <p>Discover exceptional craftsmanship</p>
        <div class="welcome-images">
          <div class="image-item">
            <img src="/images/timber-1.jpg" alt="Premium stacked timber" class="welcome-img" />
            <h3>Quality Selection</h3>
          </div>
          <div class="image-item">
            <img src="/images/timber-2.jpg" alt="Fine wood craftsmanship" class="welcome-img" />
            <h3>Expert Craftsmanship</h3>
          </div>
          <div class="image-item">
            <img src="/images/timber-3.jpg" alt="Professional lumber handling" class="welcome-img" />
            <h3>Professional Service</h3>
          </div>
        </div>
      </div>
    </section>

    <section class="install-section" v-if="!isInstalled">
      <div class="card install-card">
        <h2>📱 Install Cocolytics</h2>
        <p>Install this app on your device for quick access and offline support!</p>
        <ul class="install-benefits">
          <li>✓ Works offline</li>
          <li>✓ Quick launch from home screen</li>
          <li>✓ Native app experience</li>
        </ul>
      </div>
    </section>

    <section class="data-section" v-if="apiData.length">
      <h2>📊 Data from API</h2>
      <div class="grid">
        <div class="card" v-for="item in apiData" :key="item.id">
          <h3>{{ item.name }}</h3>
          <p class="value">{{ item.value }}</p>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>Features</h2>
      <div class="grid">
        <div class="card analytics-card" @click="showHistoricalData = !showHistoricalData">
          <h3>📈 Real-time Analytics</h3>
          <p>Track your metrics in real-time with beautiful visualizations and access historical data for comprehensive insights.</p>
          <button class="btn-analytics">View Historical Data</button>
        </div>
        <div class="card">
          <h3>🔒 Secure Data</h3>
          <p>Your data is encrypted and securely stored.</p>
        </div>
        <div class="card">
          <h3>📱 Mobile Ready</h3>
          <p>Install the app on any device for the best experience.</p>
        </div>
      </div>
    </section>

    <section class="historical-data" v-if="showHistoricalData">
      <h2>📊 Historical Data Analytics</h2>
      <div class="chart-container">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <div class="data-summary">
        <div class="summary-card">
          <h3>Key Metrics</h3>
          <p>Total Production: 18,000 units</p>
          <p>Total Sales: 15,000 units</p>
          <p>Average Efficiency: 91%</p>
        </div>
      </div>
    </section>

    <section class="shop-section">
      <h2>🌴 Coconut Shops</h2>
      <div class="shop-grid">
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Tropical Paradise Shop</h3>
          <p>Fresh coconuts daily</p>
          <router-link to="/orders" class="btn">Visit Traders</router-link>
        </div>
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Island Market</h3>
          <p>Premium coconut selection</p>
          <router-link to="/orders" class="btn">Visit Traders</router-link>
        </div>
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Beachside Store</h3>
          <p>Locally sourced coconuts</p>
          <router-link to="/orders" class="btn">Visit Traders</router-link>
        </div>
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Palm Grove Emporium</h3>
          <p>Wide variety of coconuts</p>
          <router-link to="/orders" class="btn">Visit Traders</router-link>
        </div>
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Coconut Haven</h3>
          <p>Quality coconuts guaranteed</p>
          <router-link to="/orders" class="btn">Visit Traders</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios'
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

import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'Home',
  components: {
    Line
  },
  data() {
    return {
      apiData: [],
      healthStatus: null,
      isInstalled: false,
      showHistoricalData: false,
      chartData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Production (units)',
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            data: [1200, 1350, 1100, 1400, 1600, 1500, 1700, 1800, 1650, 1900, 1750, 2000]
          },
          {
            label: 'Sales (units)',
            backgroundColor: '#2196F3',
            borderColor: '#2196F3',
            data: [1000, 1150, 950, 1200, 1350, 1300, 1450, 1550, 1400, 1650, 1500, 1750]
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monthly Production & Sales Analytics'
          }
        }
      }
    }
  },
  mounted() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true
    }
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('/api/data')
        this.apiData = response.data.data
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Could not connect to API. Make sure the backend is running.')
      }
    },
    async checkHealth() {
      try {
        const response = await axios.get('/api/health')
        this.healthStatus = response.data
      } catch (error) {
        console.error('Error checking health:', error)
        this.healthStatus = { status: 'ERROR', timestamp: new Date().toISOString() }
      }
    }
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  min-height: 100vh;
  background: #e5e5e5;
  color: #fff;
  padding: 20px;
}

.hero {
  text-align: center;
  padding: 4rem 2rem 3rem;
  background: linear-gradient(135deg, #2d1b4e 0%, #3d2463 50%, #4a2f77 100%);
  color: #fff;
  border-radius: 20px;
  box-shadow: 0 25px 70px rgba(61, 36, 99, 0.5);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  margin-bottom: 3rem;
}

.hero-images {
  position: relative;
  z-index: 1;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-images h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #e0d5ff;
}

.hero-images p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2rem;
}

.welcome-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeInDown 0.8s ease-out;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fff;
  animation: slideDown 0.6s ease-out;
}

.hero-subtitle {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  animation: slideDown 0.6s ease-out 0.1s both;
}

.hero-description {
  font-size: 1rem;
  opacity: 0.85;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.85);
  animation: slideDown 0.6s ease-out 0.2s both;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: slideDown 0.6s ease-out 0.3s both;
}

.btn {
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: #fff;
  color: #4a2f77;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
}

.btn-outline {
  background: transparent;
  border-color: #fff;
  color: #fff;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
}

.cocolytics-welcome {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
}

.cocolytics-welcome h2 {
  font-size: 2rem;
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

.cocolytics-welcome p {
  font-size: 1.1rem;
  color: #ccc;
  margin-bottom: 2rem;
}

.welcome-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.image-item {
  background: #242442;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
}

.image-item:hover {
  transform: translateY(-8px);
}

.welcome-img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.image-item h3 {
  color: #81C784;
  padding: 1rem;
  margin: 0;
  font-size: 1.1rem;
}

.install-section .install-card {
  text-align: center;
  background: #242442;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.install-benefits {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.data-section h2,
.features h2 {
  margin-bottom: 1.5rem;
  color: #4CAF50;
}

.value {
  font-size: 2rem;
  font-weight: bold;
  color: #4CAF50;
}

.status-card {
  text-align: center;
  max-width: 300px;
  background: #242442;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.status {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f44336;
}

.status-ok {
  color: #4CAF50;
}

.timestamp {
  font-size: 0.9rem;
  color: #ccc;
  margin-top: 0.5rem;
}

.card {
  background: #242442;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.analytics-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.analytics-card:hover {
  transform: translateY(-5px);
}

.btn-analytics {
  background: #4CAF50;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
}

.btn-analytics:hover {
  background: #388E3C;
}

.historical-data {
  margin-top: 2rem;
}

.historical-data h2 {
  color: #4CAF50;
  margin-bottom: 1.5rem;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.data-card {
  background: #242442;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: #fff;
  text-align: center;
}

.data-card h3 {
  color: #81C784;
  margin-bottom: 1rem;
}

.data-card p {
  margin: 0.5rem 0;
  color: #ccc;
}

.shop-section h2 {
  margin-bottom: 1.5rem;
  color: #4CAF50;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.shop-card {
  background: #242442;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
}

.shop-card:hover {
  transform: translateY(-5px);
}

.shop-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.shop-card h3 {
  color: #81C784;
  margin-bottom: 0.5rem;
}

.shop-card p {
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.shop-card .btn {
  background: #4CAF50;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.shop-card .btn:hover {
  background: #388E3C;
}

.chart-container {
  height: 400px;
  margin-bottom: 2rem;
  background: #242442;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.data-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.summary-card {
  background: #242442;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.summary-card h3 {
  color: #81C784;
  margin-bottom: 1rem;
}

.summary-card p {
  color: #fff;
  margin: 0.5rem 0;
  font-size: 1.1rem;
}
</style>
