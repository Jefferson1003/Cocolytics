<template>
  <div class="staff-layout">
    <StaffSidebar />
    
    <div class="main-content">
      <div class="profile-container">
        <h1>🏪 {{ staffName }} - {{ profile.store_name || 'My Store' }}</h1>
        
        <!-- Tab Navigation -->
        <div class="tabs-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="['tab-btn', { active: activeTab === tab.value }]"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="tab-content">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading profile...</p>
          </div>

          <template v-else>
            <div v-if="successMessage" class="alert alert-success">
              <span class="alert-icon">✓</span>
              {{ successMessage }}
            </div>

            <div v-if="errorMessage" class="alert alert-error">
              <span class="alert-icon">✗</span>
              {{ errorMessage }}
            </div>

            <form @submit.prevent="updateProfile" class="profile-form">
          <!-- Trader Logo Upload -->
          <div class="form-group logo-upload">
            <label>Trader Logo</label>
            <div class="logo-preview">
              <img v-if="previewLogo" :src="previewLogo" alt="Trader Logo" />
              <div v-else class="default-logo">🥥</div>
            </div>
            <input 
              type="file" 
              ref="logoInput"
              @change="onLogoChange" 
              accept="image/*"
              class="file-input"
            />
            <button type="button" @click="$refs.logoInput.click()" class="btn-upload">
              📷 Choose Logo
            </button>
          </div>

          <!-- Trader Name -->
          <div class="form-group">
            <label>Trader Name *</label>
            <input 
              v-model="profile.store_name" 
              type="text" 
              placeholder="Enter your trader name"
              required
              class="form-control"
            />
          </div>

          <!-- Trader Description -->
          <div class="form-group">
            <label>Trader Description</label>
            <textarea
              v-model="profile.store_description"
              placeholder="Describe your business and products..."
              rows="4"
              class="form-control"
            ></textarea>
          </div>

          <!-- Contact Number -->
          <div class="form-group">
            <label>Contact Number</label>
            <input 
              v-model="profile.contact_number" 
              type="tel" 
              placeholder="+63 XXX XXX XXXX"
              class="form-control"
            />
          </div>

          <!-- Business Address -->
          <div class="form-group">
            <label>Business Address</label>
            <input 
              v-model="profile.store_address" 
              type="text" 
              placeholder="Physical business address (optional)"
              class="form-control"
            />
          </div>

          <!-- Is Active Toggle -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                v-model="profile.is_active" 
                type="checkbox"
              />
              <span>🟢 Trader is active (visible to customers)</span>
            </label>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="submit" class="btn-submit" :disabled="saving">
              <span v-if="!saving">💾 Save Profile</span>
              <span v-else>⏳ Saving...</span>
            </button>
          </div>
        </form>
            </template>
        </div>

        <!-- Documents Tab -->
        <div v-if="activeTab === 'documents'" class="tab-content">
          <div v-if="docsLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading documents...</p>
          </div>

          <template v-else>
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
                  @click="docsFilter = filter"
                  :class="['tab', { active: docsFilter === filter }]"
                >
                  <span v-if="filter === 'to_cut'">✂️ To Cut</span>
                  <span v-else-if="filter === 'transport'">🚚 Transport</span>
                </button>
              </div>

              <div v-if="docsLoading" class="loading">Loading submissions...</div>
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
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'StaffProfile',
  components: {
    StaffSidebar
  },
  data() {
    return {
      activeTab: 'profile',
      tabs: [
        { label: 'Profile', value: 'profile', icon: '👤' },
        { label: 'Documents', value: 'documents', icon: '📄' }
      ],
      // Profile tab data
      profile: {
        store_name: '',
        store_description: '',
        store_logo: '',
        contact_number: '',
        store_address: '',
        is_active: true
      },
      user: null,
      staffName: '',
      previewLogo: '',
      logoFile: null,
      successMessage: '',
      errorMessage: '',
      saving: false,
      loading: true,
      token: null,
      // Documents tab data
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
      docsFilter: 'to_cut',
      docsLoading: false,
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
      return this.papers.filter(p => p.paper_type === this.docsFilter)
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (userData) {
      this.user = JSON.parse(userData)
    }
    this.fetchProfile()
    this.fetchMyPapers()
  },
  methods: {
    // Profile methods
    async fetchProfile() {
      this.loading = true
      this.errorMessage = ''
      
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${apiBaseUrl}/api/staff/profile`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        this.profile = { ...this.profile, ...data }
        this.staffName = data.staff_name || this.user?.name || 'Staff'
        if (data.store_logo) {
          this.previewLogo = this.getImageUrl(data.store_logo)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        this.errorMessage = `Failed to load profile: ${error.message}`
      } finally {
        this.loading = false
      }
    },
    onLogoChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.logoFile = file
        const reader = new FileReader()
        reader.onload = (e) => {
          this.previewLogo = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    async updateProfile() {
      this.saving = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const formData = new FormData()
        formData.append('store_name', this.profile.store_name)
        formData.append('store_description', this.profile.store_description || '')
        formData.append('contact_number', this.profile.contact_number || '')
        formData.append('store_address', this.profile.store_address || '')
        formData.append('is_active', this.profile.is_active ? '1' : '0')
        
        if (this.logoFile) {
          formData.append('store_logo', this.logoFile)
        }

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${apiBaseUrl}/api/staff/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || `Error: ${response.status} ${response.statusText}`)
        }

        this.successMessage = '✓ Profile updated successfully!'
        setTimeout(() => this.successMessage = '', 3000)
        
        // Refresh profile data
        await this.fetchProfile()
        this.logoFile = null
      } catch (error) {
        console.error('Error updating profile:', error)
        this.errorMessage = `Failed to update profile: ${error.message}`
        setTimeout(() => this.errorMessage = '', 5000)
      } finally {
        this.saving = false
      }
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      if (imagePath.startsWith('http')) return imagePath
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
      if (imagePath.startsWith('/')) return `${apiBaseUrl}${imagePath}`
      return `${apiBaseUrl}/uploads/${imagePath}`
    },
    // Documents methods
    async fetchMyPapers() {
      this.docsLoading = true
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${apiBaseUrl}/api/papers/mine`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed to load submissions')
        this.papers = await response.json()
        this.papers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.docsLoading = false
      }
    },
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
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('description', form.description)
        formData.append('paper_type', paperType)
        formData.append('paper', form.file)

        const response = await fetch(`${apiBaseUrl}/api/papers`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` },
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
        
        setTimeout(() => this[successKey] = '', 3000)
        this.fetchMyPapers()
      } catch (error) {
        console.error('Error:', error)
        this[errorKey] = error.message || 'Upload failed. Please try again.'
      } finally {
        this[loadingKey] = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return '—'
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
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  flex: 1;
  padding: 40px;
  margin-left: 250px;
  max-height: 100vh;
  overflow-y: auto;
}

.profile-container {
  max-width: 900px;
  margin: 0 auto;
}

.profile-container h1 {
  color: white;
  font-size: 2.5em;
  font-weight: 700;
  margin-bottom: 20px;
}

/* Tab Navigation */
.tabs-header {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.tab-btn.active {
  background: white;
  color: #667eea;
  border-bottom-color: white;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.alert {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
}

.profile-form {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 1.05em;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.logo-upload {
  text-align: center;
  margin-bottom: 30px;
}

.logo-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo {
  font-size: 4em;
  color: white;
}

.file-input {
  display: none;
}

.btn-upload {
  padding: 12px 30px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-upload:hover {
  background: #667eea;
  color: white;
}

.checkbox-group {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.btn-submit {
  padding: 16px 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.15em;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(102, 126, 234, 0.5);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: white;
  font-size: 1.1em;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Documents Tab Styles */
.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.upload-card,
.list-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card-title {
  color: #333;
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-subtitle {
  color: #777;
  font-size: 0.9em;
  margin-bottom: 16px;
}

.list-card h3 {
  color: #333;
  margin-bottom: 16px;
  font-size: 1.2em;
}


.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: #f5f5f5;
  color: #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9em;
}

.tab:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
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
  color: #333;
  font-weight: 500;
  font-size: 0.95em;
}

.field input[type="text"],
.field textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
  color: #333;
  font-family: inherit;
  font-size: 1em;
}

.field input[type="text"]:focus,
.field textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.field input[type="file"] {
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  background: #f9f9f9;
  color: #333;
  font-size: 0.9em;
}

.file-name {
  color: #4CAF50;
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

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.loading,
.empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 0.95em;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  background: #f9f9f9;
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
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.badge-transport {
  background: rgba(245, 87, 108, 0.2);
  color: #f5576c;
  border: 1px solid rgba(245, 87, 108, 0.3);
}

.info {
  flex: 1;
  min-width: 0;
}

.info h4 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 1em;
}

.description {
  color: #666;
  margin: 4px 0;
  font-size: 0.9em;
  line-height: 1.4;
}

.meta {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 0.85em;
  color: #999;
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
  color: #4CAF50;
}

.status-rejected {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.review-note {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-left: 2px solid #ccc;
  font-size: 0.8em;
  color: #666;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 20px;
  }

  .profile-container h1 {
    font-size: 2em;
  }

  .profile-form {
    padding: 25px;
  }

  .upload-grid {
    grid-template-columns: 1fr;
  }

  .list-item {
    flex-direction: column;
    gap: 12px;
  }

  .status-section {
    text-align: left;
  }

  .tabs-header {
    gap: 5px;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 0.9em;
  }

  .field input[type="text"],
  .field textarea {
    font-size: 16px;
  }
}
</style>
