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
          Cocolytics is designed to provide powerful analytics tools that help 
          businesses and individuals make data-driven decisions. Our platform 
          combines ease of use with advanced features to deliver insights that matter.
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
        <h2>Features</h2>
        <ul class="features-list">
          <li>📊 Real-time data visualization</li>
          <li>📥 Installable as a native app</li>
          <li>🔄 Offline support</li>
          <li>🔒 Secure data handling</li>
          <li>📱 Mobile-responsive design</li>
          <li>⚡ Fast and lightweight</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.about-hero {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--secondary-color), #6D4C41);
  color: var(--white);
  border-radius: 15px;
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

.about-content h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.about-content p {
  line-height: 1.8;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.tech-item {
  text-align: center;
  padding: 1rem;
  background: var(--background-color);
  border-radius: 10px;
}

.tech-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.tech-item h3 {
  color: var(--primary-dark);
  margin-bottom: 0.25rem;
}

.tech-item p {
  font-size: 0.9rem;
  color: #666;
}

.features-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.features-list li {
  padding: 0.75rem;
  background: var(--background-color);
  border-radius: 5px;
}
</style>
