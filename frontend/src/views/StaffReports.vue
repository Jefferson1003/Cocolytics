<template>
  <div class="staff-layout">
    <StaffSidebar />

    <!-- Main Content -->
    <div class="dashboard-container" ref="reportContainer">
      <div class="dashboard-header print-header">
        <div class="header-content">
          <h1>📊 My Sales Reports</h1>
          <p>View your cocolumber sales, revenue, and performance metrics</p>
        </div>
        <button @click="printReport" class="print-btn" title="Print Report">
          🖨️ Print
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading your sales data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <p>❌ {{ error }}</p>
        <button @click="fetchReports" class="retry-btn">Retry</button>
      </div>

      <!-- Reports Content -->
      <div v-else class="reports-content">
        <div class="filters-row">
          <select v-model="selectedPeriod" @change="filterReports" class="period-select">
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div class="reports-grid">
          <div class="report-card">
            <div class="report-head">
              <h3>Total Sales</h3>
              <span class="report-chip">Live</span>
            </div>
            <div class="report-kpi">₱ {{ formatCurrency(filteredStats.revenue || 0) }}</div>
            <p class="report-meta">Revenue from cocolumber sales</p>
            <div class="report-chart sales"></div>
            <div class="report-foot">
              <span>Items: {{ filteredStats.total_items || 0 }}</span>
              <span>Avg: ₱{{ filteredStats.total_items > 0 ? formatCurrency((filteredStats.revenue / filteredStats.total_items).toFixed(2)) : '0' }}</span>
            </div>
          </div>

          <div class="report-card">
            <div class="report-head">
              <h3>Items Sold</h3>
              <span class="report-chip green">Active</span>
            </div>
            <div class="report-kpi">{{ filteredStats.total_items || 0 }} units</div>
            <p class="report-meta">Total cocolumber quantity sold</p>
            <div class="report-chart items"></div>
            <div class="report-foot" v-if="topProducts.length > 0">
              <span v-if="topProducts[0]">{{ topProducts[0].grade || 'Top' }}: {{ topProducts[0].total_quantity }}</span>
              <span v-if="topProducts[1]">{{ topProducts[1].grade || 'Second' }}: {{ topProducts[1].total_quantity }}</span>
            </div>
          </div>

          <div class="report-card">
            <div class="report-head">
              <h3>Orders</h3>
              <span class="report-chip">Live</span>
            </div>
            <div class="report-kpi">{{ filteredStats.total_orders || 0 }} orders</div>
            <p class="report-meta">Total orders received</p>
            <div class="report-chart orders"></div>
            <div class="report-foot">
              <span>Completed: {{ filteredStats.total_orders || 0 }}</span>
              <span>Pending: 0</span>
            </div>
          </div>

          <div class="report-card">
            <div class="report-head">
              <h3>Rating</h3>
              <span class="report-chip amber">{{ totalStats.avg_rating || 0 }}</span>
            </div>
            <div class="report-kpi">{{ totalStats.avg_rating || 0 }} ⭐</div>
            <p class="report-meta">Customer satisfaction score</p>
            <div class="report-chart rating"></div>
            <div class="report-foot">
              <span v-if="totalStats.avg_rating >= 4.5">Excellent rating</span>
              <span v-else-if="totalStats.avg_rating >= 4">Very good</span>
              <span v-else>Good</span>
            </div>
          </div>

          <div class="report-card">
            <div class="report-head">
              <h3>Growth</h3>
              <span class="report-chip" :class="growthPercentage >= 0 ? 'blue' : 'red'">{{ growthPercentage >= 0 ? '+' : '' }}{{ growthPercentage }}%</span>
            </div>
            <div class="report-kpi" :class="growthPercentage >= 0 ? 'green-text' : 'red-text'">{{ growthPercentage >= 0 ? '+' : '' }}{{ growthPercentage }}%</div>
            <p class="report-meta">Month-over-month growth</p>
            <div class="report-chart growth"></div>
            <div class="report-foot">
              <span>Last Month: ₱{{ formatCurrency(lastMonthRevenue || 0) }}</span>
              <span>This Month: ₱{{ formatCurrency(thisMonthStats.revenue || 0) }}</span>
            </div>
          </div>

          <div class="report-card">
            <div class="report-head">
              <h3>Top Products</h3>
              <span class="report-chip gray">Trending</span>
            </div>
            <div class="report-kpi">🏆</div>
            <p class="report-meta">Your best-selling grades</p>
            <div class="top-products-list">
              <div v-if="topProducts.length > 0" v-for="(product, idx) in topProducts.slice(0, 2)" :key="idx" class="product-item">
                <span class="product-name">{{ product.grade || 'Grade' }} ({{ product.times_sold }} sales)</span>
                <span class="product-count">{{ product.total_quantity }} units</span>
              </div>
              <div v-else class="product-item">
                <span class="product-name">No data yet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Breakdown Table -->
      <div v-if="!loading && !error && monthlySales.length > 0" class="summary-section print-table">
        <h2>Monthly Breakdown</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Orders</th>
              <th>Items Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="month in monthlySales" :key="month.month">
              <td>{{ formatMonth(month.month) }}</td>
              <td>{{ month.total_orders }}</td>
              <td>{{ month.total_items }}</td>
              <td>₱ {{ formatCurrency(month.revenue || 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Yearly Breakdown Table -->
      <div v-if="!loading && !error && yearlySales.length > 0" class="summary-section print-table">
        <h2>Yearly Breakdown</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Orders</th>
              <th>Items Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="year in yearlySales" :key="year.year">
              <td>{{ year.year }}</td>
              <td>{{ year.total_orders }}</td>
              <td>{{ year.total_items }}</td>
              <td>₱ {{ formatCurrency(year.revenue || 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Statistics -->
      <div v-if="!loading && !error" class="summary-section">
        <h2>Summary Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Revenue</span>
            <span class="stat-value">₱ {{ formatCurrency(totalStats.total_revenue || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Items Sold</span>
            <span class="stat-value">{{ totalStats.total_items || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Orders</span>
            <span class="stat-value">{{ totalStats.total_orders || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average Rating</span>
            <span class="stat-value">{{ totalStats.avg_rating || 0 }}/5.0</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'
import axios from 'axios'

export default {
  name: 'StaffReports',
  components: {
    StaffSidebar
  },
  data() {
    return {
      selectedPeriod: 'month',
      loading: true,
      error: null,
      totalStats: {},
      monthlySales: [],
      yearlySales: [],
      thisMonthStats: {},
      lastMonthRevenue: 0,
      growthPercentage: 0,
      topProducts: []
    }
  },
  computed: {
    filteredStats() {
      if (this.selectedPeriod === 'month') {
        return this.thisMonthStats
      }
      return this.totalStats
    }
  },
  methods: {
    async fetchReports() {
      try {
        this.loading = true
        this.error = null
        const token = localStorage.getItem('token')
        
        const response = await axios.get('/api/staff/reports', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        this.totalStats = response.data.totalStats
        this.monthlySales = response.data.monthlySales
        this.yearlySales = response.data.yearlySales
        this.thisMonthStats = response.data.thisMonthStats
        this.lastMonthRevenue = response.data.lastMonthRevenue
        this.growthPercentage = response.data.growthPercentage
        this.topProducts = response.data.topProducts
      } catch (error) {
        console.error('Error fetching reports:', error)
        this.error = error.response?.data?.message || 'Failed to load sales reports'
      } finally {
        this.loading = false
      }
    },
    filterReports() {
      // This can be extended to filter the display based on selectedPeriod
      // For now, just re-fetch or update computed values
    },
    formatCurrency(value) {
      return parseFloat(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatMonth(monthString) {
      const [year, month] = monthString.split('-')
      const date = new Date(year, parseInt(month) - 1)
      return date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    },
    printReport() {
      window.print()
    }
  },
  mounted() {
    this.fetchReports()
  }
}
</script>

<style scoped>
.staff-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
}

.dashboard-container {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #4CAF50;
  margin-bottom: 12px;
  font-weight: 700;
}

.dashboard-header p {
  color: #bbb;
  font-size: 1.1rem;
}

.print-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  margin-left: 20px;
}

.print-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(76, 175, 80, 0.3);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #bbb;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(76, 175, 80, 0.2);
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  color: #ffcdd2;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.retry-btn {
  margin-top: 15px;
  background: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #da190b;
}

.reports-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.filters-row {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

.period-select {
  padding: 10px 16px;
  background: rgba(30, 30, 63, 0.7);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-select:hover {
  border-color: #4CAF50;
  background: rgba(30, 30, 63, 0.9);
}

.period-select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.report-card {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
}

.report-card:hover {
  transform: translateY(-4px);
  border-color: rgba(76, 175, 80, 0.4);
  box-shadow: 0 12px 32px rgba(76, 175, 80, 0.2);
}

.report-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.report-head h3 {
  margin: 0;
  color: #e6f4ea;
  font-size: 1.1rem;
  font-weight: 600;
}

.report-chip {
  background: rgba(76, 175, 80, 0.2);
  color: #bfe9c5;
  border: 1px solid rgba(76, 175, 80, 0.4);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.report-chip.green {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border-color: rgba(76, 175, 80, 0.4);
}

.report-chip.amber {
  background: rgba(255, 193, 7, 0.2);
  color: #ffdd95;
  border-color: rgba(255, 193, 7, 0.4);
}

.report-chip.blue {
  background: rgba(33, 150, 243, 0.2);
  color: #81d4fa;
  border-color: rgba(33, 150, 243, 0.4);
}

.report-chip.red {
  background: rgba(244, 67, 54, 0.2);
  color: #ef9a9a;
  border-color: rgba(244, 67, 54, 0.4);
}

.report-chip.gray {
  background: rgba(189, 189, 189, 0.15);
  color: #d0d0d0;
  border-color: rgba(189, 189, 189, 0.3);
}

.report-kpi {
  font-size: 1.8rem;
  color: #4CAF50;
  font-weight: 700;
}

.report-kpi.green-text {
  color: #4CAF50;
}

.report-kpi.red-text {
  color: #ef9a9a;
}

.report-meta {
  color: #9bb4a0;
  font-size: 0.9rem;
  margin: 0;
}

.report-chart {
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(120deg, rgba(76, 175, 80, 0.25), rgba(15, 32, 39, 0.05));
  position: relative;
  overflow: hidden;
}

.report-chart::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 0px,
    rgba(255, 255, 255, 0.06) 6px,
    transparent 6px,
    transparent 14px
  );
  animation: shimmer 3s linear infinite;
}

.report-chart.sales {
  background: linear-gradient(120deg, rgba(76, 175, 80, 0.3), rgba(32, 58, 67, 0.2));
}

.report-chart.items {
  background: linear-gradient(120deg, rgba(33, 150, 243, 0.3), rgba(32, 58, 67, 0.2));
}

.report-chart.orders {
  background: linear-gradient(120deg, rgba(156, 39, 176, 0.3), rgba(32, 58, 67, 0.2));
}

.report-chart.rating {
  background: linear-gradient(120deg, rgba(255, 193, 7, 0.3), rgba(32, 58, 67, 0.2));
}

.report-chart.growth {
  background: linear-gradient(120deg, rgba(0, 188, 212, 0.3), rgba(32, 58, 67, 0.2));
}

.report-foot {
  display: flex;
  justify-content: space-between;
  color: #9bb4a0;
  font-size: 0.85rem;
  margin-top: 8px;
}

.top-products-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.product-name {
  color: #e6f4ea;
  font-size: 0.9rem;
}

.product-count {
  color: #4CAF50;
  font-weight: 600;
  font-size: 0.85rem;
}

.summary-section {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.summary-section h2 {
  color: #4CAF50;
  font-size: 1.4rem;
  margin: 0 0 20px 0;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  background: rgba(76, 175, 80, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  color: #9bb4a0;
  font-size: 0.9em;
  font-weight: 500;
}

.stat-value {
  color: #e6f4ea;
  font-size: 1.4em;
  font-weight: 700;
}

.stat-value.green {
  color: #4CAF50;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.data-table thead {
  background: rgba(76, 175, 80, 0.1);
  border-bottom: 2px solid rgba(76, 175, 80, 0.3);
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  color: #4CAF50;
  font-weight: 600;
}

.data-table td {
  padding: 12px 16px;
  color: #e6f4ea;
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
}

.data-table tr:hover {
  background: rgba(76, 175, 80, 0.05);
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 1200px) {
  .reports-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 20px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 20px;
  }

  .print-btn {
    margin-left: 0;
    width: 100%;
  }

  .dashboard-header h1 {
    font-size: 1.6rem;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Print Styles */
@media print {
  .staff-layout {
    background: white;
  }

  .dashboard-container {
    padding: 0;
    background: white;
  }

  .print-btn,
  .filters-row,
  .period-select {
    display: none !important;
  }

  .print-header {
    margin-bottom: 20px;
    page-break-after: avoid;
  }

  .print-header h1 {
    color: #333;
  }

  .print-header p {
    color: #666;
  }

  .report-card {
    background: white;
    border: 1px solid #ddd;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    page-break-inside: avoid;
  }

  .report-card:hover {
    transform: none;
  }

  .report-head h3 {
    color: #333;
  }

  .report-kpi {
    color: #2e7d32;
  }

  .report-meta {
    color: #666;
  }

  .report-chip {
    background: #f0f0f0;
    color: #333;
    border: 1px solid #ccc;
  }

  .summary-section {
    background: white;
    border: 1px solid #ddd;
    page-break-inside: avoid;
  }

  .print-table {
    page-break-inside: avoid;
  }

  .data-table {
    margin-bottom: 20px;
  }

  .data-table th {
    background: #f5f5f5;
    color: #333;
    border-bottom: 2px solid #333;
  }

  .data-table td {
    color: #333;
    border-bottom: 1px solid #ddd;
  }

  .stat-item {
    background: #f9f9f9;
    border: 1px solid #ddd;
  }

  .stat-label {
    color: #666;
  }

  .stat-value {
    color: #333;
  }
}
</style>
