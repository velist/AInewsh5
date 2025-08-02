import { defineStore } from 'pinia'
import { newsService } from '../services/newsService'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export const useNewsStore = defineStore('news', {
  state: () => ({
    latestNews: [],
    aiTechNews: [],
    industryNews: [],
    loading: false,
    error: null,
    currentPage: {
      latest: 1,
      'ai-tech': 1,
      industry: 1
    },
    hasMore: {
      latest: true,
      'ai-tech': true,
      industry: true
    },
    newsDetail: null,
    searchResults: [],
    searchQuery: '',
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    readHistory: JSON.parse(localStorage.getItem('readHistory') || '[]')
  }),

  getters: {
    getLatestNews: (state) => state.latestNews,
    getAiTechNews: (state) => state.aiTechNews,
    getIndustryNews: (state) => state.industryNews,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getNewsDetail: (state) => state.newsDetail,
    getSearchResults: (state) => state.searchResults,
    getFavorites: (state) => state.favorites,
    getReadHistory: (state) => state.readHistory,
    getFavoriteIds: (state) => state.favorites.map(item => item.id),
    isFavorite: (state) => (id) => state.favorites.some(item => item.id === id),
    getReadNewsIds: (state) => state.readHistory.map(item => item.id)
  },

  actions: {
    setLoading(loading) {
      this.loading = loading
    },

    setError(error) {
      this.error = error
    },

    // 获取最新新闻
    async fetchLatestNews(refresh = false) {
      if (this.loading && !refresh) return

      this.setLoading(true)
      this.setError(null)

      try {
        const page = refresh ? 1 : this.currentPage.latest
        const news = await newsService.getLatestNews(page, 10)
        
        if (refresh) {
          this.latestNews = news
          this.currentPage.latest = 1
        } else {
          this.latestNews.push(...news)
          this.currentPage.latest++
        }

        this.hasMore.latest = news.length >= 10
      } catch (error) {
        this.setError(error.message)
        console.error('获取最新新闻失败:', error)
      } finally {
        this.setLoading(false)
      }
    },

    // 获取AI技术新闻
    async fetchAiTechNews(refresh = false) {
      if (this.loading && !refresh) return

      this.setLoading(true)
      this.setError(null)

      try {
        const page = refresh ? 1 : this.currentPage['ai-tech']
        const news = await newsService.getNewsByCategory('ai-tech', page, 10)
        
        if (refresh) {
          this.aiTechNews = news
          this.currentPage['ai-tech'] = 1
        } else {
          this.aiTechNews.push(...news)
          this.currentPage['ai-tech']++
        }

        this.hasMore['ai-tech'] = news.length >= 10
      } catch (error) {
        this.setError(error.message)
        console.error('获取AI技术新闻失败:', error)
      } finally {
        this.setLoading(false)
      }
    },

    // 获取行业动态
    async fetchIndustryNews(refresh = false) {
      if (this.loading && !refresh) return

      this.setLoading(true)
      this.setError(null)

      try {
        const page = refresh ? 1 : this.currentPage.industry
        const news = await newsService.getNewsByCategory('industry', page, 10)
        
        if (refresh) {
          this.industryNews = news
          this.currentPage.industry = 1
        } else {
          this.industryNews.push(...news)
          this.currentPage.industry++
        }

        this.hasMore.industry = news.length >= 10
      } catch (error) {
        this.setError(error.message)
        console.error('获取行业动态失败:', error)
      } finally {
        this.setLoading(false)
      }
    },

    // 获取新闻详情
    async fetchNewsDetail(id) {
      this.setLoading(true)
      this.setError(null)

      try {
        const detail = await newsService.getNewsDetail(id)
        this.newsDetail = detail
        
        // 添加到阅读历史
        if (detail && !this.readHistory.some(item => item.id === id)) {
          this.addToReadHistory(detail)
        }
      } catch (error) {
        this.setError(error.message)
        console.error('获取新闻详情失败:', error)
      } finally {
        this.setLoading(false)
      }
    },

    // 搜索新闻
    async searchNews(query, page = 1) {
      this.setLoading(true)
      this.setError(null)
      this.searchQuery = query

      try {
        const results = await newsService.searchNews(query, page, 10)
        
        if (page === 1) {
          this.searchResults = results
        } else {
          this.searchResults.push(...results)
        }
      } catch (error) {
        this.setError(error.message)
        console.error('搜索新闻失败:', error)
      } finally {
        this.setLoading(false)
      }
    },

    // 添加到收藏
    addToFavorites(article) {
      if (!this.favorites.some(item => item.id === article.id)) {
        this.favorites.unshift({
          ...article,
          favoritedAt: new Date().toISOString()
        })
        this.saveFavorites()
      }
    },

    // 从收藏中移除
    removeFromFavorites(id) {
      this.favorites = this.favorites.filter(item => item.id !== id)
      this.saveFavorites()
    },

    // 保存收藏到本地存储
    saveFavorites() {
      localStorage.setItem('favorites', JSON.stringify(this.favorites))
    },

    // 添加到阅读历史
    addToReadHistory(article) {
      // 移除已存在的相同记录
      this.readHistory = this.readHistory.filter(item => item.id !== article.id)
      
      // 添加到历史记录开头
      this.readHistory.unshift({
        ...article,
        readAt: new Date().toISOString()
      })

      // 只保留最近100条记录
      if (this.readHistory.length > 100) {
        this.readHistory = this.readHistory.slice(0, 100)
      }

      this.saveReadHistory()
    },

    // 保存阅读历史到本地存储
    saveReadHistory() {
      localStorage.setItem('readHistory', JSON.stringify(this.readHistory))
    },

    // 清空阅读历史
    clearReadHistory() {
      this.readHistory = []
      localStorage.removeItem('readHistory')
    },

    // 清空搜索结果
    clearSearchResults() {
      this.searchResults = []
      this.searchQuery = ''
    },

    // 重置分页状态
    resetPagination() {
      this.currentPage = {
        latest: 1,
        'ai-tech': 1,
        industry: 1
      }
      this.hasMore = {
        latest: true,
        'ai-tech': true,
        industry: true
      }
    },

    // 刷新所有数据
    async refreshAll() {
      this.resetPagination()
      
      const promises = [
        this.fetchLatestNews(true),
        this.fetchAiTechNews(true),
        this.fetchIndustryNews(true)
      ]

      try {
        await Promise.all(promises)
      } catch (error) {
        console.error('刷新数据失败:', error)
      }
    },

    // 格式化时间
    formatTime(timeString) {
      return dayjs(timeString).format('MM-DD HH:mm')
    },

    // 格式化相对时间
    formatRelativeTime(timeString) {
      const now = dayjs()
      const time = dayjs(timeString)
      const diff = now.diff(time, 'hour')

      if (diff < 1) return '刚刚'
      if (diff < 24) return `${diff}小时前`
      if (diff < 48) return '昨天'
      return this.formatTime(timeString)
    }
  }
})