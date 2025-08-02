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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const props = defineProps({
  category: {
    type: String,
    default: 'latest'
  }
})

const router = useRouter()
const newsList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)

const formatDate = (date) => {
  return dayjs(date).format('MM-DD HH:mm')
}

const goToDetail = (news) => {
  router.push(`/news/${news.id}`)
}

const fetchNews = async () => {
  try {
    // 模拟新闻数据
    const mockNews = [
      {
        id: 1,
        title: 'OpenAI发布GPT-5，性能大幅提升',
        description: 'OpenAI最新发布的GPT-5在多个基准测试中表现优异，推理能力和创造性显著增强...',
        source: 'AI科技日报',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        image: 'https://via.placeholder.com/100x80'
      },
      {
        id: 2,
        title: '谷歌推出新一代AI模型Gemini Ultra',
        description: '谷歌宣布Gemini Ultra在数学、推理和代码生成方面超越了现有模型...',
        source: 'AI新闻周刊',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        image: 'https://via.placeholder.com/100x80'
      },
      {
        id: 3,
        title: 'Meta开源LLaMA 3，商用可用',
        description: 'Meta发布了LLaMA 3系列模型，性能强劲且允许商业使用...',
        source: '机器之心',
        publishedAt: new Date(Date.now() - 10800000).toISOString()
      }
    ]

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (refreshing.value) {
      newsList.value = mockNews
      refreshing.value = false
    } else {
      newsList.value.push(...mockNews)
    }
    
    page.value++
    
    // 模拟数据加载完成
    if (page.value > 3) {
      finished.value = true
    }
  } catch (error) {
    console.error('获取新闻失败:', error)
  } finally {
    loading.value = false
  }
}

const onLoad = () => {
  fetchNews()
}

const onRefresh = () => {
  finished.value = false
  page.value = 1
  fetchNews()
}

onMounted(() => {
  fetchNews()
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