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
        <div class="card">
          <h3>📈 Real-time Analytics</h3>
          <p>Track your metrics in real-time with beautiful visualizations.</p>
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
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Home',
  data() {
    return {
      apiData: [],
      healthStatus: null,
      isInstalled: false
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
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--white);
  border-radius: 15px;
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
  background: var(--white);
  color: var(--primary-color);
}

.hero .btn:hover {
  background: #f0f0f0;
}

.hero .btn-outline {
  background: transparent;
  border-color: var(--white);
  color: var(--white);
}

.hero .btn-outline:hover {
  background: var(--white);
  color: var(--primary-color);
}

.install-section .install-card {
  text-align: center;
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
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
  color: var(--primary-color);
}

.value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.status-card {
  text-align: center;
  max-width: 300px;
}

.status {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f44336;
}

.status-ok {
  color: var(--primary-color);
}

.timestamp {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}
</style>
