<template>
  <div class="staff-layout">
    <StaffSidebar />
    
    <div class="page">
    <div class="page-header">
      <h2>📄 Upload Papers for Approval</h2>
      <p>Submit separate documents for "To Cut" processing and "Transport" logistics.</p>
    </div>

    <div class="upload-grid">
      <!-- TO CUT SECTION -->
      <div class="upload-card">
        <div class="card-title">✂️ To Cut Papers</div>
        <div class="card-subtitle">Upload documents for cutting authorization</div>
        
        <div class="form-grid">
          <div class="field">
            <label>Document Title</label>
            <input v-model="toCutForm.title" type="text" placeholder="e.g., Cutting Order #123" />
          </div>
          <div class="field">
            <label>Description (optional)</label>
            <textarea v-model="toCutForm.description" rows="3" placeholder="Details about the cutting documents..."></textarea>
          </div>
          <div class="field">
            <label>Attach File (PDF, JPG, PNG)</label>
            <input type="file" @change="onToCutFileChange" accept=".pdf,image/jpeg,image/png" />
            <small v-if="toCutForm.fileName" class="file-name">✓ Selected: {{ toCutForm.fileName }}</small>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-to-cut" :disabled="uploadingToCut" @click="submitToCut">
            <span v-if="!uploadingToCut">🔼 Upload To Cut Paper</span>
            <span v-else>⏳ Uploading...</span>
          </button>
        </div>

        <div v-if="successMessageToCut" class="alert success">✓ {{ successMessageToCut }}</div>
        <div v-if="errorMessageToCut" class="alert error">✗ {{ errorMessageToCut }}</div>
      </div>

      <!-- TRANSPORT SECTION -->
      <div class="upload-card">
        <div class="card-title">🚚 Transport Papers</div>
        <div class="card-subtitle">Upload documents for transport logistics</div>
        
        <div class="form-grid">
          <div class="field">
            <label>Document Title</label>
            <input v-model="transportForm.title" type="text" placeholder="e.g., Transport Manifest #456" />
          </div>
          <div class="field">
            <label>Description (optional)</label>
            <textarea v-model="transportForm.description" rows="3" placeholder="Details about the transport documents..."></textarea>
          </div>
          <div class="field">
            <label>Attach File (PDF, JPG, PNG)</label>
            <input type="file" @change="onTransportFileChange" accept=".pdf,image/jpeg,image/png" />
            <small v-if="transportForm.fileName" class="file-name">✓ Selected: {{ transportForm.fileName }}</small>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-transport" :disabled="uploadingTransport" @click="submitTransport">
            <span v-if="!uploadingTransport">🚛 Upload Transport Paper</span>
            <span v-else>⏳ Uploading...</span>
          </button>
        </div>

        <div v-if="successMessageTransport" class="alert success">✓ {{ successMessageTransport }}</div>
        <div v-if="errorMessageTransport" class="alert error">✗ {{ errorMessageTransport }}</div>
      </div>
    </div>

    <!-- MY SUBMISSIONS LIST -->
    <div class="list-card">
      <h3>📋 My Paper Submissions</h3>
      
      <div class="filter-tabs">
        <button 
          v-for="filter in ['to_cut', 'transport']"
          :key="filter"
          @click="activeFilter = filter"
          :class="['tab', { active: activeFilter === filter }]"
        >
          <span v-if="filter === 'to_cut'">✂️ To Cut</span>
          <span v-else-if="filter === 'transport'">🚚 Transport</span>
        </button>
      </div>

      <div v-if="loading" class="loading">Loading submissions...</div>
      <div v-else-if="filteredPapers.length === 0" class="empty">No submissions found.</div>
      <div v-else class="list">
        <div v-for="paper in filteredPapers" :key="paper.id" class="list-item">
          <div class="paper-type">
            <span v-if="paper.paper_type === 'to_cut'" class="badge badge-to-cut">✂️ TO CUT</span>
            <span v-else-if="paper.paper_type === 'transport'" class="badge badge-transport">🚚 TRANSPORT</span>
          </div>
          <div class="info">
            <h4>{{ paper.title }}</h4>
            <p v-if="paper.description" class="description">{{ paper.description }}</p>
            <div class="meta">
              <span class="date">📅 {{ formatDate(paper.created_at) }}</span>
              <a :href="getFileUrl(paper.file_path)" target="_blank" rel="noopener" class="file-link">📎 View File</a>
            </div>
          </div>
          <div class="status-section">
            <span :class="['status', 'status-' + paper.status]">{{ formatStatus(paper.status) }}</span>
            <p v-if="paper.review_note" class="review-note">{{ paper.review_note }}</p>
          </div>
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
      toCutForm: {
        title: '',
        description: '',
        file: null,
        fileName: ''
      },
      transportForm: {
        title: '',
        description: '',
        file: null,
        fileName: ''
      },
      papers: [],
      activeFilter: 'to_cut',
      loading: false,
      uploadingToCut: false,
      uploadingTransport: false,
      successMessageToCut: '',
      errorMessageToCut: '',
      successMessageTransport: '',
      errorMessageTransport: ''
    }
  },
  computed: {
    filteredPapers() {
      return this.papers.filter(p => p.paper_type === this.activeFilter)
    }
  },
  mounted() {
    this.fetchMyPapers()
  },
  methods: {
    onToCutFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.toCutForm.file = file
        this.toCutForm.fileName = file.name
      }
    },
    onTransportFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.transportForm.file = file
        this.transportForm.fileName = file.name
      }
    },
    async fetchMyPapers() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${apiBaseUrl}/api/papers/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to load submissions')
        this.papers = await response.json()
        // Sort by created_at descending
        this.papers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    },
    async submitToCut() {
      return this.submitPaper(this.toCutForm, 'to_cut', 'uploadingToCut', 'successMessageToCut', 'errorMessageToCut')
    },
    async submitTransport() {
      return this.submitPaper(this.transportForm, 'transport', 'uploadingTransport', 'successMessageTransport', 'errorMessageTransport')
    },
    async submitPaper(form, paperType, loadingKey, successKey, errorKey) {
      this[successKey] = ''
      this[errorKey] = ''

      if (!form.title.trim()) {
        this[errorKey] = 'Title is required.'
        return
      }
      if (!form.file) {
        this[errorKey] = 'Please attach a file.'
        return
      }

      this[loadingKey] = true
      try {
        const token = localStorage.getItem('token')
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('description', form.description)
        formData.append('paper_type', paperType)
        formData.append('paper', form.file)

        const response = await fetch(`${apiBaseUrl}/api/papers`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Upload failed')

        this[successKey] = `${paperType === 'to_cut' ? 'To Cut' : 'Transport'} paper submitted for approval!`
        
        // Reset form
        form.title = ''
        form.description = ''
        form.file = null
        form.fileName = ''
        
        // Clear success message after 3 seconds
        setTimeout(() => this[successKey] = '', 3000)
        
        // Refresh papers list
        this.fetchMyPapers()
      } catch (error) {
        console.error('Error:', error)
        this[errorKey] = error.message || 'Upload failed. Please try again.'
      } finally {
        this[loadingKey] = false
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      return new Date(dateString).toLocaleDateString('en-US', options)
    },
    formatStatus(status) {
      const statusMap = {
        pending: '⏳ Pending',
        approved: '✅ Approved',
        rejected: '❌ Rejected'
      }
      return statusMap[status] || status
    },
    getFileUrl(path) {
      if (!path) return '#'
      if (path.startsWith('http')) return path
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
      return `${apiBaseUrl}${path}`
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

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.card-title {
  color: white;
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
  margin-bottom: 16px;
}

.list-card h3 {
  color: white;
  margin-bottom: 16px;
  font-size: 1.2em;
}

@media (max-width: 900px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9em;
}

.tab:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
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
  margin-top: 4px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.btn {
  padding: 14px 32px;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-to-cut {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-transport {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  margin-bottom: 12px;
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
  gap: 16px;
  border-left: 4px solid #667eea;
}

.paper-type {
  flex-shrink: 0;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75em;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-to-cut {
  background: rgba(102, 126, 234, 0.3);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.5);
}

.badge-transport {
  background: rgba(245, 87, 108, 0.3);
  color: #f5576c;
  border: 1px solid rgba(245, 87, 108, 0.5);
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

.description {
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0;
  font-size: 0.9em;
  line-height: 1.4;
}

.meta {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.5);
}

.file-link {
  color: #667eea;
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}

.status-section {
  text-align: right;
  flex-shrink: 0;
}

.status {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
  white-space: nowrap;
  margin-bottom: 8px;
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

.review-note {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .page {
    padding: 16px 12px;
  }

  .list-item {
    flex-direction: column;
    gap: 12px;
  }

  .status-section {
    text-align: left;
  }

  .meta {
    flex-wrap: wrap;
  }

  .field input[type="text"],
  .field textarea {
    font-size: 16px;
  }
}
</style>
