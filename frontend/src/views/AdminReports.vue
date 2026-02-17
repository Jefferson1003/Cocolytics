<template>
  <div class="admin-layout">
    <AdminSidebar />

    <!-- Main Content -->
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>📊 Reports Dashboard</h1>
        <p>View all production, inventory, dispatch, yield & wastage, forecast, and system log reports</p>
      </div>

      <div class="dashboard-sections">
        <div class="section reports-section">
          <div class="reports-header">
            <div>
              <h2>📊 Reports Dashboard</h2>
              <p class="reports-subtitle">Production, inventory, dispatch, yield & wastage, forecast, system logs</p>
            </div>
            <div class="reports-actions">
              <button class="report-btn">Export All</button>
              <button class="report-btn outline">Schedule</button>
            </div>
          </div>

          <div class="reports-grid">
            <div class="report-card">
              <div class="report-head">
                <h3>Production Reports</h3>
                <span class="report-chip">Live</span>
              </div>
              <div class="report-kpi">4,820 units</div>
              <p class="report-meta">Shift output, line efficiency, downtime highlights</p>
              <div class="report-chart production"></div>
              <div class="report-foot">
                <span>On-time: 96%</span>
                <span>Downtime: 2h</span>
              </div>
            </div>

            <div class="report-card">
              <div class="report-head">
                <h3>Inventory Reports</h3>
                <span class="report-chip amber">Critical</span>
              </div>
              <div class="report-kpi">312 SKUs</div>
              <p class="report-meta">Stock levels, reorder alerts, aging inventory</p>
              <div class="report-chart inventory"></div>
              <div class="report-foot">
                <span>Low stock: 18</span>
                <span>Overstock: 6</span>
              </div>
            </div>

            <div class="report-card">
              <div class="report-head">
                <h3>Dispatch Reports</h3>
                <span class="report-chip">Live</span>
              </div>
              <div class="report-kpi">1,247 orders</div>
              <p class="report-meta">Outbound flow, carrier status, delays</p>
              <div class="report-chart dispatch"></div>
              <div class="report-foot">
                <span>On-time: 91%</span>
                <span>Delayed: 23</span>
              </div>
            </div>

            <div class="report-card">
              <div class="report-head">
                <h3>Yield & Wastage</h3>
                <span class="report-chip teal">Audit</span>
              </div>
              <div class="report-kpi">Yield 87.4%</div>
              <p class="report-meta">Input vs output, scrap reasons, recovery trends</p>
              <div class="report-chart yield"></div>
              <div class="report-foot">
                <span>Wastage: 4.8%</span>
                <span>Recovered: 1.2%</span>
              </div>
            </div>

            <div class="report-card">
              <div class="report-head">
                <h3>Forecast Reports</h3>
                <span class="report-chip violet">30 Days</span>
              </div>
              <div class="report-kpi">+12.6% demand</div>
              <p class="report-meta">Demand forecast, capacity gaps, procurement</p>
              <div class="report-chart forecast"></div>
              <div class="report-foot">
                <span>Accuracy: 93%</span>
                <span>Risk: Low</span>
              </div>
            </div>

            <div class="report-card logs-card">
              <div class="report-head">
                <h3>System Logs</h3>
                <span class="report-chip gray">Secured</span>
              </div>
              <div class="report-kpi">Last 24h</div>
              <p class="report-meta">Auth events, API errors, service status</p>
              <div class="logs-list">
                <div class="log-row">
                  <span class="log-pill ok"></span>
                  <div>
                    <div class="log-title">API Gateway healthy</div>
                    <div class="log-time">10:22 AM - 0 errors</div>
                  </div>
                </div>
                <div class="log-row">
                  <span class="log-pill warn"></span>
                  <div>
                    <div class="log-title">Inventory sync delay</div>
                    <div class="log-time">09:47 AM - 2 retries</div>
                  </div>
                </div>
                <div class="log-row">
                  <span class="log-pill alert"></span>
                  <div>
                    <div class="log-title">Failed staff login</div>
                    <div class="log-time">08:19 AM - flagged</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '../components/AdminSidebar.vue'

