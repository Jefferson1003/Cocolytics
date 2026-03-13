<template>
  <div class="client-page">
    <div class="topbar">
      <div>
        <h1>Client Dashboard</h1>
        <p>Welcome, {{ user?.name }}. Track your staff request here.</p>
      </div>
      <button class="logout-btn" @click="logout">Logout</button>
    </div>

    <div class="layout-grid">
      <section class="card app-status">
        <h2>Staff Application Status</h2>

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

            <label class="checkbox-row">
              <input type="checkbox" v-model="acceptChecked" />
              I accept and want to activate my staff account.
            </label>

            <button class="accept-btn" :disabled="!acceptChecked || accepting" @click="acceptInvitation">
              {{ accepting ? 'Activating...' : 'Accept and Activate Staff Account' }}
            </button>
          </div>
        </template>

        <p class="error" v-if="error">{{ error }}</p>
        <p class="success" v-if="successMessage">{{ successMessage }}</p>
      </section>

      <section class="card notifications">
        <h2>My Notifications</h2>
        <button class="refresh-btn" @click="fetchNotifications" :disabled="loadingNotifications">
          {{ loadingNotifications ? 'Refreshing...' : 'Refresh' }}
        </button>

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
      acceptChecked: false,
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
  background: radial-gradient(circle at 20% 10%, #1c3b56 0%, #102033 45%, #0a1524 100%);
  color: #e5f2f9;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.topbar h1 {
  margin: 0;
  color: #80d4ff;
}

.topbar p {
  margin: 6px 0 0;
  color: #bfd7e3;
}

.logout-btn {
  border: none;
  border-radius: 8px;
  background: #ff5f57;
  color: white;
  padding: 10px 14px;
  cursor: pointer;
}

.layout-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1.3fr 1fr;
}

.card {
  background: rgba(11, 23, 38, 0.86);
  border: 1px solid rgba(128, 212, 255, 0.2);
  border-radius: 14px;
  padding: 18px;
}

.status-line {
  margin: 12px 0;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.label {
  color: #b8ccda;
}

.badge {
  border-radius: 999px;
  padding: 4px 10px;
  text-transform: capitalize;
  font-size: 0.9rem;
}

.badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffd772;
}

.badge.approved {
  background: rgba(76, 175, 80, 0.2);
  color: #a9f3a0;
}

.badge.rejected {
  background: rgba(244, 67, 54, 0.2);
  color: #ffb3ad;
}

.meta p {
  margin: 5px 0;
}

.accept-box {
  margin-top: 14px;
  background: rgba(23, 49, 79, 0.7);
  border: 1px solid rgba(128, 212, 255, 0.25);
  border-radius: 10px;
  padding: 12px;
}

.accept-box h3 {
  margin: 0 0 8px;
  color: #80d4ff;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
}

.accept-btn {
  border: none;
  background: linear-gradient(135deg, #80d4ff 0%, #5db8ea 100%);
  color: #082339;
  border-radius: 8px;
  font-weight: 700;
  padding: 10px 12px;
  cursor: pointer;
}

.accept-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn {
  border: 1px solid rgba(128, 212, 255, 0.4);
  background: transparent;
  color: #d6ecf8;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
}

.notif-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 10px;
}

.notif-list li {
  border: 1px solid rgba(128, 212, 255, 0.2);
  border-radius: 9px;
  padding: 10px;
  background: rgba(16, 34, 54, 0.7);
}

.notif-list h4 {
  margin: 0 0 6px;
  color: #8ad7ff;
}

.notif-list p {
  margin: 0 0 6px;
  color: #d3e5ef;
}

.notif-list small {
  color: #a7becd;
}

.error,
.success,
.empty {
  margin-top: 12px;
}

.error {
  color: #ffb4af;
}

.success {
  color: #b9f8b0;
}

.empty a {
  color: #80d4ff;
}

@media (max-width: 920px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
