<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <p class="auth-eyebrow">Application Portal</p>
        <h1>
          Staff Application
        </h1>
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
        <router-link to="/" class="btn-home-link">Back to Home</router-link>
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

.form-group input,
.form-group textarea {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  border-radius: 12px;
  padding: 14px 15px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.72);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.22);
}

.form-group textarea {
  resize: vertical;
  min-height: 88px;
}

.error-message {
  border: 1px solid rgba(250, 112, 154, 0.35);
  color: #ffb3d5;
  background: rgba(250, 112, 154, 0.12);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
}

.success-message {
  border: 1px solid rgba(17, 153, 142, 0.35);
  color: #93ffd0;
  background: rgba(17, 153, 142, 0.16);
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

.auth-footer a {
  color: #81C784;
  font-weight: 600;
}

@media (max-width: 600px) {
  .auth-card {
    padding: 28px;
  }
}
</style>