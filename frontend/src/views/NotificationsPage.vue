<template>
  <div class="notifications-page staff-mode">
    <StaffSidebar />
    <NotificationsCenter />
    <Footer />
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'
import NotificationsCenter from '../components/NotificationsCenter.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'NotificationsPage',
  components: {
    StaffSidebar,
    NotificationsCenter,
    Footer
  }
}
</script>

<style scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.notifications-page.staff-mode {
  padding-top: 70px;
}
</style>
