<template>
  <div class="home">
    <section class="hero">
      <h1>Welcome to Cocolytics</h1>
      <p>Your powerful analytics platform</p>
      <div class="hero-buttons">
        <button class="btn" @click="fetchData">Load Data</button>
        <button class="btn btn-outline" @click="checkHealth">Check API</button>
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

    <section class="status-section" v-if="healthStatus">
      <div class="card status-card">
        <h3>API Status</h3>
        <p class="status" :class="{ 'status-ok': healthStatus.status === 'OK' }">
          {{ healthStatus.status }}
        </p>
        <p class="timestamp">{{ healthStatus.timestamp }}</p>
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
      <h2>🥥 Coconut Shops</h2>
      <div class="shop-grid">
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Tropical Paradise Shop</h3>
          <p>Fresh coconuts daily</p>
          <button class="btn">Visit Traders</button>
        </div>
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Island Market</h3>
          <p>Premium coconut selection</p>
          <button class="btn">Visit Traders</button>
        </div>
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Beachside Store</h3>
          <p>Locally sourced coconuts</p>
          <button class="btn">Visit Traders</button>
        </div>
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Palm Grove Emporium</h3>
          <p>Wide variety of coconuts</p>
          <button class="btn">Visit Traders</button>
        </div>
        <div class="shop-card">
          <div class="shop-icon">🏪</div>
          <h3>Coconut Haven</h3>
          <p>Quality coconuts guaranteed</p>
          <button class="btn">Visit Traders</button>
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 20px;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero .btn {
  background: #242442;
  color: #4CAF50;
}

.hero .btn:hover {
  background: #333;
}

.hero .btn-outline {
  background: transparent;
  border-color: #4CAF50;
  color: #4CAF50;
}

.hero .btn-outline:hover {
  background: #4CAF50;
  color: #fff;
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
