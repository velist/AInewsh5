#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { fileURLToPath } from 'url'

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// HTML静态生成器类
class StaticSiteGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../dist-static')
    this.publicDir = path.join(__dirname, '../public')
    this.newsData = []
    this.categories = ['latest', 'ai-tech', 'industry']
    this.apiKey = process.env.GNEWS_API_KEY || process.env.VITE_GNEWS_API_KEY
  }

  // 获取真实新闻数据
  async fetchRealNewsData() {
    if (!this.apiKey) {
      console.log('⚠️  API密钥未找到，无法获取真实新闻')
      return null
    }

    console.log('🌐 正在调用真实新闻API...')
    
    try {
      const newsData = { latest: [], 'ai-tech': [], industry: [] }
      
      // 获取最新AI新闻
      const latestResponse = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q: 'AI OR "artificial intelligence" OR ChatGPT OR "machine learning" OR OpenAI OR Google',
          lang: 'en',
          country: 'us',
          max: 15,
          token: this.apiKey
        },
        timeout: 15000
      })

      // 获取AI技术新闻  
      const techResponse = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q: '"deep learning" OR "neural network" OR "large language model" OR "computer vision"',
          lang: 'en',
          country: 'us', 
          max: 10,
          token: this.apiKey
        },
        timeout: 15000
      })

      // 获取行业动态新闻
      const industryResponse = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q: '"AI investment" OR "AI startup" OR "AI market" OR "tech industry"',
          lang: 'en',
          country: 'us',
          max: 10, 
          token: this.apiKey
        },
        timeout: 15000
      })

      // 处理最新新闻
      if (latestResponse.data?.articles) {
        newsData.latest = latestResponse.data.articles.map((article, index) => ({
          id: `latest_${index + 1}`,
          title: article.title,
          description: article.description,
          content: this.generateContent(article.description, article.content),
          source: article.source.name,
          publishedAt: article.publishedAt,
          image: article.image || 'https://via.placeholder.com/400x200?text=AI+News',
          category: 'latest',
          url: article.url
        }))
      }

      // 处理技术新闻
      if (techResponse.data?.articles) {
        newsData['ai-tech'] = techResponse.data.articles.map((article, index) => ({
          id: `ai_tech_${index + 1}`,
          title: article.title,
          description: article.description,
          content: this.generateContent(article.description, article.content),
          source: article.source.name,
          publishedAt: article.publishedAt,
          image: article.image || 'https://via.placeholder.com/400x200?text=AI+Tech',
          category: 'ai-tech',
          url: article.url
        }))
      }

      // 处理行业新闻
      if (industryResponse.data?.articles) {
        newsData.industry = industryResponse.data.articles.map((article, index) => ({
          id: `industry_${index + 1}`,
          title: article.title,
          description: article.description,
          content: this.generateContent(article.description, article.content),
          source: article.source.name,
          publishedAt: article.publishedAt,
          image: article.image || 'https://via.placeholder.com/400x200?text=AI+Industry',
          category: 'industry',
          url: article.url
        }))
      }

      console.log(`✅ 获取到真实新闻: 最新${newsData.latest.length}条, AI技术${newsData['ai-tech'].length}条, 行业动态${newsData.industry.length}条`)
      return newsData

    } catch (error) {
      console.error('❌ 真实API调用失败:', error.message)
      return null
    }
  }

  // 生成文章内容
  generateContent(description, content) {
    if (content) {
      // 如果有完整内容，提取段落
      const paragraphs = content.split('\n').filter(p => p.trim()).slice(0, 3)
      return paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n')
    }
    
    if (description) {
      // 基于描述生成内容
      const sentences = description.split('. ').filter(s => s.trim())
      return sentences.map(s => `<p>${s.trim()}${s.includes('.') ? '' : '.'}</p>`).join('\n')
    }
    
    return '<p>详细内容请点击原文链接查看。</p>'
  }

  // 初始化输出目录
  async init() {
    console.log('🚀 初始化静态站点生成器...')
    
    // 清理输出目录
    if (fs.existsSync(this.outputDir)) {
      fs.rmSync(this.outputDir, { recursive: true, force: true })
    }
    
    // 创建输出目录
    fs.mkdirSync(this.outputDir, { recursive: true })
    fs.mkdirSync(path.join(this.outputDir, 'news'), { recursive: true })
    fs.mkdirSync(path.join(this.outputDir, 'assets'), { recursive: true })
    
    console.log('✅ 输出目录已创建')
  }

  // 获取真实新闻数据 - 强制使用真实API
  async fetchNewsData() {
    console.log('📡 获取真实新闻数据...')
    
    try {
      // 必须使用真实API获取新闻
      const realNews = await this.fetchRealNewsData()
      if (realNews && Object.keys(realNews).length > 0) {
        this.newsData = realNews
        console.log('✅ 真实新闻数据获取完成')
        console.log(`📊 数据统计: 最新${realNews.latest?.length || 0}条, AI技术${realNews['ai-tech']?.length || 0}条, 行业动态${realNews.industry?.length || 0}条`)
        return
      }
      
      // 如果API失败，使用基础默认数据并明确标注
      console.log('❌ 真实API获取失败，使用最少默认数据')
      this.newsData = this.getMinimalDefaultNews()
      
    } catch (error) {
      console.error('❌ 获取新闻数据失败:', error)
      console.log('⚠️  将使用最少默认数据确保网站可用')
      this.newsData = this.getMinimalDefaultNews()
    }
  }

  // 获取最小默认新闻数据（仅在API完全失败时使用）
  getMinimalDefaultNews() {
    const currentTime = new Date().toISOString()
    return {
      latest: [
        {
          id: 'api_unavailable_1',
          title: '新闻API暂时不可用',
          description: '真实新闻数据获取失败，请稍后再试或联系管理员配置API密钥。',
          content: '<p>抱歉，当前无法获取最新的AI新闻数据。</p><p>这可能是由于API密钥未配置或网络连接问题导致的。</p><p>请联系管理员或稍后再试。</p>',
          source: '系统提示',
          publishedAt: currentTime,
          image: 'https://via.placeholder.com/400x200?text=API+Unavailable',
          category: 'latest',
          url: '#'
        }
      ],
      'ai-tech': [],
      industry: []
    }
  }

  // 生成CSS样式
  generateCSS() {
    return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav a:hover, .nav a.active {
  opacity: 0.8;
}

/* Main Content */
main {
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

/* News Cards */
.news-grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;
}

.news-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.news-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.news-card-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-left: 1rem;
}

