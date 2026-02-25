<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>🌴 Cocolytics</h1>
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
              {{ showPassword ? '☑' : '☐' }}
            </button>
          </div>
        </div>

        <div class="error-message" v-if="error">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="social-divider">
          <span>or sign in with</span>
        </div>

        <div class="social-buttons">
          <button type="button" class="btn-social google" aria-label="Sign in with Google" disabled>
            <svg class="social-icon" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.24 0 6.16 1.19 8.45 3.52l6.28-6.28C34.82 3.12 29.86 1 24 1 14.62 1 6.5 6.38 2.62 14.56l7.34 5.7C11.64 13.74 17.37 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.5 24.5c0-1.62-.15-3.18-.44-4.69H24v9.38h12.64c-.55 2.98-2.22 5.5-4.74 7.19l7.28 5.62C42.94 38.78 46.5 32.17 46.5 24.5z"/>
              <path fill="#FBBC05" d="M9.96 28.26A14.5 14.5 0 0 1 9.5 24c0-1.49.26-2.93.46-4.26l-7.34-5.7A23.91 23.91 0 0 0 1 24c0 3.86.93 7.5 2.62 10.74l7.34-5.48z"/>
              <path fill="#4285F4" d="M24 47c5.86 0 10.82-1.94 14.44-5.28l-7.28-5.62c-2.02 1.35-4.62 2.14-7.16 2.14-6.63 0-12.36-4.24-14.04-10.5l-7.34 5.48C6.5 41.62 14.62 47 24 47z"/>
            </svg>
          </button>
          <button type="button" class="btn-social facebook" aria-label="Sign in with Facebook" disabled>
            <svg class="social-icon" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#1877F2" d="M24 1C11.3 1 1 11.3 1 24c0 11.4 8.3 20.9 19.1 22.7V30.1h-5v-6.1h5v-4.6c0-5 3-7.8 7.6-7.8 2.2 0 4.5.4 4.5.4v4.9h-2.5c-2.5 0-3.2 1.5-3.2 3.1v4h5.4l-.9 6.1h-4.5v16.6C38.7 44.9 47 35.4 47 24 47 11.3 36.7 1 24 1z"/>
              <path fill="#FFFFFF" d="M31.1 30.1l.9-6.1h-5.4v-4c0-1.6.8-3.1 3.2-3.1h2.5V12s-2.3-.4-4.5-.4c-4.6 0-7.6 2.8-7.6 7.8v4.6h-5v6.1h5v16.6c1.3.2 2.6.3 3.9.3s2.6-.1 3.9-.3V30.1h4.5z"/>
            </svg>
          </button>
        </div>
      </form>

      <div class="auth-footer">
        <p>Don't have an account? <router-link to="/register">Sign up</router-link></p>
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
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
          email: this.email,
          password: this.password
        })

        // Store the token and user data
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        // Redirect based on user role
        const role = response.data.user.role
        if (role === 'admin') {
          this.$router.push('/admin')
        } else if (role === 'staff') {
          this.$router.push('/staff')
        } else {
          this.$router.push('/')
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.auth-card {
  background: #242442;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #4CAF50;
}

.auth-header h2 {
  font-size: 1.5rem;
  margin-bottom: 5px;
  color: #fff;
}

.auth-header p {
  color: #888;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  padding: 14px 16px;
  border: 2px solid #333;
  border-radius: 10px;
  background: #1a1a2e;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.form-group input::placeholder {
  color: #666;
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
  font-size: 1.2rem;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  color: #888;
}

.toggle-password-btn:hover {
  opacity: 1;
  color: #4CAF50;
}

.toggle-password-btn:active {
  transform: scale(0.95);
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  color: #f44336;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
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
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #333;
}

.auth-footer p {
  color: #888;
}

.auth-footer a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
