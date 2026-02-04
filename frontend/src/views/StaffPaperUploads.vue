<template>
  <div class="staff-layout">
    <StaffSidebar />
    
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
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'StaffPaperUploads',
  components: {
    StaffSidebar
  },
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
.staff-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 70px;
}

.page {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-header h2 {
  color: white;
  font-size: 1.5em;
  margin-bottom: 8px;
}

.page-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95em;
}

.upload-card,
.list-card {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

.list-card h3 {
  color: white;
  margin-bottom: 16px;
  font-size: 1.2em;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95em;
}

.field input[type="text"],
.field textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: inherit;
  font-size: 1em;
}

.field input[type="text"]:focus,
.field textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.08);
}

.field input[type="file"] {
  padding: 10px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.9em;
}

.file-name {
  color: #81C784;
  font-size: 0.85em;
}

.actions {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.alert {
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9em;
  text-align: center;
}

.alert.success {
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.alert.error {
  background: rgba(244, 67, 54, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.loading,
.empty {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95em;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-left: 4px solid #667eea;
}

.info {
  flex: 1;
  min-width: 0;
}

.info h4 {
  color: white;
  margin: 0 0 8px 0;
  font-size: 1em;
}

.info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0;
  font-size: 0.9em;
}

.info .meta {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8em;
}

.info a {
  color: #667eea;
  font-size: 0.9em;
  text-decoration: none;
  display: inline-block;
  margin-top: 8px;
}

.info a:active {
  color: #764ba2;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-approved {
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
}

.status-rejected {
  background: rgba(244, 67, 54, 0.2);
  color: #ff6b6b;
}
</style>
