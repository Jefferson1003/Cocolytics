<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <p class="auth-eyebrow">Staff Portal</p>
        <h1>
          Staff Portal
        </h1>
        <h2>Welcome Back</h2>
        <p>Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-field">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              @click="togglePassword"
              class="toggle-password-btn"
              :title="showPassword ? 'Hide password' : 'Show password'"
            >
              <span v-if="showPassword" class="toggle-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M10.6 10.7A3 3 0 0 0 13.3 13.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c4.8 0 8.4 3.2 9.7 7-0.5 1.5-1.5 3-2.9 4.1M6.3 6.4C4.6 7.7 3.4 9.6 2.8 12c0.8 2.5 2.3 4.5 4.3 5.7A10.8 10.8 0 0 0 12 19c1 0 2-.1 2.9-.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span v-else class="toggle-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.8 12c1.2-3.8 4.9-7 9.7-7s8.4 3.2 9.7 7c-1.2 3.8-4.9 7-9.7 7s-8.5-3.2-9.7-7Z" stroke="currentColor" stroke-width="1.8"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div class="error-message" v-if="error">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-footer">
        <router-link to="/" class="btn-home-link">Back to Home</router-link>
        <p>Need access as staff? <router-link to="/apply-staff">Apply here</router-link></p>
        <p>Client/new applicant account? <router-link to="/client/login">Client login</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      loading: false,
      showPassword: false
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    async handleLogin() {
      this.error = ''
      this.loading = true

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await axios.post(`${apiBaseUrl}/api/auth/login`, {
          email: this.email,
          password: this.password
        })

        // Store the token and user data
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        const redirectTarget = this.$route.query.redirect

        // Redirect based on user role
        const role = response.data.user.role
        if (typeof redirectTarget === 'string' && redirectTarget.startsWith('/')) {
          this.$router.push(redirectTarget)
        } else if (role === 'admin') {
          this.$router.push('/admin')
        } else if (role === 'staff') {
          this.$router.push('/staff')
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          this.error = 'Only trader and admin accounts are allowed.'
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    radial-gradient(circle at top left, rgba(102, 126, 234, 0.2), transparent 30%),
    radial-gradient(circle at right center, rgba(118, 75, 162, 0.16), transparent 28%),
    linear-gradient(135deg, #121428 0%, #1a1a2e 44%, #242442 100%);
}

.auth-card {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border-radius: 16px;
  padding: 42px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(76, 175, 80, 0.2);
  backdrop-filter: blur(10px);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-eyebrow {
  margin: 0 0 8px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9aa8ff;
}

.auth-header h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
}

.auth-header h2 {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 650;
  color: #fff;
}

.auth-header p {
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.form-group label {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.92rem;
}

.form-group input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  border-radius: 12px;
  padding: 14px 15px;
}

.form-group input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.72);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.22);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.38);
}

.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-field input {
  flex: 1;
  padding-right: 45px;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  color: rgba(255, 255, 255, 0.6);
}

.toggle-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
}

.toggle-icon svg {
  width: 100%;
  height: 100%;
}

.toggle-password-btn:hover {
  opacity: 1;
  color: #9aa8ff;
}

.toggle-password-btn:active {
  transform: scale(0.95);
}

.error-message {
  border: 1px solid rgba(250, 112, 154, 0.35);
  color: #ffb3d5;
  background: rgba(250, 112, 154, 0.12);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
}

.btn-primary {
  border: none;
  border-radius: 8px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  transition: all 0.3s ease;
  width: 100%;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.social-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #888;
  font-size: 0.9rem;
}

.social-divider::before,
.social-divider::after {
  content: '';
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  flex: 1;
}

.social-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.btn-social {
  border: none;
  background: transparent;
  padding: 4px;
  cursor: not-allowed;
  transition: transform 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.btn-social:hover {
  transform: translateY(-1px);
}

.btn-social.google:hover,
.btn-social.facebook:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.auth-footer {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  text-align: center;
  color: rgba(255, 255, 255, 0.72);
}

.btn-home-link {
  display: inline-block;
  margin-bottom: 12px;
  padding: 10px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  color: #d3f7d6;
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid rgba(76, 175, 80, 0.35);
}

.btn-home-link:hover {
  background: rgba(76, 175, 80, 0.2);
}

.auth-footer p {
  margin: 8px 0;
}


@media (max-width: 600px) {
  .auth-card {
    padding: 28px;
  }
}
.auth-footer a {
  color: #81C784;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
