import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 8080
const STATIC_DIR = path.join(__dirname, 'dist-static')

const server = http.createServer((req, res) => {
  let filePath = path.join(STATIC_DIR, req.url === '/' ? 'index.html' : req.url)
  
  // 添加.html扩展名
  if (!path.extname(filePath)) {
    filePath += '.html'
  }
  
  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // 文件不存在，返回404
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('<h1>404 - 页面未找到</h1>')
      return
    }
    
    // 读取文件
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end('<h1>500 - 服务器错误</h1>')
        return
      }
      
      // 确定Content-Type
      const ext = path.extname(filePath)
      const contentType = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      }[ext] || 'application/octet-stream'
      
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(data)
    })
  })
})

server.listen(PORT, () => {
  console.log(`\n🚀 服务器运行在 http://localhost:${PORT}`)
  console.log('📱 首页: http://localhost:' + PORT + '/')
  console.log('🤖 AI技术: http://localhost:' + PORT + '/ai-tech.html')
  console.log('🏭 行业动态: http://localhost:' + PORT + '/industry.html')
  console.log('\n按 Ctrl+C 停止服务器\n')
})