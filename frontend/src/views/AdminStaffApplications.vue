<template>
  <div class="admin-layout">
    <AdminSidebar />

    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Staff Applications</h1>
        <p>Review and process incoming requests to become staff.</p>
      </div>

      <div class="apps-section">
        <div class="section-header">
          <h2>Pending and Processed</h2>
          <button class="refresh-btn" @click="fetchApplications" :disabled="loading">
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        <p class="error" v-if="error">{{ error }}</p>
        <p class="success" v-if="successMessage">{{ successMessage }}</p>

        <div class="table-wrap" v-if="applications.length">
          <table class="apps-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Contact</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in applications" :key="app.id">
                <td>
                  <div class="primary">{{ app.name }}</div>
                  <div class="secondary">{{ app.email }}</div>
                </td>
                <td>{{ app.phone || 'N/A' }}</td>
                <td>
                  <div class="reason">{{ app.reason || 'No reason provided' }}</div>
                  <div v-if="app.review_note" class="review-note">Review note: {{ app.review_note }}</div>
                </td>
                <td>
                  <span class="status-badge" :class="app.status">{{ displayStatus(app) }}</span>
                </td>
                <td>{{ formatDate(app.created_at) }}</td>
                <td>
                  <div v-if="app.status === 'pending'" class="actions">
                    <textarea
                      v-model="reviewNotes[app.id]"
                      rows="2"
                      placeholder="Optional review note"
                    ></textarea>
                    <div class="action-buttons">
                      <button class="approve-btn" @click="approveApplication(app)">Approve</button>
                      <button class="reject-btn" @click="rejectApplication(app)">Reject</button>
                    </div>
                  </div>
                  <span v-else class="done-label">Reviewed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="empty">No staff applications yet.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import AdminSidebar from '../components/AdminSidebar.vue'

export default {
  name: 'AdminStaffApplications',
  components: {
    AdminSidebar
  },
  data() {
    return {
      applications: [],
      reviewNotes: {},
      loading: false,
      error: '',
      successMessage: ''
    }
  },
  created() {
    this.fetchApplications()
  },
  methods: {
    async fetchApplications() {
      this.loading = true
      this.error = ''
      try {
        const token = localStorage.getItem('token')
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await axios.get(`${apiBaseUrl}/api/admin/staff-applications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.applications = response.data.applications || []
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load staff applications'
      } finally {
        this.loading = false
      }
    },
    async approveApplication(app) {
      await this.processApplication(app, 'approve')
    },
    async rejectApplication(app) {
      await this.processApplication(app, 'reject')
    },
    async processApplication(app, action) {
      this.error = ''
      this.successMessage = ''

      try {
        const token = localStorage.getItem('token')
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const note = this.reviewNotes[app.id] || ''

        await axios.put(
          `${apiBaseUrl}/api/admin/staff-applications/${app.id}/${action}`,
          { note },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        this.successMessage = action === 'approve'
          ? `${app.name} is now a staff account.`
          : `${app.name}'s application has been rejected.`

        setTimeout(() => {
          this.successMessage = ''
        }, 2500)

        await this.fetchApplications()
      } catch (err) {
        this.error = err.response?.data?.message || `Failed to ${action} application`
      }
    },
    displayStatus(app) {
      if (app.status === 'approved' && !app.applicant_accepted) {
        return 'approved - waiting acceptance'
      }
      if (app.status === 'approved' && app.applicant_accepted) {
        return 'accepted'
      }
      return app.status
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
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
}

.dashboard-container {
  flex: 1;
  margin-left: 280px;
  padding: 36px 44px;
}

.dashboard-header h1 {
  margin: 0;
  color: #79d06f;
  font-size: 2.2rem;
}

.dashboard-header p {
  color: #c2d4d9;
  margin-top: 8px;
}

.apps-section {
  margin-top: 22px;
  background: rgba(14, 26, 49, 0.82);
  border: 1px solid rgba(121, 208, 111, 0.22);
  border-radius: 14px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  color: #79d06f;
  margin: 0;
}

.refresh-btn {
  border: 1px solid rgba(121, 208, 111, 0.45);
  background: transparent;
  color: #d9ffe1;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error,
.success {
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.error {
  background: rgba(229, 57, 53, 0.15);
  border: 1px solid rgba(229, 57, 53, 0.45);
  color: #ffbdbd;
}

.success {
  background: rgba(121, 208, 111, 0.15);
  border: 1px solid rgba(121, 208, 111, 0.45);
  color: #d7ffd1;
}

.table-wrap {
  overflow-x: auto;
}

.apps-table {
  width: 100%;
  border-collapse: collapse;
}

.apps-table th,
.apps-table td {
  border-bottom: 1px solid rgba(121, 208, 111, 0.12);
  padding: 12px;
  vertical-align: top;
  color: #deebef;
}

.apps-table th {
  text-align: left;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #95d88d;
}

.primary {
  font-weight: 600;
}

.secondary {
  font-size: 0.86rem;
  color: #9bb0bd;
}

.reason {
  max-width: 320px;
  white-space: pre-wrap;
}

.review-note {
  margin-top: 6px;
  color: #b7c7d2;
  font-size: 0.85rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffd46f;
}

.status-badge.approved {
  background: rgba(76, 175, 80, 0.2);
  color: #a0ef96;
}

.status-badge.rejected {
  background: rgba(244, 67, 54, 0.2);
  color: #ffb8b3;
}

.actions {
  min-width: 210px;
}

.actions textarea {
  width: 100%;
  resize: vertical;
  background: rgba(8, 18, 34, 0.9);
  border: 1px solid rgba(121, 208, 111, 0.25);
  border-radius: 8px;
  color: #e6f5f8;
  padding: 8px;
  margin-bottom: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.approve-btn,
.reject-btn {
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-weight: 600;
}

.approve-btn {
  background: #4caf50;
  color: white;
}

.reject-btn {
  background: #e53935;
  color: white;
}

.done-label {
  color: #9db2bf;
  font-size: 0.9rem;
}

.empty {
  color: #b6c9d3;
  padding: 8px 2px;
}

@media (max-width: 900px) {
  .dashboard-container {
    margin-left: 0;
    padding: 92px 16px 24px;
  }
}
</style>