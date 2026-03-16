<template>
  <div class="client-page">
    <header class="client-topbar">
      <div class="topbar-brand">
        <span class="brand-mark">🌴</span>
        <span class="brand-name">Cocolytics</span>
      </div>
      <button class="logout-btn" @click="logout">Logout</button>
    </header>

    <section class="dashboard-hero">
      <div>
        <p class="hero-eyebrow">Client Portal</p>
        <h1>Client Dashboard</h1>
        <p class="hero-copy">Welcome, {{ user?.name }}. Track your staff request, review updates, and respond when your application is approved.</p>
      </div>

      <div class="hero-summary">
        <div class="summary-item">
          <span class="summary-label">Application</span>
          <strong>{{ application ? displayStatus : 'No request yet' }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">Notifications</span>
          <strong>{{ notifications.length }}</strong>
        </div>
      </div>
    </section>

    <div class="layout-grid">
      <section class="card app-status">
        <div class="section-head">
          <div>
            <p class="section-kicker">Status</p>
            <h2>Staff Application Status</h2>
          </div>
        </div>

        <p v-if="loadingStatus">Loading application status...</p>
        <p v-else-if="!application" class="empty">
          No staff application found yet. <router-link to="/apply-staff">Apply now</router-link>.
        </p>

        <template v-else>
          <div class="status-line">
            <span class="label">Current status:</span>
            <span class="badge" :class="application.status">{{ displayStatus }}</span>
          </div>

          <div class="meta">
            <p><strong>Submitted:</strong> {{ formatDate(application.created_at) }}</p>
            <p v-if="application.reviewed_at"><strong>Reviewed:</strong> {{ formatDate(application.reviewed_at) }}</p>
            <p v-if="application.review_note"><strong>Admin note:</strong> {{ application.review_note }}</p>
          </div>

          <div v-if="canAcceptOffer" class="accept-box">
            <h3>Staff Invitation</h3>
            <p>Your application is approved. Accept the invitation to activate your staff account.</p>

            <p class="accept-note">Click the button below to confirm and activate your staff access.</p>

            <button class="accept-btn" :disabled="accepting" @click="acceptInvitation">
              {{ accepting ? 'Activating...' : 'Accept and Activate Staff Account' }}
            </button>
          </div>
        </template>

        <p class="error" v-if="error">{{ error }}</p>
        <p class="success" v-if="successMessage">{{ successMessage }}</p>
      </section>

      <section class="card notifications">
        <div class="section-head notifications-head">
          <div>
            <p class="section-kicker">Inbox</p>
            <h2>My Notifications</h2>
          </div>
          <button class="refresh-btn" @click="fetchNotifications" :disabled="loadingNotifications">
            {{ loadingNotifications ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        <p v-if="loadingNotifications">Loading notifications...</p>
        <ul v-else-if="notifications.length" class="notif-list">
          <li v-for="n in notifications" :key="n.id">
            <h4>{{ n.title }}</h4>
            <p>{{ n.message }}</p>
            <small>{{ formatDate(n.created_at) }}</small>
          </li>
        </ul>
        <p v-else class="empty">No notifications yet.</p>
      </section>
    </div>

    <div v-if="showAcceptModal" class="modal-overlay" @click="cancelAcceptInvitation">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Confirm Staff Activation</h2>
          <button class="modal-close" @click="cancelAcceptInvitation">&times;</button>
        </div>
        <div class="modal-body">
          <p>Your request was approved by the admin.</p>
          <p>Do you want to accept the invitation and activate your staff account now?</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-secondary" @click="cancelAcceptInvitation">Cancel</button>
          <button class="modal-btn modal-btn-primary" :disabled="accepting" @click="confirmAcceptInvitation">
            {{ accepting ? 'Activating...' : 'Accept Invitation' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ClientDashboard',
  data() {
    return {
      user: null,
      application: null,
      notifications: [],
      loadingStatus: false,
      loadingNotifications: false,
      showAcceptModal: false,
      accepting: false,
      error: '',
      successMessage: ''
    }
  },
  computed: {
    canAcceptOffer() {
      return this.application && this.application.status === 'approved' && !this.application.applicant_accepted
    },
    displayStatus() {
      if (!this.application) return 'N/A'
      if (this.application.status === 'approved' && !this.application.applicant_accepted) {
        return 'approved - waiting your acceptance'
      }
      if (this.application.status === 'approved' && this.application.applicant_accepted) {
        return 'accepted'
      }
      return this.application.status
    }
  },
  created() {
    const userData = localStorage.getItem('user')
    this.user = userData ? JSON.parse(userData) : null
    this.fetchStatus()
    this.fetchNotifications()
  },
  methods: {
    apiHeaders() {
      const token = localStorage.getItem('token')
      return { Authorization: `Bearer ${token}` }
    },
    async fetchStatus() {
      this.loadingStatus = true
      this.error = ''
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await axios.get(`${apiBaseUrl}/api/client/staff-application`, {
          headers: this.apiHeaders()
        })
        this.application = response.data.application
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load application status'
      } finally {
        this.loadingStatus = false
      }
    },
    async fetchNotifications() {
      this.loadingNotifications = true
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await axios.get(`${apiBaseUrl}/api/notifications?limit=8&offset=0`, {
          headers: this.apiHeaders()
        })
        this.notifications = response.data?.data || []
      } catch {
        this.notifications = []
      } finally {
        this.loadingNotifications = false
      }
    },
    async acceptInvitation() {
      if (!this.application) return

      this.showAcceptModal = true
    },

    cancelAcceptInvitation() {
      if (this.accepting) return
      this.showAcceptModal = false
    },

    async confirmAcceptInvitation() {
      if (!this.application) return

      this.accepting = true
      this.error = ''
      this.successMessage = ''

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await axios.put(
          `${apiBaseUrl}/api/client/staff-application/${this.application.id}/accept`,
          {},
          { headers: this.apiHeaders() }
        )

        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        this.successMessage = 'Staff account activated. Redirecting to staff dashboard...'
        this.showAcceptModal = false
        setTimeout(() => {
          this.$router.push('/staff')
        }, 1200)
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to accept invitation'
      } finally {
        this.accepting = false
      }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/client/login')
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.client-page {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(102, 126, 234, 0.2), transparent 30%),
    radial-gradient(circle at right center, rgba(118, 75, 162, 0.16), transparent 28%),
    linear-gradient(135deg, #121428 0%, #1a1a2e 44%, #242442 100%);
  color: #e9eefc;
}

.client-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  padding: 14px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.96) 0%, rgba(36, 36, 66, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.18);
  box-shadow: 0 18px 40px rgba(5, 8, 20, 0.28);
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.22) 0%, rgba(118, 75, 162, 0.26) 100%);
}

