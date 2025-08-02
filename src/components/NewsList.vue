<template>
  <div class="news-list">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-for="item in newsList" :key="item.id" class="news-item" @click="goToDetail(item)">
          <div class="news-content">
            <h3 class="title">{{ item.title }}</h3>
            <p class="description">{{ item.description }}</p>
            <div class="meta">
              <span class="source">{{ item.source }}</span>
              <span class="time">{{ formatDate(item.publishedAt) }}</span>
            </div>
          </div>
          <div class="news-image" v-if="item.image">
            <img :src="item.image" :alt="item.title" />
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore } from '../stores/newsStore'

const props = defineProps({
  category: {
    type: String,
    default: 'latest'
  }
})

const router = useRouter()
const newsStore = useNewsStore()

const refreshing = ref(false)
const loading = computed(() => newsStore.isLoading)
const finished = computed(() => {
  switch (props.category) {
    case 'latest':
      return !newsStore.hasMore.latest
    case 'ai-tech':
      return !newsStore.hasMore['ai-tech']
    case 'industry':
      return !newsStore.hasMore.industry
    default:
      return true
  }
})

const newsList = computed(() => {
  switch (props.category) {
    case 'latest':
      return newsStore.getLatestNews
    case 'ai-tech':
      return newsStore.getAiTechNews
    case 'industry':
      return newsStore.getIndustryNews
    default:
      return []
  }
})

const goToDetail = (news) => {
  router.push(`/news/${news.id}`)
}

const onLoad = async () => {
  try {
    switch (props.category) {
      case 'latest':
        await newsStore.fetchLatestNews()
        break
      case 'ai-tech':
        await newsStore.fetchAiTechNews()
        break
      case 'industry':
        await newsStore.fetchIndustryNews()
        break
    }
  } catch (error) {
    console.error('加载新闻失败:', error)
  }
}

const onRefresh = async () => {
  try {
    switch (props.category) {
      case 'latest':
        await newsStore.fetchLatestNews(true)
        break
      case 'ai-tech':
        await newsStore.fetchAiTechNews(true)
        break
      case 'industry':
        await newsStore.fetchIndustryNews(true)
        break
    }
  } catch (error) {
    console.error('刷新新闻失败:', error)
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  // 如果对应分类没有数据，则加载
  if (newsList.value.length === 0) {
    onLoad()
  }
})
</script>

<style scoped>
.news-list {
  background-color: #fff;
}

.news-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.news-item:hover {
  background-color: #f9f9f9;
}

.news-content {
  flex: 1;
  margin-right: 15px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.4;
  color: #333;
}

.description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.news-image {
  width: 100px;
  height: 80px;
  flex-shrink: 0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
</style>