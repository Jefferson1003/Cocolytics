<template>
  <div class="notifications-page">
    <UserNavbar />
    <NotificationsCenter />
    <Footer />
  </div>
</template>

<script>
import UserNavbar from '../components/UserNavbar.vue';
import NotificationsCenter from '../components/NotificationsCenter.vue';
import Footer from '../components/Footer.vue';

export default {
  name: 'NotificationsPage',
  components: {
    UserNavbar,
    NotificationsCenter,
    Footer
  }
};
</script>

<style scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
