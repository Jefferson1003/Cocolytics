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
  background:
    radial-gradient(circle at top left, rgba(102, 126, 234, 0.2), transparent 30%),
    radial-gradient(circle at right center, rgba(118, 75, 162, 0.16), transparent 28%),
    linear-gradient(135deg, #121428 0%, #1a1a2e 44%, #242442 100%);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px 12px 0 0;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: rgba(102, 126, 234, 0.72);
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
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid transparent;
}

.alert-success {
  background: rgba(17, 153, 142, 0.16);
  color: #93ffd0;
  border-color: rgba(17, 153, 142, 0.35);
}

.alert-error {
  background: rgba(250, 112, 154, 0.12);
  color: #ffb3d5;
  border-color: rgba(250, 112, 154, 0.32);
}

.profile-form {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.96) 0%, rgba(36, 36, 66, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.18);
  border-radius: 18px;
  padding: 40px;
  box-shadow: 0 18px 40px rgba(5, 8, 20, 0.28);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.82);
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 1.05em;
}

.form-control {
  width: 100%;
  padding: 13px 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  font-size: 1em;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.form-control:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.72);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.18);
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.36);
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.22) 0%, rgba(118, 75, 162, 0.26) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.12);
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
  background: rgba(255, 255, 255, 0.06);
  color: #dfe5ff;
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 12px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-upload:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.checkbox-group {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
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
  border-radius: 12px;
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
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.96) 0%, rgba(36, 36, 66, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.18);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 18px 40px rgba(5, 8, 20, 0.28);
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


.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9em;
}

.tab:hover {
  border-color: rgba(102, 126, 234, 0.5);
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
  color: rgba(255, 255, 255, 0.82);
  font-weight: 500;
  font-size: 0.95em;
}

.field input[type="text"],
.field textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-family: inherit;
  font-size: 1em;
}

.field input[type="text"]:focus,
.field textarea:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.72);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.18);
}

.field input[type="text"]::placeholder,
.field textarea::placeholder {
  color: rgba(255, 255, 255, 0.36);
}

.field input[type="file"] {
  padding: 10px;
  border: 1px dashed rgba(102, 126, 234, 0.4);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.9em;
}

.file-name {
  color: #93ffd0;
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
  background: rgba(17, 153, 142, 0.16);
  color: #93ffd0;
  border: 1px solid rgba(17, 153, 142, 0.35);
}

.alert.error {
  background: rgba(250, 112, 154, 0.12);
  color: #ffb3d5;
  border: 1px solid rgba(250, 112, 154, 0.32);
}

.loading,
.empty {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.95em;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid rgba(102, 126, 234, 0.55);
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
  background: rgba(102, 126, 234, 0.16);
  color: #dfe5ff;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.badge-transport {
  background: rgba(245, 87, 108, 0.16);
  color: #ffc0cc;
  border: 1px solid rgba(245, 87, 108, 0.3);
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
  color: rgba(255, 255, 255, 0.68);
  margin: 4px 0;
  font-size: 0.9em;
  line-height: 1.4;
}

.meta {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.52);
}

.file-link {
  color: #9aa8ff;
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
  background: rgba(255, 193, 7, 0.18);
  color: #ffc107;
}

.status-approved {
  background: rgba(17, 153, 142, 0.18);
  color: #93ffd0;
}

.status-rejected {
  background: rgba(250, 112, 154, 0.18);
  color: #ffb3d5;
}

.review-note {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 2px solid rgba(255, 255, 255, 0.18);
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.62);
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
