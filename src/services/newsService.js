import axios from 'axios'

// 创建axios实例
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 新闻API服务
class NewsService {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = 10 * 60 * 1000 // 10分钟缓存
  }

  // 获取缓存键
  getCacheKey(category, params = {}) {
    return `${category}_${JSON.stringify(params)}`
  }

  // 检查缓存是否有效
  isCacheValid(key) {
    const cached = this.cache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < this.cacheExpiry
  }

  // 设置缓存
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // 获取缓存数据
  getCache(key) {
    const cached = this.cache.get(key)
    return cached ? cached.data : null
  }

  // GNews API
  async fetchGNews(query = 'AI OR 人工智能 OR ChatGPT', maxResults = 10) {
    const cacheKey = this.getCacheKey('gnews', { query, maxResults })
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const apiKey = import.meta.env.VITE_GNEWS_API_KEY
      if (!apiKey) {
        throw new Error('GNews API密钥未配置')
      }

      const response = await api.get('https://gnews.io/api/v4/search', {
        params: {
          q: query,
          lang: 'zh',
          country: 'cn',
          max: maxResults,
          apikey: apiKey
        }
      })

      const articles = response.data.articles.map(article => ({
        id: `gnews_${article.publishedAt}_${Date.now()}`,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image: article.image,
        source: article.source.name,
        publishedAt: article.publishedAt,
        category: 'AI'
      }))

      this.setCache(cacheKey, articles)
      return articles
    } catch (error) {
      console.error('GNews API调用失败:', error)
      return this.getFallbackNews()
    }
  }

  // NewsData.io API
  async fetchNewsData(category = 'technology', query = 'artificial intelligence') {
    const cacheKey = this.getCacheKey('newsdata', { category, query })
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY
      if (!apiKey) {
        throw new Error('NewsData API密钥未配置')
      }

      const response = await api.get('https://newsdata.io/api/1/news', {
        params: {
          apikey: apiKey,
          q: query,
          language: 'zh',
          category: category
        }
      })

      const articles = response.data.results.map(article => ({
        id: `newsdata_${article.article_id}`,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.link,
        image: article.image_url,
        source: article.source_id,
        publishedAt: article.pubDate,
        category: category
      }))

      this.setCache(cacheKey, articles)
      return articles
    } catch (error) {
      console.error('NewsData API调用失败:', error)
      return this.getFallbackNews()
    }
  }

  // 获取备用新闻数据（当API不可用时）
  getFallbackNews() {
    return [
      {
        id: `fallback_${Date.now()}_1`,
        title: 'AI技术持续发展，智能应用不断涌现',
        description: '人工智能技术在各个领域持续取得突破，为人们的生活带来更多便利。',
        content: '<p>人工智能技术在各个领域持续取得突破，为人们的生活带来更多便利。</p>',
        url: '#',
        image: 'https://via.placeholder.com/300x200',
        source: 'AI新闻社',
        publishedAt: new Date().toISOString(),
        category: 'AI'
      },
      {
        id: `fallback_${Date.now()}_2`,
        title: '机器学习算法优化取得新进展',
        description: '研究人员在机器学习算法优化方面取得重要进展，提高了模型训练效率。',
        content: '<p>研究人员在机器学习算法优化方面取得重要进展，提高了模型训练效率。</p>',
        url: '#',
        image: 'https://via.placeholder.com/300x200',
        source: '科技日报',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: 'AI'
      }
    ]
  }

  // 获取最新AI新闻
  async getLatestNews(page = 1, pageSize = 10) {
    const cacheKey = this.getCacheKey('latest', { page, pageSize })
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      // 优先使用GNews API
      const articles = await this.fetchGNews()
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      
      const paginatedArticles = articles.slice(startIndex, endIndex)
      this.setCache(cacheKey, paginatedArticles)
      
      return paginatedArticles
    } catch (error) {
      console.error('获取最新新闻失败:', error)
      return this.getFallbackNews()
    }
  }

  // 根据分类获取新闻
  async getNewsByCategory(category, page = 1, pageSize = 10) {
    const cacheKey = this.getCacheKey('category', { category, page, pageSize })
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      let articles = []
      
      switch (category) {
        case 'ai-tech':
          articles = await this.fetchGNews('ChatGPT OR GPT OR 机器学习 OR 深度学习')
          break
        case 'industry':
          articles = await this.fetchNewsData('business', 'artificial intelligence AI')
          break
        default:
          articles = await this.fetchGNews()
      }

      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedArticles = articles.slice(startIndex, endIndex)
      
      this.setCache(cacheKey, paginatedArticles)
      return paginatedArticles
    } catch (error) {
      console.error('获取分类新闻失败:', error)
      return this.getFallbackNews()
    }
  }

  // 搜索新闻
  async searchNews(query, page = 1, pageSize = 10) {
    const cacheKey = this.getCacheKey('search', { query, page, pageSize })
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const articles = await this.fetchGNews(query)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedArticles = articles.slice(startIndex, endIndex)
      
      this.setCache(cacheKey, paginatedArticles)
      return paginatedArticles
    } catch (error) {
      console.error('搜索新闻失败:', error)
      return this.getFallbackNews()
    }
  }

  // 获取新闻详情
  async getNewsDetail(id) {
    const cacheKey = this.getCacheKey('detail', { id })
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      // 从缓存中查找
      for (const [key, value] of this.cache.entries()) {
        if (key.includes('gnews') || key.includes('newsdata')) {
          const article = value.data.find(item => item.id === id)
          if (article) {
            this.setCache(cacheKey, article)
            return article
          }
        }
      }
      
      throw new Error('新闻详情未找到')
    } catch (error) {
      console.error('获取新闻详情失败:', error)
      return null
    }
  }
}

// 创建单例实例
export const newsService = new NewsService()

// 导出服务类
export default NewsService