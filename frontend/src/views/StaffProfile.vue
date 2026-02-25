<template>
  <div class="staff-layout">
    <StaffSidebar />
    
    <div class="main-content">
      <div class="profile-container">
        <h1>🏪 {{ staffName }} - {{ profile.store_name || 'My Store' }}</h1>
        
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
      token: null
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (userData) {
      this.user = JSON.parse(userData)
    }
    this.fetchProfile()
  },
  methods: {
    async fetchProfile() {
      this.loading = true
      this.errorMessage = ''
      
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
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

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      if (imagePath.startsWith('/')) return `${apiBaseUrl}${imagePath}`
      return `${apiBaseUrl}/uploads/${imagePath}`
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
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-container h1 {
  color: white;
  font-size: 2.5em;
  font-weight: 700;
  margin-bottom: 30px;
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
}
</style>
