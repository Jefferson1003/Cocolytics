<template>
  <div class="page">
    <div class="page-header">
      <h2>📄 Upload Papers for Approval</h2>
      <p>Submit documents to be reviewed and approved by admin.</p>
    </div>

    <div class="upload-card">
      <div class="form-grid">
        <div class="field">
          <label>Document Title</label>
          <input v-model="title" type="text" placeholder="e.g., Delivery Receipt" />
        </div>
        <div class="field">
          <label>Description (optional)</label>
          <textarea v-model="description" rows="3" placeholder="Short note for the admin"></textarea>
        </div>
        <div class="field">
          <label>Attach File (PDF, JPG, PNG)</label>
          <input type="file" @change="onFileChange" accept=".pdf,image/jpeg,image/png" />
          <small v-if="fileName" class="file-name">Selected: {{ fileName }}</small>
        </div>
      </div>

      <div class="actions">
        <button class="btn" :disabled="uploading" @click="submit">
          <span v-if="!uploading">Upload for Approval</span>
          <span v-else>Uploading...</span>
        </button>
      </div>

      <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
    </div>

    <div class="list-card">
      <h3>🗂️ My Submissions</h3>
      <div v-if="loading" class="loading">Loading submissions...</div>
      <div v-else-if="papers.length === 0" class="empty">No submissions yet.</div>
      <div v-else class="list">
        <div v-for="paper in papers" :key="paper.id" class="list-item">
          <div class="info">
            <h4>{{ paper.title }}</h4>
            <p v-if="paper.description">{{ paper.description }}</p>
            <p class="meta">
              Submitted: {{ formatDate(paper.created_at) }}
            </p>
            <a :href="getFileUrl(paper.file_path)" target="_blank" rel="noopener">View File</a>
          </div>
          <span :class="['status', 'status-' + paper.status]">{{ paper.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaffPaperUploads',
  data() {
    return {
      title: '',
      description: '',
      file: null,
      fileName: '',
      papers: [],
      loading: false,
      uploading: false,
      successMessage: '',
      errorMessage: ''
    }
  },
  mounted() {
    this.fetchMyPapers()
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.file = file
        this.fileName = file.name
      }
    },
    async fetchMyPapers() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/papers/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to load submissions')
        this.papers = await response.json()
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.loading = false
      }
    },
    async submit() {
      this.successMessage = ''
      this.errorMessage = ''

      if (!this.title.trim()) {
        this.errorMessage = 'Title is required.'
        return
      }
      if (!this.file) {
        this.errorMessage = 'Please attach a file.'
        return
      }

      this.uploading = true
      try {
        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append('title', this.title)
        formData.append('description', this.description)
        formData.append('paper', this.file)

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/papers`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Upload failed')

        this.successMessage = 'Submitted for approval.'
        this.title = ''
        this.description = ''
        this.file = null
        this.fileName = ''
        this.fetchMyPapers()
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.uploading = false
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

.upload-card,
.list-card {
  background: #242442;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
  color: #fff;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  color: #bbb;
}

.field input,
.field textarea {
  width: 100%;
  background: #1a1a2e;
  color: #fff;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px 12px;
}

.file-name {
  display: inline-block;
  margin-top: 6px;
  color: #aaa;
}

.actions {
  margin-top: 16px;
}

.btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  align-items: center;
}

.list-item h4 {
  margin: 0 0 4px;
}

.meta {
  color: #aaa;
  font-size: 0.9em;
}

.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background: #f39c12;
  color: #fff;
}

.status-approved {
  background: #27ae60;
  color: #fff;
}

.status-rejected {
  background: #e74c3c;
  color: #fff;
}

.loading,
.empty {
  color: #aaa;
}
</style>