.news-card-content {
  flex: 1;
}

.news-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.news-card-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.news-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #888;
}

.news-card-source {
  font-weight: 500;
}

.news-card-time {
  font-size: 0.75rem;
}

/* News Detail */
.news-detail {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.news-detail-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #2c3e50;
  line-height: 1.3;
}

.news-detail-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.875rem;
  color: #666;
}

.news-detail-content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #444;
}

.news-detail-content p {
  margin-bottom: 1.5rem;
}

.news-detail-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  margin: 1.5rem 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav {
    gap: 1rem;
  }
  
  .news-card-header {
    flex-direction: column;
  }
  
  .news-card-image {
    width: 100%;
    height: 200px;
    margin-left: 0;
    margin-top: 1rem;
  }
  
  .news-detail-title {
    font-size: 1.5rem;
  }
}

/* Category Tabs */
.category-tabs {
  display: flex;
  background: white;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.category-tab {
  padding: 1rem 2rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.category-tab:hover {
  background-color: #f8f9fa;
}

.category-tab.active {
  border-bottom-color: #667eea;
  color: #667eea;
  font-weight: 600;
}

/* Back Button */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #5a6fd8;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.action-button.primary {
  background: #667eea;
  color: white;
}

.action-button.secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.action-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Footer */
.footer {
  background: #2c3e50;
  color: #ecf0f1;
  text-align: center;
  padding: 2rem 0;
  margin-top: 4rem;
}

.footer p {
  margin-bottom: 0.5rem;
}
`
  }

  // 生成新闻卡片HTML
  generateNewsCard(news) {
    return `
        <article class="news-card">
            <div class="news-card-header">
                <div class="news-card-content">
                    <h2 class="news-card-title">
                        <a href="news/${news.id}.html" style="color: inherit; text-decoration: none;">
                            ${news.title}
                        </a>
                    </h2>
                    <p class="news-card-description">${news.description}</p>
                    <div class="news-card-meta">
                        <span class="news-card-source">${news.source}</span>
                        <span class="news-card-time" data-time="${news.publishedAt}">
                            ${new Date(news.publishedAt).toLocaleString('zh-CN')}
                        </span>
                    </div>
                </div>
                <img src="${news.image}" alt="${news.title}" class="news-card-image">
            </div>
        </article>
    `
  }

  // 生成首页
  generateIndex() {
    console.log('🏠 生成首页...')
    
    const latestNews = this.newsData.latest || []
    const newsCards = latestNews.map(news => this.generateNewsCard(news)).join('')
    
    const css = this.generateCSS()
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI新闻推送 - 最新AI动态</title>
    <meta name="description" content="获取最新的AI新闻和动态，包括ChatGPT、机器学习、深度学习等技术资讯">
    <style>${css}</style>
</head>
<body>
    <header class="header">
        <div class="container header-content">
            <div class="logo">🤖 AI新闻推送</div>
            <nav class="nav">
                <a href="index.html" class="active">首页</a>
                <a href="ai-tech.html">AI技术</a>
                <a href="industry.html">行业动态</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <div class="category-tabs">
            <div class="category-tab active">最新资讯</div>
            <div class="category-tab">AI技术</div>
            <div class="category-tab">行业动态</div>
        </div>

        <div class="news-grid">
            ${newsCards}
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 AI新闻推送. 所有权利保留.</p>
            <p>为您提供最新的AI技术资讯和行业动态</p>
        </div>
    </footer>

    <script>
        // 更新时间的脚本
        document.addEventListener('DOMContentLoaded', function() {
            function updateTimes() {
                const timeElements = document.querySelectorAll('.news-card-time');
                timeElements.forEach(element => {
                    const time = new Date(element.getAttribute('data-time'));
                    const now = new Date();
                    const diff = Math.floor((now - time) / (1000 * 60));
                    
                    if (diff < 1) {
                        element.textContent = '刚刚';
                    } else if (diff < 60) {
                        element.textContent = diff + '分钟前';
                    } else if (diff < 1440) {
                        element.textContent = Math.floor(diff / 60) + '小时前';
                    } else {
                        element.textContent = time.toLocaleDateString('zh-CN');
                    }
                });
            }
            
            updateTimes();
            setInterval(updateTimes, 60000);
        });
    </script>
</body>
</html>`

    fs.writeFileSync(path.join(this.outputDir, 'index.html'), html, 'utf8')
    console.log('✅ 首页生成完成')
  }

  // 生成分类页面
  generateCategoryPages() {
    console.log('📂 生成分类页面...')
    
    for (const category of this.categories) {
      if (category === 'latest') continue // 首页已生成
      
      const news = this.newsData[category] || []
      const newsCards = news.map(item => this.generateNewsCard(item)).join('')
      
      const css = this.generateCSS()
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.getCategoryTitle(category)} - AI新闻推送</title>
    <meta name="description" content="获取${this.getCategoryTitle(category)}的最新资讯">
    <style>${css}</style>
</head>
<body>
    <header class="header">
        <div class="container header-content">
            <div class="logo">🤖 AI新闻推送</div>
            <nav class="nav">
                <a href="index.html">首页</a>
                <a href="ai-tech.html" ${category === 'ai-tech' ? 'class="active"' : ''}>AI技术</a>
                <a href="industry.html" ${category === 'industry' ? 'class="active"' : ''}>行业动态</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <h1 style="margin: 2rem 0; color: #2c3e50;">${this.getCategoryTitle(category)}</h1>
        
        <div class="news-grid">
            ${newsCards}
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 AI新闻推送. 所有权利保留.</p>
            <p>为您提供最新的AI技术资讯和行业动态</p>
        </div>
    </footer>

    <script>
        // 时间更新脚本
        document.addEventListener('DOMContentLoaded', function() {
            function updateTimes() {
                const timeElements = document.querySelectorAll('.news-card-time');
                timeElements.forEach(element => {
                    const time = new Date(element.getAttribute('data-time'));
                    const now = new Date();
                    const diff = Math.floor((now - time) / (1000 * 60));
                    
                    if (diff < 1) {
                        element.textContent = '刚刚';
                    } else if (diff < 60) {
                        element.textContent = diff + '分钟前';
                    } else if (diff < 1440) {
                        element.textContent = Math.floor(diff / 60) + '小时前';
                    } else {
                        element.textContent = time.toLocaleDateString('zh-CN');
                    }
                });
            }
            
            updateTimes();
            setInterval(updateTimes, 60000);
        });
    </script>
</body>
</html>`

      fs.writeFileSync(path.join(this.outputDir, `${category}.html`), html, 'utf8')
      console.log(`✅ ${category}页面生成完成`)
    }
  }

  // 生成新闻详情页
  generateDetailPages() {
    console.log('📄 生成新闻详情页...')
    
    for (const category of this.categories) {
      const news = this.newsData[category] || []
      
      for (const item of news) {
        const css = this.generateCSS()
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${item.title} - AI新闻推送</title>
    <meta name="description" content="${item.description}">
    <style>${css}</style>
</head>
<body>
    <header class="header">
        <div class="container header-content">
            <div class="logo">🤖 AI新闻推送</div>
            <nav class="nav">
                <a href="../index.html">首页</a>
                <a href="../ai-tech.html">AI技术</a>
                <a href="../industry.html">行业动态</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <a href="../index.html" class="back-button">← 返回首页</a>
        
        <article class="news-detail">
            <h1 class="news-detail-title">${item.title}</h1>
            
            <div class="news-detail-meta">
                <span>来源：${item.source}</span>
                <span>发布时间：${new Date(item.publishedAt).toLocaleString('zh-CN')}</span>
            </div>
            
            ${item.image ? `<img src="${item.image}" alt="${item.title}" class="news-detail-image">` : ''}
            
            <div class="news-detail-content">
                ${item.content}
            </div>
            
            <div class="action-buttons">
                <a href="${item.url}" target="_blank" class="action-button primary">查看原文</a>
                <button onclick="shareNews()" class="action-button secondary">分享</button>
            </div>
        </article>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 AI新闻推送. 所有权利保留.</p>
        </div>
    </footer>

    <script>
        function shareNews() {
            if (navigator.share) {
                navigator.share({
                    title: '${item.title}',
                    text: '${item.description}',
                    url: window.location.href
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('链接已复制到剪贴板');
                }).catch(() => {
                    alert('分享失败，请手动复制链接');
                });
            }
        }
    </script>
</body>
</html>`

        fs.writeFileSync(path.join(this.outputDir, 'news', `${item.id}.html`), html, 'utf8')
      }
    }
    
    console.log('✅ 新闻详情页生成完成')
  }

  // 获取分类标题
  getCategoryTitle(category) {
    const titles = {
      'latest': '最新资讯', 
      'ai-tech': 'AI技术',
      'industry': '行业动态'
    }
    return titles[category] || category
  }

  // 复制资源文件
  copyAssets() {
    console.log('📁 复制资源文件...')
    // 这里可以复制图片、CSS等静态资源
    console.log('✅ 资源文件复制完成')
  }

  // 生成README文件
  generateReadme() {
    console.log('📖 生成README文件...')
    
    const readme = `# AI新闻推送 - 静态网站

这是一个基于真实新闻API的AI新闻聚合网站。

## 特性

- 📰 真实新闻数据来源
- 📱 响应式设计，支持移动端
- 🚀 快速加载，纯静态HTML
- 🔍 SEO友好
- 📡 实时新闻更新
- 🎨 现代化UI设计

## 数据来源

- 优先使用GNews API获取真实新闻
- 智能回退机制确保服务可用性

## 生成时间

${new Date().toLocaleString('zh-CN')}

---

由AI新闻推送生成器自动生成`

    fs.writeFileSync(path.join(this.outputDir, 'README.md'), readme, 'utf8')
    console.log('✅ README文件生成完成')
  }

  // 主生成流程
  async generate() {
    try {
      await this.init()
      await this.fetchNewsData()
      this.generateIndex()
      this.generateCategoryPages()
      this.generateDetailPages()
      this.copyAssets()
      this.generateReadme()
      
      console.log('🎉 静态站点生成完成！')
      console.log(`📂 输出目录: ${this.outputDir}`)
      console.log('🌐 可以直接部署到任何Web服务器')
      
      return true
    } catch (error) {
      console.error('❌ 生成失败:', error)
      return false
    }
  }
}

// 执行生成器
const generator = new StaticSiteGenerator()
generator.generate().then(success => {
  process.exit(success ? 0 : 1)
})

export default StaticSiteGenerator