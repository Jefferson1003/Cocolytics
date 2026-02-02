<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <h3>🥥 Cocolytics</h3>
          <p>Your trusted coconut lumber analytics platform</p>
        </div>
      </div>

      <div class="footer-section">
        <h4>Quick Links</h4>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/about">About Us</router-link></li>
          <li v-if="user && user.role === 'user'"><router-link to="/user-dashboard">Dashboard</router-link></li>
          <li v-if="user && user.role === 'staff'"><router-link to="/staff-dashboard">Staff Portal</router-link></li>
          <li v-if="user && user.role === 'admin'"><router-link to="/admin-dashboard">Admin Panel</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Services</h4>
        <ul>
          <li>Analytics & Reporting</li>
          <li>Inventory Management</li>
          <li>Order Processing</li>
          <li>Quality Control</li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Contact Info</h4>
        <ul class="contact-list">
          <li><i class="icon">📧</i> support@cocolytics.com</li>
          <li><i class="icon">📞</i> +1 (555) 123-4567</li>
          <li><i class="icon">📍</i> Coconut Valley, CA 90210</li>
          <li><i class="icon">🕒</i> Mon-Fri: 9AM-6PM PST</li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Follow Us</h4>
        <div class="social-links">
          <a href="#" class="social-link" title="Facebook"><i>📘</i></a>
          <a href="#" class="social-link" title="Twitter"><i>🐦</i></a>
          <a href="#" class="social-link" title="LinkedIn"><i>💼</i></a>
          <a href="#" class="social-link" title="Instagram"><i>📷</i></a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p>&copy; 2026 Cocolytics. All rights reserved. | Privacy Policy | Terms of Service</p>
        <div class="footer-badges">
          <span class="badge">🔒 Secure</span>
          <span class="badge">✅ Certified</span>
          <span class="badge">🌱 Eco-Friendly</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  props: {
    user: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  margin-top: auto;
  border-top: 2px solid #4CAF50;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.footer-section {
  padding: 0 15px;
}

.footer-logo h3 {
  color: #81C784;
  font-size: 1.8rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.footer-logo p {
  color: #b0bec5;
  font-size: 0.95rem;
  line-height: 1.5;
}

.footer-section h4 {
  color: #81C784;
  font-size: 1.1rem;
  margin-bottom: 15px;
  font-weight: 600;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 5px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  color: #e0e0e0;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: #81C784;
}

.contact-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #b0bec5;
  font-size: 0.9rem;
}

.contact-list .icon {
  margin-right: 10px;
  font-size: 1rem;
  color: #4CAF50;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4CAF50;
  border-radius: 50%;
  color: #81C784;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.social-link:hover {
  background: #4CAF50;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  padding: 20px 0;
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.footer-bottom-content p {
  color: #b0bec5;
  font-size: 0.9rem;
  margin: 0;
}

.footer-badges {
  display: flex;
  gap: 15px;
}

.badge {
  background: rgba(76, 175, 80, 0.1);
  color: #81C784;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #4CAF50;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    padding: 30px 15px;
    gap: 25px;
  }

  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .footer-badges {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-section {
    padding: 0;
  }

  .social-links {
    justify-content: center;
  }
}
</style>