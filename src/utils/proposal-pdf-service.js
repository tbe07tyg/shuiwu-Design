/**
 * @file 申报书PDF服务
 * @description 处理申报书PDF转换和预览功能
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-29
 */

/**
 * 申报书PDF服务类
 */
export class ProposalPdfService {
  constructor() {
    this.baseUrl = '/api/v1/proposal'
    this.cache = new Map()
  }

  /**
   * 将申报书转换为PDF
   * @param {string} projectId - 项目ID
   * @returns {Promise<string>} PDF URL
   */
  async convertToPdf(projectId) {
    try {
      console.log('🔄 开始转换申报书为PDF:', projectId)
      
      // 检查缓存
      const cacheKey = `pdf_${projectId}`
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30分钟缓存
          console.log('📋 使用缓存的PDF URL:', cached.url)
          return cached.url
        }
      }
      
      // 调用后端API转换
      const response = await fetch(`${this.baseUrl}/convert-to-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId })
      })
      
      if (!response.ok) {
        throw new Error(`PDF转换失败: ${response.statusText}`)
      }
      
      const result = await response.json()
      const pdfUrl = result.data.pdfUrl
      
      // 缓存结果
      this.cache.set(cacheKey, {
        url: pdfUrl,
        timestamp: Date.now()
      })
      
      console.log('✅ PDF转换成功:', pdfUrl)
      return pdfUrl
      
    } catch (error) {
      console.error('❌ PDF转换失败:', error)
      
      // 返回模拟PDF URL用于开发测试
      const mockUrl = this.generateMockPdfUrl(projectId)
      console.log('🔧 使用模拟PDF URL:', mockUrl)
      return mockUrl
    }
  }

  /**
   * 获取PDF信息
   * @param {string} pdfUrl - PDF URL
   * @returns {Promise<Object>} PDF信息
   */
  async getPdfInfo(pdfUrl) {
    try {
      const response = await fetch(`${this.baseUrl}/pdf-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfUrl })
      })
      
      if (!response.ok) {
        throw new Error(`获取PDF信息失败: ${response.statusText}`)
      }
      
      const result = await response.json()
      return result.data
      
    } catch (error) {
      console.error('❌ 获取PDF信息失败:', error)
      
      // 返回模拟信息
      return {
        fileSize: 1024 * 1024 * 2, // 2MB
        pageCount: 15,
        createdAt: new Date().toISOString()
      }
    }
  }

  /**
   * 获取申报书原始内容
   * @param {string} projectId - 项目ID
   * @returns {Promise<string>} 申报书文本内容
   */
  async getProposalContent(projectId) {
    try {
      console.log('📖 获取申报书内容:', projectId)
      
      const response = await fetch(`${this.baseUrl}/content/${projectId}`)
      
      if (!response.ok) {
        throw new Error(`获取申报书内容失败: ${response.statusText}`)
      }
      
      const result = await response.json()
      return result.data.content
      
    } catch (error) {
      console.error('❌ 获取申报书内容失败:', error)
      
      // 返回模拟内容
      return this.generateMockProposalContent(projectId)
    }
  }

  /**
   * 上传申报书文件
   * @param {File} file - 申报书文件
   * @param {string} projectId - 项目ID
   * @returns {Promise<Object>} 上传结果
   */
  async uploadProposal(file, projectId) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)
      
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // 清除相关缓存
      this.clearCache(projectId)
      
      return result.data
      
    } catch (error) {
      console.error('❌ 上传申报书失败:', error)
      throw error
    }
  }

  /**
   * 检查申报书是否存在
   * @param {string} projectId - 项目ID
   * @returns {Promise<boolean>} 是否存在
   */
  async checkProposalExists(projectId) {
    try {
      const response = await fetch(`${this.baseUrl}/exists/${projectId}`)
      
      if (!response.ok) {
        return false
      }
      
      const result = await response.json()
      return result.data.exists
      
    } catch (error) {
      console.error('❌ 检查申报书存在性失败:', error)
      return false
    }
  }

  /**
   * 生成模拟PDF URL
   * @param {string} projectId - 项目ID
   * @returns {string} 模拟PDF URL
   */
  generateMockPdfUrl(projectId) {
    // 在实际开发中，这里可以返回一个示例PDF文件
    return `data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOmCjIgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNiAwIFIKPj4KPj4KPj4KZW5kb2JqCgo1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCijnlLPmiqXkuabnpLrkvovvvIkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKNiAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCgp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA3NCAwMDAwMCBuIAowMDAwMDAwMTIwIDAwMDAwIG4gCjAwMDAwMDAxNzkgMDAwMDAgbiAKMDAwMDAwMDM2NCAwMDAwMCBuIAowMDAwMDAwNDU4IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNwovUm9vdCAyIDAgUgo+PgpzdGFydHhyZWYKNTU2CiUlRU9G`
  }

  /**
   * 生成模拟申报书内容
   * @param {string} projectId - 项目ID
   * @returns {string} 模拟申报书内容
   */
  generateMockProposalContent(projectId) {
    return `项目名称：智能水务管理系统研发项目
申请单位：华北水利水电大学
项目负责人：张教授
协作单位：某科技公司
申报时间：2025-01-01

一、申请项目的依据和意义
随着城市化进程的加快，传统水务管理面临诸多挑战，包括数据分散、管理效率低下、决策缺乏科学依据等问题。本项目旨在通过物联网、大数据、人工智能等先进技术，构建智能化的水务管理系统，提升水务管理的现代化水平。

二、实施方案
本项目采用分阶段实施的方式：

第一阶段：需求分析和系统设计（1-6个月）
- 深入调研现有水务管理流程和痛点
- 完成系统总体架构设计
- 制定技术选型和开发规范
- 设计数据库结构和接口规范

第二阶段：核心功能开发（7-12个月）
- 开发数据采集和处理模块
- 实现核心业务管理功能
- 构建智能分析和预警系统
- 开发用户界面和交互功能

第三阶段：系统集成和测试（13-18个月）
- 进行系统集成和联调测试
- 开展用户培训和试运行
- 完善系统功能和性能优化
- 编写技术文档和用户手册

三、技术关键
1. 多源异构数据融合技术
2. 实时数据处理和分析算法
3. 智能预警和决策支持系统
4. 系统安全和数据保护机制

四、技术路线
数据采集 → 数据预处理 → 特征提取 → 智能分析 → 决策支持 → 结果展示

五、预期成果
1. 建成完整的智能水务管理平台
2. 形成一套水务数据标准和规范
3. 申请相关技术专利3-5项
4. 发表高质量学术论文5-8篇
5. 培养专业技术人才10-15名

六、实施本项目已具备的条件
项目团队具备丰富的水务管理和信息化建设经验，拥有完善的实验设备和开发环境，与多家水务企业建立了良好的合作关系。

七、项目实施的经济、社会和环境预期效益
经济效益：提高水务管理效率30%，降低运营成本20%
社会效益：提升公共服务质量，增强用户满意度
环境效益：优化水资源配置，减少水资源浪费

八、项目实施的计划进度
项目总工期18个月，分为三个阶段实施：
- 第一阶段（1-6个月）：需求分析和系统设计
- 第二阶段（7-12个月）：核心功能开发
- 第三阶段（13-18个月）：系统集成和测试`
  }

  /**
   * 清除缓存
   * @param {string} projectId - 项目ID
   */
  clearCache(projectId) {
    const cacheKey = `pdf_${projectId}`
    this.cache.delete(cacheKey)
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   * @returns {Object} 缓存统计信息
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalSize: Array.from(this.cache.values()).reduce((sum, item) => {
        return sum + (item.url ? item.url.length : 0)
      }, 0)
    }
  }
}

/**
 * 默认导出实例
 */
export default new ProposalPdfService()
