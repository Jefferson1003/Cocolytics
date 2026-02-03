<template>
  <div class="page">
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
</template>

<script>
export default {
  name: 'AdminPaperApprovals',
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
.page {
  padding: 30px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header h2 {
  margin: 0 0 8px;
  color: #333;
}

.page-header p {
  margin: 0 0 20px;
  color: #666;
}

.list-card {
  background: #242442;
  border-radius: 14px;
  padding: 24px;
  color: #fff;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  background: #1a1a2e;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.info h4 {
  margin: 0 0 4px;
}

.meta {
  color: #aaa;
  font-size: 0.9em;
}

.note {
  width: 100%;
  margin-top: 8px;
  background: #242442;
  color: #fff;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn {
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.btn.approve {
  background: #27ae60;
}

.btn.reject {
  background: #e74c3c;
}

.alert {
  margin-top: 16px;
  padding: 10px 12px;
  border-radius: 8px;
  font-weight: 600;
}

.alert.success {
  background: #2ecc71;
  color: #1b5e20;
}

.alert.error {
  background: #e74c3c;
  color: #fff;
}

.loading,
.empty {
  color: #aaa;
}
</style>
