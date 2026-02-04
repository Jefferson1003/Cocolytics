<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="dashboard-container">
      <div class="page-header">
        <h2>📄 Paper Approvals</h2>
        <p>Review and approve uploaded documents.</p>
      </div>

      <div class="list-card">
      <div v-if="loading" class="loading">Loading pending papers...</div>
      <div v-else-if="pendingPapers.length === 0" class="empty">No pending submissions.</div>
      <div v-else class="list">
        <div v-for="paper in pendingPapers" :key="paper.id" class="list-item">
          <div class="info">
            <h4>{{ paper.title }}</h4>
            <p v-if="paper.description">{{ paper.description }}</p>
            <p class="meta">
              Submitted by {{ paper.uploader_name }} ({{ paper.uploader_email }})
              • {{ formatDate(paper.created_at) }}
            </p>
            <a :href="getFileUrl(paper.file_path)" target="_blank" rel="noopener">View File</a>
            <textarea
              v-model="reviewNotes[paper.id]"
              rows="2"
              placeholder="Optional review note"
              class="note"
            ></textarea>
          </div>
          <div class="actions">
            <button class="btn approve" :disabled="actionLoading[paper.id]" @click="approve(paper.id)">Approve</button>
            <button class="btn reject" :disabled="actionLoading[paper.id]" @click="reject(paper.id)">Reject</button>
          </div>
        </div>
      </div>
      <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
    </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '../components/AdminSidebar.vue'

export default {
  name: 'AdminPaperApprovals',
  components: {
    AdminSidebar
  },
  data() {
    return {
      pendingPapers: [],
      loading: false,
      actionLoading: {},
      reviewNotes: {},
      errorMessage: '',
      successMessage: ''
    }
  },
  mounted() {
    this.fetchPending()
  },
  methods: {
    async fetchPending() {
      this.loading = true
      this.errorMessage = ''
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/papers/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to load pending papers')
        this.pendingPapers = await response.json()
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.loading = false
      }
    },
    async approve(id) {
      await this.updateStatus(id, 'approve')
    },
    async reject(id) {
      await this.updateStatus(id, 'reject')
    },
    async updateStatus(id, action) {
      this.successMessage = ''
      this.errorMessage = ''
      this.actionLoading = { ...this.actionLoading, [id]: true }
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/papers/${id}/${action}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reviewNote: this.reviewNotes[id] || '' })
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Action failed')

        this.successMessage = `Paper ${action}d successfully.`
        this.pendingPapers = this.pendingPapers.filter(p => p.id !== id)
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.actionLoading = { ...this.actionLoading, [id]: false }
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      return new Date(dateString).toLocaleDateString('en-US', options)
    },
    getFileUrl(path) {
      if (!path) return '#'
      if (path.startsWith('http')) return path
      return `${import.meta.env.VITE_API_BASE_URL}${path}`
    }
  }
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
  padding: 30px 40px;
  overflow: hidden;
  transition: margin-left 0.3s ease;
  width: calc(100% - 280px);
  max-width: calc(100vw - 280px);
  height: 100vh;
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

.page-header {
  flex-shrink: 0;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 2rem;
  color: #4CAF50;
  margin: 0 0 8px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.page-header p {
  margin: 0 0 20px;
  color: #bbb;
  font-size: 1.05rem;
}

.list-card {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 28px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.list-card::-webkit-scrollbar {
  width: 8px;
}

.list-card::-webkit-scrollbar-track {
  background: rgba(30, 30, 63, 0.3);
  border-radius: 4px;
}

.list-card::-webkit-scrollbar-thumb {
  background: rgba(76, 175, 80, 0.4);
  border-radius: 4px;
}

.list-card::-webkit-scrollbar-thumb:hover {
  background: rgba(76, 175, 80, 0.6);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}

.list-item {
  background: rgba(30, 30, 63, 0.5);
  border: 1px solid rgba(76, 175, 80, 0.15);
  border-radius: 12px;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 20px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.3);
}

.info {
  flex: 1;
  min-width: 0;
}

.info h4 {
  margin: 0 0 8px;
  font-size: 1.3em;
  color: #4CAF50;
  font-weight: 600;
}

.info p {
  font-size: 1.05em;
  line-height: 1.6;
}

.meta {
  color: #999;
  font-size: 0.95em;
  margin-top: 8px;
}

.info a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  margin-top: 12px;
  padding: 8px 16px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.info a:hover {
  background: rgba(76, 175, 80, 0.2);
  transform: translateX(4px);
}

.note {
  width: 100%;
  margin-top: 12px;
  background: rgba(30, 30, 63, 0.7);
  color: #fff;
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 8px;
  padding: 12px;
  font-size: 1em;
  font-family: inherit;
  transition: all 0.3s ease;
}

.note:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 140px;
  flex-shrink: 0;
}

.btn {
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.approve {
  background: linear-gradient(135deg, #27ae60 0%, #219150 100%);
}

.btn.approve:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
}

.btn.reject {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.btn.reject:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
}

.alert {
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.05em;
}

.alert.success {
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid #2ecc71;
  color: #2ecc71;
}

.alert.error {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  color: #ff6b6b;
}

.loading,
.empty {
  color: #999;
  text-align: center;
  padding: 40px;
  font-size: 1.1em;
}
</style>
