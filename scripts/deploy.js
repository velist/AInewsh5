#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import StaticSiteGenerator from './generate-static.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 部署管理器类
class DeploymentManager {
  constructor() {
    this.staticDir = path.join(__dirname, '../dist-static')
    this.githubWorkflowsDir = path.join(__dirname, '../.github/workflows')
  }

  // 部署到GitHub Pages
  async deployToGitHubPages() {
    console.log('🚀 准备部署到GitHub Pages...')
    
    try {
      // 1. 生成静态站点
      const generator = new StaticSiteGenerator()
      await generator.generate()
      
      // 2. 创建GitHub Actions工作流
      await this.createGitHubActionsWorkflow()
      
      console.log('✅ GitHub Pages部署准备完成！')
      console.log('')
      console.log('📋 下一步操作：')
      console.log('1. 提交所有更改到Git')
      console.log('2. 在GitHub仓库设置中启用Pages')
      console.log('3. 选择GitHub Actions作为部署源')
      console.log('')
      console.log('🌐 访问地址：')
      console.log('https://<你的用户名>.github.io/AInewsh5/')
      
      return true
    } catch (error) {
      console.error('❌ 部署准备失败:', error)
      return false
    }
  }

  // 创建GitHub Actions工作流
  async createGitHubActionsWorkflow() {
    console.log('⚙️ 创建GitHub Actions工作流...')
    
    const workflowContent = `name: Deploy Static Site to GitHub Pages

on:
  push:
    branches: [ master ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Generate static site
      run: node scripts/generate-static.js
      
    - name: Setup Pages
      uses: actions/configure-pages@v4
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: ./dist-static
        
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4`

    // 确保workflows目录存在
    if (!fs.existsSync(this.githubWorkflowsDir)) {
      fs.mkdirSync(this.githubWorkflowsDir, { recursive: true })
    }

    const workflowPath = path.join(this.githubWorkflowsDir, 'deploy-static.yml')
    fs.writeFileSync(workflowPath, workflowContent, 'utf8')
    
    console.log('✅ GitHub Actions工作流创建完成')
  }

  // 部署到Netlify (手动部署)
  async prepareForNetlify() {
    console.log('🌊 准备部署到Netlify...')
    
    try {
      // 生成静态站点
      const generator = new StaticSiteGenerator()
      await generator.generate()
      
      // 创建netlify配置文件
      const netlifyConfig = {
        "build": {
          "publish": "dist-static",
          "command": "node scripts/generate-static.js"
        }
      }
      
      fs.writeFileSync(
        path.join(__dirname, '../netlify.toml'),
        JSON.stringify(netlifyConfig, null, 2),
        'utf8'
      )
      
      console.log('✅ Netlify部署准备完成！')
      console.log('')
      console.log('📋 部署步骤：')
      console.log('1. 注册/登录Netlify账户')
      console.log('2. 拖拽dist-static文件夹到Netlify')
      console.log('3. 或连接GitHub仓库自动部署')
      
      return true
    } catch (error) {
      console.error('❌ Netlify部署准备失败:', error)
      return false
    }
  }

  // 本地预览
  async preview() {
    console.log('👀 生成本地预览...')
    
    try {
      // 生成静态站点
      const generator = new StaticSiteGenerator()
      await generator.generate()
      
      // 创建简单的HTTP服务器脚本
      const serverScript = `import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 8080
const STATIC_DIR = path.join(__dirname, '../dist-static')

const server = http.createServer((req, res) => {
  let filePath = path.join(STATIC_DIR, req.url === '/' ? 'index.html' : req.url)
  
  // 添加.html扩展名
  if (!path.extname(filePath)) {
    filePath += '.html'
  }
  
  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end('<h1>404 - 页面未找到</h1>')
      return
    }
    
    // 读取文件
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' })
        res.end('<h1>500 - 服务器错误</h1>')
        return
      }
      
      // 设置Content-Type
      const ext = path.extname(filePath)
      const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon'
      }[ext] || 'application/octet-stream'
      
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(data)
    })
  })
})

server.listen(PORT, () => {
  console.log(\`\\n🚀 服务器运行在 http://localhost:\${PORT}\`)
  console.log('📱 首页: http://localhost:' + PORT + '/')
  console.log('🤖 AI技术: http://localhost:' + PORT + '/ai-tech.html')
  console.log('🏭 行业动态: http://localhost:' + PORT + '/industry.html')
  console.log('\\n按 Ctrl+C 停止服务器\\n')
})`

      fs.writeFileSync(path.join(__dirname, '../preview-server.js'), serverScript, 'utf8')
      
      console.log('✅ 本地预览准备完成！')
      console.log('')
      console.log('🚀 启动预览服务器:')
      console.log('node preview-server.js')
      console.log('')
      console.log('🌐 访问地址:')
      console.log('http://localhost:8080')
      
      return true
    } catch (error) {
      console.error('❌ 本地预览准备失败:', error)
      return false
    }
  }

  // 显示部署菜单
  async showMenu() {
    console.log('🎯 AI新闻推送 - 部署管理器')
    console.log('=' * 50)
    console.log('')
    console.log('请选择部署方式:')
    console.log('1. GitHub Pages (推荐)')
    console.log('2. Netlify')
    console.log('3. 本地预览')
    console.log('4. 只生成静态文件')
    console.log('5. 退出')
    console.log('')
    
    // 这里简化处理，直接执行GitHub Pages部署
    console.log('🔧 正在准备GitHub Pages部署...')
    await this.deployToGitHubPages()
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new DeploymentManager()
  manager.showMenu()
}

export default DeploymentManager