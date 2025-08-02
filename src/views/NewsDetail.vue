<template>
  <div class="news-detail">
    <van-nav-bar 
      :title="news.title || '新闻详情'" 
      left-arrow 
      @click-left="goBack"
    />
    
    <div class="content" v-if="news">
      <h1 class="title">{{ news.title }}</h1>
      <div class="meta">
        <span class="source">{{ news.source }}</span>
        <span class="time">{{ formatDate(news.publishedAt) }}</span>
      </div>
      
      <div class="article-content" v-html="news.content"></div>
      
      <div class="actions">
        <van-button type="primary" size="small" @click="shareNews">
          分享
        </van-button>
      </div>
    </div>
    
    <van-loading v-else type="spinner" class="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const route = useRoute()
const router = useRouter()
const news = ref(null)

const goBack = () => {
  router.back()
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const shareNews = () => {
  if (navigator.share) {
    navigator.share({
      title: news.value.title,
      text: news.value.description,
      url: window.location.href
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  }
}

onMounted(async () => {
  const newsId = route.params.id
  // 这里应该根据ID获取新闻详情
  // 暂时使用模拟数据
  news.value = {
    id: newsId,
    title: 'AI新闻标题',
    source: 'AI新闻社',
    publishedAt: new Date().toISOString(),
    content: '<p>这里是新闻内容...</p>'
  }
})
</script>

<style scoped>
.news-detail {
  min-height: 100vh;
  background-color: #fff;
}

.content {
  padding: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  line-height: 1.4;
}

.meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.article-content {
  line-height: 1.6;
  color: #333;
  margin-bottom: 30px;
}

.actions {
  text-align: center;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>