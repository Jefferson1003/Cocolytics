<template>
  <div class="about">
    <section class="about-hero">
      <h1>About Cocolytics</h1>
      <p>Empowering decisions through data analytics</p>
    </section>

    <section class="about-content">
      <div class="card">
        <h2>Our Mission</h2>
        <p>
          Cocolytics aims to develop a centralized real-time platform for tracking coconut lumber production and inventory levels from raw materials to finished outputs, integrating advanced data analytics and visualization tools to provide insights on production efficiency, stock movement, demand patterns, and material wastage. The platform will automate reporting and documentation processes, including daily production logs, stock balances, and sales dispatches, to minimize human error and enhance transparency. A secure role-based access system will ensure controlled use for administrators, warehouse personnel, production supervisors, and sales staff. Additionally, predictive analytics models will forecast inventory needs, optimize schedules, and prevent shortages or excess materials, enabling comprehensive system evaluation and improvement.
        </p>
      </div>

      <div class="card">
        <h2>Technology Stack</h2>
        <div class="tech-stack">
          <div class="tech-item">
            <span class="tech-icon">⚡</span>
            <h3>Vue.js 3</h3>
            <p>Modern frontend framework</p>
          </div>
          <div class="tech-item">
            <span class="tech-icon">🚀</span>
            <h3>Node.js</h3>
            <p>Powerful backend runtime</p>
          </div>
          <div class="tech-item">
            <span class="tech-icon">📱</span>
            <h3>PWA</h3>
            <p>Installable web app</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Contact Us</h2>
        <div class="contact-info">
          <p><span class="contact-icon">📧</span> <strong>Email:</strong> support@cocolytics.com</p>
          <p><span class="contact-icon">📞</span> <strong>Phone:</strong> +1 (123) 456-7890</p>
          <p><span class="contact-icon">📍</span> <strong>Address:</strong> 123 Coconut Lane, Tropical City, TC 12345</p>
          <p><span class="contact-icon">🕒</span> <strong>Business Hours:</strong> Monday - Friday, 9 AM - 5 PM</p>
        </div>
      </div>
    </section>
    
    <section class="about-image">
      <div class="image-card">
        <img :src="imageSrc" alt="Stacked coconut lumber" class="product-image" />
        <p class="image-caption">Stacked coconut lumber — example upload</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      // Try the user image in /public/images first; if it's missing, fall back to a bundled public asset
      imageSrc: '/images/cocolumber.jpg'
    }
  },
  async mounted() {
    try {
      let res = await fetch(this.imageSrc, { method: 'GET' });
      if (!res.ok) {
        // try alternative location (public root filename added earlier)
        res = await fetch('/cocolumber.jpg.jpg', { method: 'GET' });
        if (res.ok) {
          this.imageSrc = '/cocolumber.jpg.jpg';
        } else {
          this.imageSrc = '/pwa-512x512.png';
        }
      }
    } catch (e) {
      try {
        const alt = await fetch('/cocolumber.jpg.jpg', { method: 'GET' });
        this.imageSrc = alt.ok ? '/cocolumber.jpg.jpg' : '/pwa-512x512.png';
      } catch {
        this.imageSrc = '/pwa-512x512.png';
      }
    }
  }
}
</script>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 20px;
}

.about-hero {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.about-hero h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: #242442;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.about-content h2 {
  color: #4CAF50;
  margin-bottom: 1rem;
}

.about-content p {
  line-height: 1.8;
  color: #ccc;
}

.tech-item {
  text-align: center;
  padding: 1rem;
  background: #242442;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.tech-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.tech-item h3 {
  color: #4CAF50;
  margin-bottom: 0.25rem;
}

.tech-item p {
  font-size: 0.9rem;
  color: #ccc;
}

.features-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.features-list li {
  padding: 0.75rem;
  background: #242442;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  color: #ccc;
}

.contact-info p {
  margin-bottom: 1rem;
  color: #ccc;
  line-height: 1.6;
  display: flex;
  align-items: center;
}

.contact-info strong {
  color: #81C784;
}

.contact-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.about-image {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.image-card {
  max-width: 900px;
  width: 100%;
  background: #242442;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  text-align: center;
}

.product-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  display: block;
  margin: 0 auto 12px;
}

.image-caption {
  color: #bdbdbd;
  font-size: 0.95rem;
}
</style>