.brand-name {
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.dashboard-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 20px;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.96) 0%, rgba(36, 36, 66, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.18);
  box-shadow: 0 18px 40px rgba(5, 8, 20, 0.28);
}

.hero-eyebrow {
  margin: 0 0 8px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9aa8ff;
}

.dashboard-hero h1 {
  margin: 0;
  color: #ffffff;
  font-size: 2rem;
}

.hero-copy {
  margin: 10px 0 0;
  max-width: 760px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.6;
}

.hero-summary {
  min-width: 220px;
  display: grid;
  gap: 12px;
}

.summary-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.summary-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.58);
}

.summary-item strong {
  color: #fff;
  text-transform: capitalize;
}

.logout-btn {
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #2c1725;
  font-weight: 700;
  color: white;
  padding: 10px 16px;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(250, 112, 154, 0.22);
}

.layout-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: 1.3fr 1fr;
}

.card {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.96) 0%, rgba(36, 36, 66, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.18);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 18px 40px rgba(5, 8, 20, 0.28);
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-kicker {
  margin: 0 0 6px;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9aa8ff;
}

.section-head h2 {
  margin: 0;
  color: #fff;
}

.status-line {
  margin: 12px 0;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.label {
  color: rgba(255, 255, 255, 0.62);
}

.badge {
  border-radius: 999px;
  padding: 6px 12px;
  text-transform: capitalize;
  font-size: 0.86rem;
  font-weight: 700;
}

.badge.pending {
  background: rgba(255, 193, 7, 0.18);
  color: #ffd772;
}

.badge.approved {
  background: rgba(17, 153, 142, 0.22);
  color: #93ffd0;
}

.badge.rejected {
  background: rgba(250, 112, 154, 0.18);
  color: #ffb3d5;
}

.meta p {
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.76);
}

.accept-box {
  margin-top: 14px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.14) 0%, rgba(118, 75, 162, 0.16) 100%);
  border: 1px solid rgba(102, 126, 234, 0.24);
  border-radius: 14px;
  padding: 14px;
}

.accept-box h3 {
  margin: 0 0 8px;
  color: #fff;
}

.accept-box p {
  color: rgba(255, 255, 255, 0.76);
}

.accept-note {
  margin: 10px 0 14px;
  color: rgba(255, 255, 255, 0.72);
}

.accept-btn {
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  padding: 11px 14px;
  cursor: pointer;
}

.accept-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: #e9eefc;
  border-radius: 12px;
  padding: 9px 12px;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.notif-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 10px;
}

.notif-list li {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
}

.notif-list h4 {
  margin: 0 0 6px;
  color: #fff;
}

.notif-list p {
  margin: 0 0 6px;
  color: rgba(255, 255, 255, 0.76);
}

.notif-list small {
  color: rgba(255, 255, 255, 0.52);
}

.error,
.success,
.empty {
  margin-top: 12px;
}

.error {
  color: #ffb3d5;
}

.success {
  color: #93ffd0;
}

.empty {
  color: rgba(255, 255, 255, 0.72);
}

.empty a {
  color: #9aa8ff;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 8, 20, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1200;
}

.modal-content {
  width: 100%;
  max-width: 460px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(36, 36, 66, 1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.18);
  box-shadow: 0 22px 50px rgba(5, 8, 20, 0.42);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.15rem;
}

.modal-close {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.6;
}

.modal-body p {
  margin: 0 0 10px;
}

.modal-footer {
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}

.modal-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 920px) {
  .dashboard-hero,
  .section-head,
  .notifications-head,
  .client-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-summary {
    min-width: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .layout-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .client-page {
    padding: 16px;
  }

  .dashboard-hero,
  .card,
  .client-topbar {
    padding: 16px;
  }

  .hero-summary {
    grid-template-columns: 1fr;
  }
}
</style>
