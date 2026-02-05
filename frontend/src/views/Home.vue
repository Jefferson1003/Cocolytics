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
      <h2>� Our Sellers</h2>
      <p class="section-subtitle">Browse products from our trusted sellers</p>
      
      <div v-if="loadingSellers" class="loading-sellers">
        <div class="spinner">⏳</div>
        <p>Loading sellers...</p>
      </div>

      <div v-else-if="sellers.length > 0" class="shop-grid">
        <div v-for="seller in sellers" :key="seller.staff_id" class="shop-card" @click="visitStore(seller.staff_id)">
          <div class="shop-logo">
            <img v-if="seller.store_logo" :src="getImageUrl(seller.store_logo)" :alt="seller.store_name" />
            <div v-else class="default-shop-icon">🥥</div>
          </div>
          <h3>{{ seller.store_name || seller.staff_name + "'s Store" }}</h3>
          <p class="shop-description">{{ seller.store_description || 'Quality coconut products' }}</p>
          <div class="shop-stats">
            <span class="stat-item">📦 {{ seller.product_count }} products</span>
            <span class="stat-item">📊 {{ seller.total_stock }} in stock</span>
          </div>
          <div class="shop-contact" v-if="seller.contact_number">
            <span>📞 {{ seller.contact_number }}</span>
          </div>
          <button class="btn btn-visit">Visit Store</button>
        </div>
      </div>

      <div v-else class="empty-sellers">
        <div class="empty-icon">🏪</div>
        <h3>No Sellers Available</h3>
        <p>Check back later for new sellers!</p>
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
      sellers: [],
      loadingSellers: false,
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
    // Fetch sellers when component mounts
    this.fetchSellers()
  },
  methods: {
    async fetchSellers() {
      this.loadingSellers = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sellers`)
        if (response.ok) {
          this.sellers = await response.json()
        }
      } catch (error) {
        console.error('Error fetching sellers:', error)
      } finally {
        this.loadingSellers = false
      }
    },
    visitStore(sellerId) {
      this.$router.push(`/sellers/${sellerId}`)
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      if (imagePath.startsWith('http')) return imagePath
      if (imagePath.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL}${imagePath}`
      return `${import.meta.env.VITE_API_BASE_URL}/uploads/${imagePath}`
    },
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
  margin-bottom: 0.5rem;
  color: #4CAF50;
  font-size: 2em;
}

.section-subtitle {
  color: #ccc;
  margin-bottom: 2rem;
  font-size: 1.1em;
}

.loading-sellers {
  text-align: center;
  padding: 60px 20px;
  color: #4CAF50;
}

.spinner {
  font-size: 3em;
  margin-bottom: 15px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.shop-card {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.shop-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 70px rgba(76, 175, 80, 0.4);
  border-color: rgba(76, 175, 80, 0.5);
}

.shop-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
}

.shop-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-shop-icon {
  font-size: 3em;
  color: white;
}

.shop-card h3 {
  color: #4CAF50;
  margin-bottom: 10px;
  font-size: 1.4em;
  font-weight: 700;
}

.shop-description {
  color: #ddd;
  font-size: 1em;
  margin-bottom: 15px;
  min-height: 45px;
}

.shop-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
}

.stat-item {
  color: #81C784;
  font-size: 0.95em;
  font-weight: 500;
}

.shop-contact {
  color: #4CAF50;
  margin-bottom: 15px;
  font-size: 0.9em;
}

.btn-visit {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-visit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.empty-sellers {
  text-align: center;
  padding: 80px 20px;
  background: rgba(36, 68, 66, 0.3);
  border-radius: 16px;
  border: 2px dashed rgba(76, 175, 80, 0.3);
}

.empty-icon {
  font-size: 5em;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-sellers h3 {
  color: #4CAF50;
  margin-bottom: 10px;
  font-size: 1.5em;
}

.empty-sellers p {
  color: #ccc;
  font-size: 1.1em;
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
