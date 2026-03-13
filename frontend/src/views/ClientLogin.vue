<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Cocolytics Client</h1>
        <h2>Client Login</h2>
        <p>Sign in to check your staff application and notifications.</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="Enter your email" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Enter your password" required />
        </div>

        <div class="error-message" v-if="error">{{ error }}</div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In as Client' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Want to become staff? <router-link to="/apply-staff">Apply here</router-link></p>
        <p>Staff/Admin account? <router-link to="/login">Go to staff login</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ClientLogin',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.error = ''
      this.loading = true

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await axios.post(`${apiBaseUrl}/api/auth/login`, {
          email: this.email,
          password: this.password
        })

        const role = response.data?.user?.role
        if (!['user', 'staff', 'admin'].includes(role)) {
          this.error = 'Unknown account role.'
          return
        }

        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        if (role === 'admin') {
          this.$router.push('/admin')
        } else if (role === 'staff') {
          this.$router.push('/staff')
        } else {
          this.$router.push('/client')
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
  background: linear-gradient(135deg, #11263f 0%, #204d63 48%, #2c6e7d 100%);
}

.auth-card {
  background: #13203d;
  border-radius: 16px;
  padding: 36px;
  width: 100%;
  max-width: 430px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(118, 206, 245, 0.2);
}

.auth-header {
  text-align: center;
  margin-bottom: 26px;
}

.auth-header h1 {
  margin: 0 0 8px;
  color: #7fd8ff;
}

.auth-header h2 {
  margin: 0 0 8px;
  color: #fff;
}

.auth-header p {
  margin: 0;
  color: #b2c9da;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #dbe8f2;
  font-size: 0.92rem;
}

.form-group input {
  background: #0f1933;
  border: 2px solid #25395c;
  color: #fff;
  border-radius: 10px;
  padding: 12px;
}

.form-group input:focus {
  outline: none;
  border-color: #7fd8ff;
  box-shadow: 0 0 0 3px rgba(127, 216, 255, 0.2);
}

.error-message {
  border: 1px solid rgba(244, 67, 54, 0.6);
  color: #ffb0ac;
  background: rgba(244, 67, 54, 0.14);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.btn-primary {
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-weight: 700;
  cursor: pointer;
  color: #072236;
  background: linear-gradient(135deg, #7fd8ff 0%, #5fc3f0 100%);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 18px;
  text-align: center;
  color: #c6dce9;
}

.auth-footer p {
  margin: 8px 0;
}

.auth-footer a {
  color: #7fd8ff;
  font-weight: 600;
}
</style>
