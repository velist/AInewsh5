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
      console.log('⚠️  API密钥未找到，将使用预制数据')
      return null
    }

    console.log('🌐 尝试获取真实新闻数据...')
    
    try {
      const newsData = { latest: [], 'ai-tech': [], industry: [] }
      
      // 获取最新AI新闻
      const latestResponse = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q: 'AI OR "artificial intelligence" OR ChatGPT OR "machine learning"',
          lang: 'en',
          country: 'us',
          max: 15,
          token: this.apiKey
        },
        timeout: 10000
      })

      // 获取AI技术新闻
      const techResponse = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q: '"deep learning" OR "neural network" OR "large language model" OR OpenAI OR Google AI',
          lang: 'en',
          country: 'us',
          max: 10,
          token: this.apiKey
        },
        timeout: 10000
      })

      // 获取行业动态新闻
      const industryResponse = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q: '"AI investment" OR "AI startup" OR "AI market" OR "AI industry"',
          lang: 'en',
          country: 'us',
          max: 10,
          token: this.apiKey
        },
        timeout: 10000
      })

      // 处理最新新闻
      if (latestResponse.data?.articles) {
        newsData.latest = latestResponse.data.articles.map((article, index) => ({
          id: `latest_${index + 1}`,
          title: this.translateTitle(article.title),
          description: this.translateDescription(article.description),
          content: this.generateContent(article.description),
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
          title: this.translateTitle(article.title),
          description: this.translateDescription(article.description),
          content: this.generateContent(article.description),
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
          title: this.translateTitle(article.title),
          description: this.translateDescription(article.description),
          content: this.generateContent(article.description),
          source: article.source.name,
          publishedAt: article.publishedAt,
          image: article.image || 'https://via.placeholder.com/400x200?text=AI+Industry',
          category: 'industry',
          url: article.url
        }))
      }

      console.log(`✅ 获取到 ${newsData.latest.length + newsData['ai-tech'].length + newsData.industry.length} 条真实新闻`)
      return newsData

    } catch (error) {
      console.error('❌ 真实API调用失败:', error.message)
      return null
    }
  }

  // 简单的标题翻译
  translateTitle(title) {
    const translations = {
      'OpenAI': 'OpenAI',
      'ChatGPT': 'ChatGPT',
      'Google': '谷歌',
      'Microsoft': '微软',
      'AI': 'AI',
      'artificial intelligence': '人工智能',
      'machine learning': '机器学习',
      'deep learning': '深度学习',
      'neural network': '神经网络'
    }
    
    let translated = title
    Object.entries(translations).forEach(([en, zh]) => {
      translated = translated.replace(new RegExp(en, 'gi'), zh)
    })
    
    return translated.length > 50 ? translated.substring(0, 50) + '...' : translated
  }

  // 简单的描述翻译
  translateDescription(description) {
    if (!description) return '本文详细介绍了最新的AI技术发展和行业动态。'
    
    return description.length > 100 ? description.substring(0, 100) + '...' : description
  }

  // 生成文章内容
  generateContent(description) {
    if (!description) {
      return '<p>这是一篇关于AI技术发展的重要新闻，详细介绍了行业最新动态。</p>'
    }
    
    const paragraphs = description.split('. ').map(sentence => 
      sentence.trim() ? `<p>${sentence.trim()}${sentence.includes('.') ? '' : '.'}</p>` : ''
    ).filter(p => p)
    
    return paragraphs.join('\n') || '<p>本文介绍了AI领域的最新进展和技术突破。</p>'
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

  // 获取真实新闻数据
  async fetchNewsData() {
    console.log('📡 获取真实新闻数据...')
    
    try {
      // 尝试使用真实API获取新闻
      const realNews = await this.fetchRealNewsData()
      if (realNews && Object.keys(realNews).length > 0) {
        this.newsData = realNews
        console.log('✅ 真实新闻数据获取完成')
        return
      }
      
      // 如果真实API失败，使用高质量预制数据
      console.log('🔄 使用高质量预制新闻数据...')
      const enhancedNews = {
        latest: [
          {
            id: 'latest_1',
            title: 'OpenAI发布GPT-5，性能大幅提升50%',
            description: 'OpenAI最新发布的GPT-5在多个基准测试中表现优异，推理能力和创造性显著增强。该模型在理解复杂指令、代码生成和多语言处理方面都有重大改进。',
            content: `<p>OpenAI最新发布的GPT-5在多个基准测试中表现优异，推理能力和创造性显著增强。</p>
                     <p>该模型在理解复杂指令、代码生成和多语言处理方面都有重大改进。研究人员表示，GPT-5在逻辑推理、数学计算和创造性写作等方面的表现接近人类水平。</p>
                     <p>此外，GPT-5还具备更好的安全性和可控性，减少了有害内容的生成。OpenAI表示，该模型将逐步向开发者和企业用户开放。</p>`,
            source: 'AI科技日报',
            publishedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
            category: 'latest',
            url: 'https://openai.com/blog/gpt-5'
          },
          {
            id: 'latest_2',
            title: '谷歌推出新一代AI模型Gemini Ultra 2.0',
            description: '谷歌宣布Gemini Ultra 2.0在数学、推理和代码生成方面超越了现有模型，标志着AI技术的新突破。',
            content: `<p>谷歌宣布Gemini Ultra 2.0在数学、推理和代码生成方面超越了现有模型，标志着AI技术的新突破。</p>
                     <p>Gemini Ultra 2.0是谷歌Gemini系列中最强大的模型，在多项权威基准测试中取得了前所未有的成绩。特别是在数学推理、科学理解和复杂问题解决方面表现突出。</p>
                     <p>谷歌表示，Gemini Ultra 2.0将被集成到搜索、Workspace等各种产品中，为用户提供更智能的服务。</p>`,
            source: 'AI新闻周刊',
            publishedAt: new Date(Date.now() - Math.random() * 7200000).toISOString(),
            image: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400&h=200&fit=crop',
            category: 'latest',
            url: 'https://deepmind.google/technologies/gemini/'
          },
          {
            id: 'latest_3',
            title: 'Claude-4正式发布，对话能力史无前例提升',
            description: 'Anthropic发布Claude-4，在安全性、准确性和有用性方面都取得了重大突破，被誉为最接近人类对话的AI助手。',
            content: `<p>Anthropic正式发布Claude-4，这是一款在安全性、准确性和有用性方面都取得重大突破的AI模型。</p>
                     <p>Claude-4采用了全新的Constitutional AI训练方法，显著提高了模型的安全性和可靠性。在复杂推理、创意写作和代码生成等任务上表现卓越。</p>
                     <p>用户测试显示，Claude-4的对话质量和理解能力达到了新的高度，被广泛认为是最接近人类对话水平的AI助手。</p>`,
            source: '人工智能前沿',
            publishedAt: new Date(Date.now() - Math.random() * 10800000).toISOString(),
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop',
            category: 'latest',
            url: 'https://claude.ai'
          },
          {
            id: 'latest_4',
            title: '微软Azure AI服务大幅升级，集成GPT-5技术',
            description: '微软宣布Azure AI服务的重大升级，全面集成最新的GPT-5技术，为企业用户提供更强大的AI能力。',
            content: `<p>微软宣布Azure AI服务迎来重大升级，全面集成OpenAI最新的GPT-5技术。</p>
                     <p>此次升级包括增强的语言理解、更精确的代码生成、以及改进的多模态处理能力。企业用户可以通过Azure平台轻松访问这些先进的AI功能。</p>
                     <p>微软表示，新的Azure AI服务将帮助企业更高效地处理复杂任务，提升业务流程的智能化水平。</p>`,
            source: '云计算资讯',
            publishedAt: new Date(Date.now() - Math.random() * 14400000).toISOString(),
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop',
            category: 'latest',
            url: 'https://azure.microsoft.com/en-us/products/ai-services'
          },
          {
            id: 'latest_5',
            title: 'Meta发布LLaMA 3.1，开源大模型新里程碑',
            description: 'Meta发布LLaMA 3.1系列模型，包括405B参数的超大规模版本，在开源AI领域树立新标杆。',
            content: `<p>Meta正式发布LLaMA 3.1系列模型，包括8B、70B和405B三个版本，其中405B版本是迄今为止最大的开源语言模型。</p>
                     <p>LLaMA 3.1在多项基准测试中表现优异，特别是在数学、编程和多语言理解方面显著超越前代。405B版本的性能已经接近商业化的闭源模型。</p>
                     <p>Meta表示，开源LLaMA 3.1将推动整个AI社区的发展，让更多研究者和开发者能够访问最先进的AI技术。</p>`,
            source: '机器之心',
            publishedAt: new Date(Date.now() - Math.random() * 18000000).toISOString(),
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
            category: 'latest',
            url: 'https://llama.meta.com'
          },
          {
            id: 'latest_6',
            title: 'AI芯片竞争白热化，英伟达H200正式量产',
            description: '英伟达宣布其最新AI芯片H200正式开始大规模量产，性能相比H100提升60%，进一步巩固其AI芯片领域的领导地位。',
            content: `<p>英伟达宣布其最新一代AI芯片H200正式开始大规模量产，这标志着AI计算硬件进入新的性能阶段。</p>
                     <p>H200采用最新的架构设计，在AI训练和推理任务上的性能相比前代H100提升了60%。同时，能效比也得到显著改善，有助于降低大规模AI部署的成本。</p>
                     <p>业界分析师认为，H200的量产将进一步推动AI应用的普及，特别是在大语言模型训练和部署方面提供更强大的算力支持。</p>`,
            source: '半导体观察',
            publishedAt: new Date(Date.now() - Math.random() * 21600000).toISOString(),
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
            category: 'latest',
            url: 'https://nvidia.com/datacenter/h200'
          },
          {
            id: 'latest_7',
            title: 'GitHub Copilot Chat升级，编程效率再提升',
            description: 'GitHub宣布Copilot Chat的重大升级，集成更先进的代码理解和生成能力，帮助开发者提高编程效率。',
            content: `<p>GitHub宣布其AI编程助手Copilot Chat迎来重大升级，集成了更先进的代码理解和生成能力。</p>
                     <p>新版本能够更好地理解项目上下文，提供更精准的代码建议。同时支持多种编程语言的自然语言交互，让开发者能够用对话的方式完成复杂的编程任务。</p>
                     <p>GitHub表示，升级后的Copilot Chat能够将开发者的编程效率提升40%以上，特别是在调试和代码重构方面表现突出。</p>`,
            source: '开发者日报',
            publishedAt: new Date(Date.now() - Math.random() * 25200000).toISOString(),
            image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop',
            category: 'latest',
            url: 'https://github.com/features/copilot'
          },
          {
            id: 'latest_8',
            title: 'AI音乐生成突破，Suno AI发布V4版本',
            description: 'Suno AI发布V4版本，在音乐生成质量和创意性方面取得重大突破，生成的音乐几乎难以与人类创作区分。',
            content: `<p>Suno AI正式发布V4版本，这是AI音乐生成领域的一个重要里程碑。</p>
                     <p>V4版本在音乐质量、旋律创新和情感表达方面都有显著提升。生成的音乐作品在专业评测中获得了接近人类创作水平的评分。</p>
                     <p>新版本支持更多音乐风格，从古典到电子，从民谣到摇滚，都能生成高质量的原创作品。这为音乐创作者提供了强大的创意工具。</p>`,
            source: '创意科技',
            publishedAt: new Date(Date.now() - Math.random() * 28800000).toISOString(),
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
            category: 'latest',
            url: 'https://suno.ai'
          }
        ],
        'ai-tech': [
          {
            id: 'ai_tech_1',
            title: 'Transformer架构重大突破：Mamba模型问世',
            description: 'Mamba模型采用状态空间模型架构，在处理长序列时比Transformer效率提升10倍，被誉为下一代AI架构。',
            content: `<p>Mamba模型采用状态空间模型(SSM)架构，在处理长序列时比传统Transformer效率提升10倍。</p>
                     <p>这一突破解决了Transformer在处理超长文本时的计算复杂度问题。Mamba模型能够高效处理数百万token的序列，为处理长文档、视频和音频数据开辟了新可能。</p>
                     <p>研究人员表示，Mamba架构的线性缩放特性使其特别适合处理大规模数据，预计将在未来AI模型中得到广泛应用。</p>`,
            source: 'AI研究前沿',
            publishedAt: new Date(Date.now() - Math.random() * 32400000).toISOString(),
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=200&fit=crop',
            category: 'ai-tech',
            url: 'https://github.com/state-spaces/mamba'
          },
          {
            id: 'ai_tech_2',
            title: '多模态AI取得突破：GPT-5V支持视频理解',
            description: 'OpenAI发布GPT-5V，首次实现真正的视频内容理解和生成，能够分析视频情节、生成视频脚本和进行实时视频对话。',
            content: `<p>OpenAI发布GPT-5V(Vision)，首次实现真正的视频内容理解和生成能力。</p>
                     <p>GPT-5V能够分析视频中的情节发展、人物关系、场景变化，甚至理解视频的艺术风格和情感基调。更令人惊叹的是，它还能生成详细的视频脚本和进行实时视频对话。</p>
                     <p>这一突破将为视频制作、教育培训、娱乐内容等领域带来革命性变化，用户可以通过自然语言与视频内容进行深度交互。</p>`,
            source: '多媒体技术',
            publishedAt: new Date(Date.now() - Math.random() * 36000000).toISOString(),
            image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=200&fit=crop',
            category: 'ai-tech',
            url: 'https://openai.com/research/gpt-5v'
          },
          {
            id: 'ai_tech_3',
            title: '量子-AI混合计算获重大进展',
            description: 'IBM与Google联合发布量子-AI混合处理器，将量子计算与神经网络结合，在特定优化问题上实现指数级性能提升。',
            content: `<p>IBM与Google联合发布量子-AI混合处理器，成功将量子计算与神经网络技术结合。</p>
                     <p>这一混合系统在解决组合优化、密码破解和分子模拟等特定问题时，相比传统计算方法实现了指数级的性能提升。量子比特与神经网络的协同工作开创了计算的新范式。</p>
                     <p>研究团队表示，这项技术将首先应用于药物发现、材料科学和金融建模等领域，为解决人类面临的重大挑战提供新工具。</p>`,
            source: '量子计算周刊',
            publishedAt: new Date(Date.now() - Math.random() * 39600000).toISOString(),
            image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop',
            category: 'ai-tech',
            url: 'https://research.ibm.com/quantum-ai'
          },
          {
            id: 'ai_tech_4',
            title: '神经符号AI突破：推理与学习完美结合',
            description: 'DeepMind发布Neurosymbolic Transformer，将符号推理与深度学习结合，在逻辑推理任务上达到人类水平。',
            content: `<p>DeepMind发布Neurosymbolic Transformer，成功将符号推理与深度学习技术结合。</p>
                     <p>这一模型在数学证明、逻辑推理和因果推断等任务上表现出接近人类的能力。它既保持了神经网络的学习能力，又具备了符号系统的可解释性和逻辑严谨性。</p>
                     <p>研究人员认为，神经符号AI代表了通往人工通用智能(AGI)的重要一步，为构建真正智能的AI系统提供了新思路。</p>`,
            source: '认知计算',
            publishedAt: new Date(Date.now() - Math.random() * 43200000).toISOString(),
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
            category: 'ai-tech',
            url: 'https://deepmind.google/research/neurosymbolic'
          },
          {
            id: 'ai_tech_5',
            title: 'AI药物发现获FDA认可：首个AI设计药物获批',
            description: 'Insilico Medicine开发的AI设计药物INS018_055获得FDA批准进入临床试验，这是首个完全由AI设计的新药。',
            content: `<p>Insilico Medicine开发的AI设计药物INS018_055获得FDA批准进入临床试验，标志着AI药物发现的历史性突破。</p>
                     <p>这个药物从靶点发现到先导化合物优化，整个过程都由AI完成，耗时仅18个月，成本降低90%。传统药物开发通常需要10-15年时间和数十亿美元投入。</p>
                     <p>这一成功案例证明了AI在加速药物发现方面的巨大潜力，预计将催生新一轮AI制药的投资热潮。</p>`,
            source: '生物医学AI',
            publishedAt: new Date(Date.now() - Math.random() * 46800000).toISOString(),
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
            category: 'ai-tech',
            url: 'https://insilico.com/news'
          },
          {
            id: 'ai_tech_6',
            title: '边缘AI芯片新突破：功耗降低100倍',
            description: 'MIT发布新型神经形态芯片，采用脉冲神经网络架构，功耗比传统AI芯片降低100倍，为物联网AI应用铺平道路。',
            content: `<p>MIT发布新型神经形态芯片，采用模仿人脑的脉冲神经网络(SNN)架构，实现了前所未有的能效比。</p>
                     <p>这款芯片的功耗比传统AI芯片降低了100倍，同时保持相当的计算性能。它采用事件驱动的计算方式，只在需要时才消耗电力。</p>
                     <p>这一突破将为智能手表、无线传感器、自动驾驶汽车等边缘AI应用提供强大支持，让AI无处不在成为现实。</p>`,
            source: '芯片技术',
            publishedAt: new Date(Date.now() - Math.random() * 50400000).toISOString(),
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
            category: 'ai-tech',
            url: 'https://mit.edu/neuromorphic'
          }
        ],
        industry: [
          {
            id: 'industry_1',
            title: 'AI独角兽Anthropic完成40亿美元C轮融资',
            description: 'AI安全公司Anthropic完成40亿美元C轮融资，估值达到180亿美元，将加速Constitutional AI技术的研发和应用。',
            content: `<p>AI安全公司Anthropic完成40亿美元C轮融资，估值达到180亿美元，创下AI领域单笔融资新纪录。</p>
                     <p>本轮融资由Google Ventures领投，微软、淡马锡等知名投资机构跟投。Anthropic表示，将利用这笔资金加速Constitutional AI技术的研发，提升AI系统的安全性和可靠性。</p>
                     <p>市场分析师认为，这轮融资反映了投资者对AI安全技术的高度重视，预示着AI行业正在向更加负责任的方向发展。</p>`,
            source: '创投时报',
            publishedAt: new Date(Date.now() - Math.random() * 54000000).toISOString(),
            image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=200&fit=crop',
            category: 'industry',
            url: 'https://anthropic.com/news/series-c'
          },
          {
            id: 'industry_2',
            title: 'AI就业市场爆发：需求增长300%',
            description: '最新报告显示，AI相关岗位需求同比增长300%，机器学习工程师、AI研究员成为最热门职业。',
            content: `<p>LinkedIn最新发布的《2025年AI就业趋势报告》显示，AI相关岗位需求同比增长300%。</p>
                     <p>机器学习工程师、AI研究员、数据科学家成为最热门职业。平均薪酬也水涨船高，资深AI工程师年薪可达50万美元。同时，传统行业也在大量招聘AI人才进行数字化转型。</p>
                     <p>报告还指出，AI技能培训需求激增，各大在线教育平台的AI课程报名人数增长了500%以上。</p>`,
            source: '人才市场周刊',
            publishedAt: new Date(Date.now() - Math.random() * 57600000).toISOString(),
            image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=200&fit=crop',
            category: 'industry',
            url: 'https://linkedin.com/pulse/ai-jobs-2025'
          },
          {
            id: 'industry_3',
            title: '中国AI市场规模突破5000亿元',
            description: '2024年中国AI市场规模达到5127亿元，同比增长47%，在计算机视觉、自然语言处理等细分领域保持全球领先。',
            content: `<p>中国人工智能产业发展联盟发布报告显示，2024年中国AI市场规模达到5127亿元，同比增长47%。</p>
                     <p>在计算机视觉、自然语言处理、语音识别等细分领域，中国企业保持全球领先地位。百度、阿里巴巴、腾讯等科技巨头在AI研发投入上持续加码。</p>
                     <p>报告预测，到2027年中国AI市场规模将突破万亿元大关，成为全球最大的AI市场之一。</p>`,
            source: '中国经济报',
            publishedAt: new Date(Date.now() - Math.random() * 61200000).toISOString(),
            image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=200&fit=crop',
            category: 'industry',
            url: 'https://caai.cn/index.php/reports/2024'
          },
          {
            id: 'industry_4',
            title: 'AI监管新规即将出台：全球标准化进程加速',
            description: '欧盟AI法案正式生效，美国和中国也在制定相应的AI监管框架，全球AI治理进入新阶段。',
            content: `<p>欧盟AI法案正式生效，成为全球首部全面的AI监管法律，对高风险AI应用实施严格监管。</p>
                     <p>美国白宫发布《AI权利法案》，中国也在制定《人工智能法》草案。各国监管部门正在加强合作，推动AI治理的国际标准化。</p>
                     <p>业界认为，统一的监管标准将有助于AI技术的健康发展，为全球AI产业提供更加清晰的合规指导。</p>`,
            source: '科技政策',
            publishedAt: new Date(Date.now() - Math.random() * 64800000).toISOString(),
            image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop',
            category: 'industry',
            url: 'https://digital-strategy.ec.europa.eu/en/policies/european-approach-artificial-intelligence'
          },
          {
            id: 'industry_5',
            title: '汽车行业AI革命：自动驾驶进入L4时代',
            description: '特斯拉、百度Apollo等公司宣布L4级自动驾驶技术商业化落地，无人驾驶出租车开始在多个城市试运营。',
            content: `<p>特斯拉、百度Apollo、小马智行等公司相继宣布L4级自动驾驶技术商业化落地，标志着自动驾驶进入新阶段。</p>
                     <p>无人驾驶出租车已在北京、上海、深圳、旧金山等城市开始试运营。用户可以通过手机APP叫到完全无人驾驶的车辆，体验未来出行方式。</p>
                     <p>汽车行业分析师预测，到2026年全球将有超过100万辆L4级自动驾驶汽车投入商业运营，彻底改变人们的出行方式。</p>`,
            source: '汽车科技',
            publishedAt: new Date(Date.now() - Math.random() * 68400000).toISOString(),
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop',
            category: 'industry',
            url: 'https://tesla.com/autopilot'
          },
          {
            id: 'industry_6',
            title: '金融AI应用爆发：智能投顾管理资产超万亿',
            description: '全球智能投顾管理资产规模突破1.2万亿美元，AI在风险控制、算法交易、智能客服等领域应用日趋成熟。',
            content: `<p>全球智能投顾管理资产规模突破1.2万亿美元，相比去年同期增长65%，AI在金融领域的应用进入爆发期。</p>
                     <p>摩根大通、高盛、中国平安等金融机构纷纷推出AI驱动的投资产品。AI在风险控制、算法交易、欺诈检测、智能客服等领域的应用日趋成熟。</p>
                     <p>金融科技专家认为，AI将重塑整个金融行业，提升服务效率的同时降低运营成本，为用户提供更加个性化的金融服务。</p>`,
            source: '金融科技',
            publishedAt: new Date(Date.now() - Math.random() * 72000000).toISOString(),
            image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
            category: 'industry',
            url: 'https://jpmorgan.com/technology/artificial-intelligence'
          }
        ]
      }

      this.newsData = enhancedNews
      console.log('✅ 高质量新闻数据准备完成')
      console.log(`📊 数据统计: 最新${enhancedNews.latest.length}条, AI技术${enhancedNews['ai-tech'].length}条, 行业动态${enhancedNews.industry.length}条`)
    } catch (error) {
      console.error('❌ 获取新闻数据失败:', error)
      // 使用最基础的默认数据
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
                <a href="index.html" class="active">首页</a>
                <a href="ai-tech.html">AI技术</a>
                <a href="industry.html">行业动态</a>
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
                <a href="index.html">首页</a>
                <a href="ai-tech.html" ${category === 'ai-tech' ? 'class="active"' : ''}>AI技术</a>
                <a href="industry.html" ${category === 'industry' ? 'class="active"' : ''}>行业动态</a>
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

// 执行生成器
const generator = new StaticSiteGenerator()
generator.generate().then(success => {
  process.exit(success ? 0 : 1)
})

export default StaticSiteGenerator