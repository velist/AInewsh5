<template>
  <div class="home">
    <van-nav-bar title="AI新闻推送" />
    
    <div class="content">
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="最新资讯">
          <news-list category="latest" />
        </van-tab>
        <van-tab title="AI技术">
          <news-list category="ai-tech" />
        </van-tab>
        <van-tab title="行业动态">
          <news-list category="industry" />
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NewsList from '../components/NewsList.vue'

const activeTab = ref(0)
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content {
  padding-top: 46px;
}
</style>