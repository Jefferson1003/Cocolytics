<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Cocolytics</h1>
        <h2>Apply as Staff</h2>
        <p>Create your account and submit your staff application.</p>
      </div>

      <form @submit.prevent="handleApply" class="auth-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input id="name" v-model="name" type="text" placeholder="Enter your full name" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="Enter your email" required />
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input id="phone" v-model="phone" type="text" placeholder="Optional contact number" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Create a password"
            minlength="6"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
          />
        </div>

        <div class="form-group">
          <label for="reason">Why do you want to become staff?</label>
          <textarea
            id="reason"
            v-model="reason"
            rows="4"
            placeholder="Tell us your experience, role interest, or availability"
          ></textarea>
        </div>

        <div class="error-message" v-if="error">{{ error }}</div>
        <div class="success-message" v-if="success">{{ success }}</div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Submitting application...' : 'Submit Application' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <router-link to="/client/login">Client sign in</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ApplyStaff',
  data() {
    return {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      reason: '',
      error: '',
      success: '',
      loading: false
    }
  },
  methods: {
    async handleApply() {
      this.error = ''
      this.success = ''

      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match'
        return
      }

      if (this.password.length < 6) {
        this.error = 'Password must be at least 6 characters'
        return
      }

      this.loading = true

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        await axios.post(`${apiBaseUrl}/api/auth/apply-staff`, {
          name: this.name,
          email: this.email,
          password: this.password,
          phone: this.phone,
          reason: this.reason
        })

        this.success = 'Application submitted. Wait for admin approval before logging in as staff.'
        this.name = ''
        this.email = ''
        this.phone = ''
        this.password = ''
        this.confirmPassword = ''
        this.reason = ''

        setTimeout(() => {
          this.$router.push('/login')
        }, 2200)
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to submit application. Please try again.'
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
  background: linear-gradient(135deg, #102418 0%, #1f3b2d 50%, #2a4f3d 100%);
}

.auth-card {
  background: #16213e;
  border-radius: 16px;
  padding: 34px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h1 {
  font-size: 1.9rem;
  margin-bottom: 8px;
  color: #8bc34a;
}

.auth-header h2 {
  font-size: 1.45rem;
  margin-bottom: 8px;
  color: #fff;
}

.auth-header p {
  color: #b7c4d8;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #d7dfef;
  font-size: 0.92rem;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  padding: 12px 14px;
  border: 2px solid #2c3459;
  border-radius: 10px;
  background: #101a33;
  color: #fff;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8bc34a;
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 88px;
}

.error-message {
  background: rgba(244, 67, 54, 0.12);
  border: 1px solid #f44336;
  color: #f99797;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.success-message {
  background: rgba(139, 195, 74, 0.12);
  border: 1px solid #8bc34a;
  color: #c7ef88;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.btn-primary {
  margin-top: 4px;
  background: linear-gradient(135deg, #8bc34a 0%, #5d8d2d 100%);
  color: #102418;
  border: none;
  padding: 13px 20px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  color: #c9d3ea;
}

.auth-footer a {
  color: #8bc34a;
  font-weight: 600;
}

@media (max-width: 600px) {
  .auth-card {
    padding: 24px;
  }
}
</style>