export default {
  name: 'AdminReports',
  components: {
    AdminSidebar
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  max-width: 100vw;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  position: relative;
  overflow-x: hidden;
}

.dashboard-container {
  flex: 1;
  margin-left: 280px;
  padding: 40px 50px;
  overflow-y: auto;
  overflow-x: hidden;
  transition: margin-left 0.3s ease;
  width: calc(100% - 280px);
  max-width: calc(100vw - 280px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  box-sizing: border-box;
}

.admin-layout .sidebar.collapsed ~ .dashboard-container {
  margin-left: 90px;
  width: calc(100% - 90px);
  max-width: calc(100vw - 90px);
}

.dashboard-header {
  margin-bottom: 30px;
  flex-shrink: 0;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #4CAF50;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.dashboard-header p {
  color: #bbb;
  font-size: 1.2rem;
  font-weight: 400;
}

.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;
  flex: 1;
}

.section {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  width: 100%;
  display: flex;
  flex-direction: column;
}

.reports-section {
  position: relative;
  overflow: hidden;
  font-family: "Space Grotesk", "Trebuchet MS", sans-serif;
}

.reports-section::before {
  content: "";
  position: absolute;
  inset: -120px -80px auto auto;
  height: 260px;
  width: 260px;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.35) 0%, rgba(76, 175, 80, 0) 70%);
  opacity: 0.6;
  pointer-events: none;
}

.reports-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.reports-header h2 {
  color: #4CAF50;
  margin-bottom: 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.reports-subtitle {
  color: #9bb4a0;
  margin: 6px 0 0;
  font-size: 1rem;
}

.reports-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.report-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  background: #4CAF50;
  color: #0f2027;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-btn.outline {
  background: transparent;
  border: 1px solid rgba(76, 175, 80, 0.6);
  color: #cfe9d3;
}

.report-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(76, 175, 80, 0.25);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.report-card {
  background: linear-gradient(135deg, rgba(15, 32, 39, 0.85) 0%, rgba(28, 41, 52, 0.9) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 20px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 240px;
  position: relative;
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
  font-size: 1.2rem;
  letter-spacing: 0.2px;
}

.report-chip {
  background: rgba(76, 175, 80, 0.2);
  color: #bfe9c5;
  border: 1px solid rgba(76, 175, 80, 0.4);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.report-chip.amber {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.4);
  color: #ffdd95;
}

.report-chip.teal {
  background: rgba(0, 188, 212, 0.2);
  border-color: rgba(0, 188, 212, 0.4);
  color: #8be8f5;
}

.report-chip.violet {
  background: rgba(156, 39, 176, 0.2);
  border-color: rgba(156, 39, 176, 0.4);
  color: #e1a7f0;
}

.report-chip.gray {
  background: rgba(189, 189, 189, 0.15);
  border-color: rgba(189, 189, 189, 0.3);
  color: #d0d0d0;
}

.report-kpi {
  font-size: 1.6rem;
  color: #4CAF50;
  font-weight: 700;
}

.report-meta {
  color: #9bb4a0;
  font-size: 0.95rem;
  margin: 0;
}

.report-chart {
  height: 80px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(120deg, rgba(76, 175, 80, 0.25), rgba(15, 32, 39, 0.05));
}

.report-chart::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.06) 6px,
    transparent 6px,
    transparent 14px
  );
  animation: scanline 6s linear infinite;
}

.report-chart.production {
  background: linear-gradient(120deg, rgba(76, 175, 80, 0.4), rgba(32, 58, 67, 0.2));
}

.report-chart.inventory {
  background: linear-gradient(120deg, rgba(255, 193, 7, 0.35), rgba(32, 58, 67, 0.2));
}

.report-chart.dispatch {
  background: linear-gradient(120deg, rgba(33, 150, 243, 0.35), rgba(32, 58, 67, 0.2));
}

.report-chart.yield {
  background: linear-gradient(120deg, rgba(0, 188, 212, 0.35), rgba(32, 58, 67, 0.2));
}

.report-chart.forecast {
  background: linear-gradient(120deg, rgba(156, 39, 176, 0.35), rgba(32, 58, 67, 0.2));
}

.report-foot {
  display: flex;
  justify-content: space-between;
  color: #b7c8bc;
  font-size: 0.9rem;
}

.logs-card {
  gap: 10px;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.log-pill {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 5px;
}

.log-pill.ok {
  background: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
}

.log-pill.warn {
  background: #ffc107;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.6);
}

.log-pill.alert {
  background: #ff6b6b;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.6);
}

.log-title {
  color: #e6f4ea;
  font-weight: 600;
}

.log-time {
  color: #9bb4a0;
  font-size: 0.85rem;
}

@keyframes scanline {
  0% {
    transform: translateX(-20%);
  }
  100% {
    transform: translateX(20%);
  }
}

@media (max-width: 1200px) {
  .reports-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    margin-left: 0;
    padding: 20px;
    width: 100%;
    max-width: 100vw;
  }
  
  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .reports-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }
}
</style>
