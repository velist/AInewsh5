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

  // 获取新闻数据（模拟API调用）
  async fetchNewsData() {
    console.log('📡 获取新闻数据...')
    
    try {
      // 模拟新闻数据（实际使用时可以调用真实API）
      const mockNews = {
        latest: [
          {
            id: 'latest_1',
            title: 'OpenAI发布GPT-5，性能大幅提升',
            description: 'OpenAI最新发布的GPT-5在多个基准测试中表现优异，推理能力和创造性显著增强。该模型在理解复杂指令、代码生成和多语言处理方面都有重大改进。',
            content: `<p>OpenAI最新发布的GPT-5在多个基准测试中表现优异，推理能力和创造性显著增强。</p>
                     <p>该模型在理解复杂指令、代码生成和多语言处理方面都有重大改进。研究人员表示，GPT-5在逻辑推理、数学计算和创造性写作等方面的表现接近人类水平。</p>
                     <p>此外，GPT-5还具备更好的安全性和可控性，减少了有害内容的生成。OpenAI表示，该模型将逐步向开发者和企业用户开放。</p>`,
            source: 'AI科技日报',
            publishedAt: new Date().toISOString(),
            image: 'https://via.placeholder.com/400x200',
            category: 'latest',
            url: '#'
          },
          {
            id: 'latest_2',
            title: '谷歌推出新一代AI模型Gemini Ultra',
            description: '谷歌宣布Gemini Ultra在数学、推理和代码生成方面超越了现有模型，标志着AI技术的新突破。',
            content: `<p>谷歌宣布Gemini Ultra在数学、推理和代码生成方面超越了现有模型，标志着AI技术的新突破。</p>
                     <p>Gemini Ultra是谷歌Gemini系列中最强大的模型，在多项权威基准测试中取得了前所未有的成绩。特别是在数学推理、科学理解和复杂问题解决方面表现突出。</p>
                     <p>谷歌表示，Gemini Ultra将被集成到搜索、Workspace等各种产品中，为用户提供更智能的服务。</p>`,
            source: 'AI新闻周刊',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            image: 'https://via.placeholder.com/400x200',
            category: 'latest',
            url: '#'
          }
        ],
        'ai-tech': [
          {
            id: 'ai_tech_1',
            title: 'Meta开源LLaMA 3，商用可用',
            description: 'Meta发布了LLaMA 3系列模型，性能强劲且允许商业使用，为AI开发者提供新选择。',
            content: `<p>Meta发布了LLaMA 3系列模型，性能强劲且允许商业使用，为AI开发者提供新选择。</p>
                     <p>LLaMA 3在多个基准测试中表现优异，模型规模从8B到70B不等。与前代相比，LLaMA 3在推理能力、代码生成和多语言理解方面都有显著提升。</p>
                     <p>特别值得注意的是，Meta允许LLaMA 3用于商业用途，这将为企业和开发者提供更多选择。</p>`,
            source: '机器之心',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            image: 'https://via.placeholder.com/400x200',
            category: 'ai-tech',
            url: '#'
          }
        ],
        industry: [
          {
            id: 'industry_1',
            title: 'AI芯片市场竞争加剧',
            description: '英伟达、AMD、英特尔等芯片巨头在AI芯片领域展开激烈竞争，推动技术快速发展。',
            content: `<p>英伟达、AMD、英特尔等芯片巨头在AI芯片领域展开激烈竞争，推动技术快速发展。</p>
                     <p>随着AI应用的普及，对专用AI芯片的需求急剧增长。英伟达凭借其GPU架构占据主导地位，但AMD和英特尔也在积极推出更具竞争力的产品。</p>
                     <p>分析师认为，AI芯片市场将在未来几年保持高速增长，各家厂商的技术竞争将受益于整个行业。</p>`,
            source: '财经科技',
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            image: 'https://via.placeholder.com/400x200',
            category: 'industry',
            url: '#'
          }
        ]
      }

      this.newsData = mockNews
      console.log('✅ 新闻数据获取完成')
    } catch (error) {
      console.error('❌ 获取新闻数据失败:', error)
      // 使用默认数据
      this.newsData = this.getDefaultNews()
    }
  }

  // 获取默认新闻数据
  getDefaultNews() {
    return {
      latest: [
        {
          id: 'default_1',
          title: 'AI技术持续发展',
          description: '人工智能技术在各个领域持续取得突破',
          content: '<p>人工智能技术在各个领域持续取得突破。</p>',
          source: 'AI新闻',
          publishedAt: new Date().toISOString(),
          category: 'latest'
        }
      ]
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
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav a:hover {
  background-color: rgba(255,255,255,0.2);
}

.nav a.active {
  background-color: rgba(255,255,255,0.3);
}

/* News Card */
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
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.news-detail-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.news-detail-content {
  line-height: 1.8;
  color: #333;
}

.news-detail-content p {
  margin-bottom: 1rem;
}

.news-detail-content h2 {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem 0;
  color: #2c3e50;
}

.news-detail-content h3 {
  font-size: 1.25rem;
  margin: 1.25rem 0 0.75rem 0;
  color: #34495e;
}

/* Footer */
.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 2rem 0;
  margin-top: 3rem;
}

/* Loading */
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* Responsive */
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
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-button {
  background: #667eea;
  color: white;
}

.primary-button:hover {
  background: #5a6fd8;
}

.secondary-button {
  background: #6c757d;
  color: white;
}

.secondary-button:hover {
  background: #5a6169;
}
    `
  }

  // 生成首页
  generateIndex() {
    console.log('🏠 生成首页...')
    
    const css = this.generateCSS()
    const newsCards = this.newsData.latest.map(news => this.generateNewsCard(news)).join('')
    
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
                <a href="/" class="active">首页</a>
                <a href="/ai-tech.html">AI技术</a>
                <a href="/industry.html">行业动态</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <div class="category-tabs">
            <div class="category-tab active" onclick="location.href='/'">最新资讯</div>
            <div class="category-tab" onclick="location.href='/ai-tech.html'">AI技术</div>
            <div class="category-tab" onclick="location.href='/industry.html'">行业动态</div>
        </div>

        <div id="news-container">
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
        // 简单的交互功能
        document.addEventListener('DOMContentLoaded', function() {
            // 模拟实时更新时间
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
            setInterval(updateTimes, 60000); // 每分钟更新一次
        });
    </script>
</body>
</html>`

    fs.writeFileSync(path.join(this.outputDir, 'index.html'), html, 'utf8')
    console.log('✅ 首页生成完成')
  }

  // 生成新闻卡片HTML
  generateNewsCard(news) {
    return `
        <article class="news-card">
            <div class="news-card-header">
                <div class="news-card-content">
                    <h2 class="news-card-title">
                        <a href="/news/${news.id}.html" style="color: inherit; text-decoration: none;">
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
                ${news.image ? `<img src="${news.image}" alt="${news.title}" class="news-card-image">` : ''}
            </div>
        </article>
    `
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
                <a href="/">首页</a>
                <a href="/ai-tech.html" ${category === 'ai-tech' ? 'class="active"' : ''}>AI技术</a>
                <a href="/industry.html" ${category === 'industry' ? 'class="active"' : ''}>行业动态</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <div class="category-tabs">
            <div class="category-tab" onclick="location.href='/'">最新资讯</div>
            <div class="category-tab ${category === 'ai-tech' ? 'active' : ''}" onclick="location.href='/ai-tech.html'">AI技术</div>
            <div class="category-tab ${category === 'industry' ? 'active' : ''}" onclick="location.href='/industry.html'">行业动态</div>
        </div>

        <div id="news-container">
            ${newsCards || '<p class="loading">暂无新闻</p>'}
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 AI新闻推送. 所有权利保留.</p>
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

      fs.writeFileSync(path.join(this.outputDir, `${category}.html`), html, 'utf8')
      console.log(`✅ ${category}页面生成完成`)
    }
  }

  // 获取分类标题
  getCategoryTitle(category) {
    const titles = {
      'latest': '最新资讯',
      'ai-tech': 'AI技术',
      'industry': '行业动态'
    }
    return titles[category] || '新闻'
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
                <a href="/">首页</a>
                <a href="/ai-tech.html">AI技术</a>
                <a href="/industry.html">行业动态</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <a href="/" class="back-button">← 返回首页</a>
        
        <article class="news-detail">
            <h1 class="news-detail-title">${item.title}</h1>
            
            <div class="news-detail-meta">
                <span class="news-card-source">${item.source}</span>
                <span class="news-card-time">${new Date(item.publishedAt).toLocaleString('zh-CN')}</span>
            </div>
            
            ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 2rem;">` : ''}
            
            <div class="news-detail-content">
                ${item.content}
            </div>
            
            <div class="action-buttons">
                <a href="/" class="action-button primary-button">查看更多新闻</a>
                ${item.url && item.url !== '#' ? `<a href="${item.url}" class="action-button secondary-button" target="_blank">查看原文</a>` : ''}
            </div>
        </article>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 AI新闻推送. 所有权利保留.</p>
        </div>
    </footer>

    <script>
        // 分享功能
        document.addEventListener('DOMContentLoaded', function() {
            // 检查是否支持Web Share API
            if (navigator.share) {
                document.addEventListener('click', function(e) {
                    if (e.target.closest('.share-button')) {
                        e.preventDefault();
                        navigator.share({
                            title: '${item.title}',
                            text: '${item.description}',
                            url: window.location.href
                        });
                    }
                });
            }
        });
    </script>
</body>
</html>`

        fs.writeFileSync(path.join(this.outputDir, 'news', `${item.id}.html`), html, 'utf8')
      }
    }
    
    console.log('✅ 新闻详情页生成完成')
  }

  // 生成复制资源
  copyAssets() {
    console.log('📁 复制资源文件...')
    
    // 如果有public目录，复制其中的资源
    if (fs.existsSync(this.publicDir)) {
      const files = fs.readdirSync(this.publicDir)
      files.forEach(file => {
        const srcPath = path.join(this.publicDir, file)
        const destPath = path.join(this.outputDir, file)
        
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath)
        }
      })
    }
    
    console.log('✅ 资源文件复制完成')
  }

  // 生成README文件
  generateReadme() {
    console.log('📖 生成README文件...')
    
    const readme = `# AI新闻推送静态站点

本目录包含生成的静态HTML文件，可以直接部署到任何Web服务器。

## 文件结构

- \`index.html\` - 首页（最新资讯）
- \`ai-tech.html\` - AI技术分类页面
- \`industry.html\` - 行业动态分类页面
- \`news/\` - 新闻详情页目录
- \`assets/\` - 资源文件目录

## 部署方法

### GitHub Pages
1. 将整个目录推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择根目录作为发布源

### 其他静态托管服务
- Netlify
- Vercel
- 腾讯云COS
- 阿里云OSS

## 特性

- 📱 响应式设计，支持移动端
- 🚀 快速加载，纯静态HTML
- 🔍 SEO友好
- 📡 模拟实时新闻更新
- 🎨 现代化UI设计

## 生成时间

${new Date().toLocaleString('zh-CN')}

---

由AI新闻推送生成器自动生成
`

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

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new StaticSiteGenerator()
  generator.generate().then(success => {
    process.exit(success ? 0 : 1)
  })
}

export default StaticSiteGenerator