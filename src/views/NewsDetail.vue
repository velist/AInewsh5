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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '../stores/newsStore'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const route = useRoute()
const router = useRouter()
const newsStore = useNewsStore()

const news = computed(() => newsStore.getNewsDetail)
const loading = computed(() => newsStore.isLoading)
const error = computed(() => newsStore.getError)

const goBack = () => {
  router.back()
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const formatContent = (content) => {
  if (!content) return '<p>内容加载中...</p>'
  
  // 如果内容是纯文本，转换为段落
  if (!content.includes('<')) {
    return content.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('')
  }
  
  return content
}

const shareNews = async () => {
  if (!news.value) return
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: news.value.title,
        text: news.value.description,
        url: window.location.href
      })
    } catch (error) {
      console.log('分享失败:', error)
    }
  } else {
    // 复制链接到剪贴板
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
    }
  }
}

const openOriginalLink = () => {
  if (news.value && news.value.url) {
    window.open(news.value.url, '_blank')
  }
}

onMounted(async () => {
  const newsId = route.params.id
  await newsStore.fetchNewsDetail(newsId)
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