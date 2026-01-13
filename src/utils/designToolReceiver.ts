import { NativeWindowMessenger } from '@/utils/nativeWindowMessenger'
import { setAdminConnected } from '@/store/stores/connectionStatus'
import { message } from 'ant-design-vue'
import { controllerOpenModelAndReplaceStickers } from '@/components/design/core/controller'
import { exitEditMode, enterEditMode } from '@/components/design/store'
import { saveCustomModel } from '@/components/design/layout/saveModel/index.ts'
import { uploadToCOS, createDraft, getCustomModelById } from '@/api'
import { currentModelController } from '@/components/design/store'

export interface DesignModelData {
  materialIds: string[]
  designModelIds: string[]
}

export class DesignToolReceiver {
  private messenger: NativeWindowMessenger | null = null
  private adminPingInterval: number | null = null
  private adminPingTimeout: number | null = null

  constructor() {
    this.initMessenger()
  }

  private initMessenger() {
    if (!window.opener) {
      console.log('不是子窗口，跳过初始化')
      return
    }

    this.messenger = new NativeWindowMessenger()
    // 主动告知父窗口已连接，提升连接鲁棒性
    this.messenger.send('connectionSuccess', '设计工具连接成功')
    
    // 监听父窗口请求
    this.messenger.on('testConnection', () => {
      console.log('收到父窗口测试消息')
      this.messenger?.send('connectionSuccess', '设计工具连接成功')
    })

    // 监听设计模型数据
    this.messenger.on('designModelData', (data: DesignModelData) => {
      console.log('收到设计模型数据:', data)
      this.handleDesignModelData(data)
    })

    // 监听“进入设计工具查看”消息
    this.messenger.on('openDesignModel', async (data: { designModelId: string }) => {
      if (data && data.designModelId) {
        try {
          const modelInfo = (await getCustomModelById(data.designModelId)).meta.modelInfo
          enterEditMode(data.designModelId, modelInfo)
          if (currentModelController.value && currentModelController.value.useModelInfo) {
            await currentModelController.value.useModelInfo(modelInfo)
          }
          message.success(`已打开模型 ${data.designModelId} 并进入编辑模式`)
        } catch (e) {
          message.error('获取模型信息失败，无法进入编辑模式')
        }
      } else {
        message.warning('未收到有效的设计模型ID')
      }
    })

    // 启动心跳检测
    this.startHeartbeat()
  }

  // 启动心跳检测
  private startHeartbeat() {
    // 监听 adminPing 并回复 adminPong
    this.messenger?.on('adminPing', () => {
      console.log('收到父窗口 adminPing，回复 adminPong')
      this.messenger?.send('adminPong', null)
      setAdminConnected(true)
      
      // 重置超时检测
      if (this.adminPingTimeout) {
        clearTimeout(this.adminPingTimeout)
        this.adminPingTimeout = null
      }
      
      // 设置新的超时检测 - 如果长时间没收到adminPing，认为连接断开
      this.adminPingTimeout = window.setTimeout(() => {
        console.log('长时间未收到父窗口 adminPing，设置连接状态为false')
        setAdminConnected(false)
      }, 10000) // 10秒超时，比父端的5秒更长
    })

    // 子端不主动发送 adminPing，只响应父端的 adminPing
    // 移除定时发送 adminPing 的逻辑
  }

  // 停止心跳检测
  private stopHeartbeat() {
    if (this.adminPingInterval) {
      clearInterval(this.adminPingInterval)
      this.adminPingInterval = null
    }
    if (this.adminPingTimeout) {
      clearTimeout(this.adminPingTimeout)
      this.adminPingTimeout = null
    }
  }



  private async handleDesignModelData(data: DesignModelData) {
    console.log('=== 设计模型数据接收成功 ===')
    console.log('素材ID数组:', data.materialIds)
    console.log('设计模型ID数组:', data.designModelIds)
    console.log('预计生成数量:', data.materialIds.length * data.designModelIds.length)
    console.log('========================')
    
    // 检查是否有设计模型ID和素材ID
    if (!data.designModelIds || data.designModelIds.length === 0) {
      console.warn('没有提供设计模型ID')
      message.warning('没有提供设计模型ID')
      return
    }
    
    if (!data.materialIds || data.materialIds.length === 0) {
      console.warn('没有提供素材ID')
      message.warning('没有提供素材ID')
      return
    }

    // 显示总体进度
    const totalCombinations = data.materialIds.length * data.designModelIds.length
    message.loading({
      content: `开始处理 ${totalCombinations} 个组合 (0/${totalCombinations})`,
      key: 'processCombinations',
      duration: 0
    })

    let processedCount = 0
    const results = []

    try {
      // 遍历所有设计模型和素材的组合
      for (let modelIndex = 0; modelIndex < data.designModelIds.length; modelIndex++) {
        const modelId = data.designModelIds[modelIndex]
        
        for (let materialIndex = 0; materialIndex < data.materialIds.length; materialIndex++) {
          const materialId = data.materialIds[materialIndex]
          processedCount++
          
          console.log(`=== 处理第 ${processedCount}/${totalCombinations} 个组合 ===`)
          console.log(`设计模型ID: ${modelId}`)
          console.log(`素材ID: ${materialId}`)
          
          // 更新进度
          message.loading({
            content: `正在处理第 ${processedCount}/${totalCombinations} 个组合`,
            key: 'processCombinations',
            duration: 0
          })

          try {
            // 处理单个组合
            const success = await controllerOpenModelAndReplaceStickers(modelId, materialId, {
              showSuccessMessage: false, // 不显示单个成功消息，等全部完成后再显示
              showErrorMessage: false,   // 不显示单个错误消息，记录到结果中
              autoEnterEditMode: true
            });
            
            if (success) {
              console.log(`第 ${processedCount} 个组合处理成功，开始上传模型`)
              
              // 贴纸替换成功后，先退出编辑模式再保存模型
              try {
                // 先退出编辑模式
                exitEditMode()
                
                // 生成模型信息
                const modelInfo = {
                  name: `模型_${modelId}_素材_${materialId}`,
                  description: `基于设计模型 ${modelId} 和素材 ${materialId} 生成的模型`,
                  keywords: `模型,素材,${modelId},${materialId}`
                }
                
                // 上传模型
                const savedModel = await saveCustomModel(modelInfo)
                
                // 主动进入新模型的编辑模式
                if (savedModel && savedModel.id) {
                  console.log('进入编辑模式')
                  enterEditMode(savedModel.id)
                  // 新增：进入编辑模式后批量截图并保存草稿
                  try {
                    // 等待模型加载完成（如有异步加载可适当延迟或监听事件）
                    message.loading({ content: '新模型：准备截图...', key: `modelScreenshot_${modelId}_${materialId}`, duration: 0 });
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // 获取默认角度
                    const angles = currentModelController.value.getDefaultSelectedAngles ? currentModelController.value.getDefaultSelectedAngles() : ['front',];
                    message.loading({ content: `新模型：正在批量截图（共${angles.length}个角度）...`, key: `modelScreenshot_${modelId}_${materialId}`, duration: 0 });
                    // 批量截图
                    const images = await currentModelController.value.exportMultiAngleImages(angles);
                    message.loading({ content: `新模型：截图完成，正在上传并保存草稿...`, key: `modelScreenshot_${modelId}_${materialId}`, duration: 0 });
                    // 上传并保存草稿
                    let uploadedCount = 0;
                    const uploadPromises = images.map(async (image, idx) => {
                      message.loading({ content: `新模型：上传第${idx+1}/${images.length}张截图...`, key: `modelScreenshot_${modelId}_${materialId}`, duration: 0 });
                      const base64Data = image.base64.split(",")[1];
                      const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                      const file = new File([byteArray], `多角度图片_${image.label}.png`, { type: "image/png" });
                      // 获取用户账号
                      let userAccount = 'anonymous'
                      try {
                        const { getLocalUserInfo } = await import('@/store/stores/loginAction')
                        const userInfo = getLocalUserInfo()
                        userAccount = userInfo?.account || userInfo?.name || 'anonymous'
                      } catch (e) {
                        console.warn('无法获取用户信息:', e)
                      }
                      const cos = await uploadToCOS({ 
                        file,
                        category: 'product-model',
                        account: userAccount,
                        entityId: savedModel.id // 使用保存后的模型 ID
                      });
                      const draftPayload = {
                        url: cos.url,
                        name: `多角度图片_${image.label}`,
                        type: 'image',
                        suffix: 'png',
                        updateTime: new Date(),
                        customModelId: savedModel.id,
                      };
                      const draft = await createDraft(draftPayload);
                      uploadedCount++;
                      message.loading({ content: `新模型：已完成${uploadedCount}/${images.length}张截图的上传与草稿保存...`, key: `modelScreenshot_${modelId}_${materialId}`, duration: 0 });
                      return draft;
                    });
                    await Promise.all(uploadPromises);
                    message.success({ content: `新模型：全部截图与草稿保存成功！`, key: `modelScreenshot_${modelId}_${materialId}` });
                    // 全部成功后再通知父窗口
                    this.messenger?.send && this.messenger.send('modelSaved', { modelId, materialId });
                  } catch (screenshotError) {
                    message.error({ content: '新模型截图或保存草稿失败', key: `modelScreenshot_${modelId}_${materialId}` });
                    console.error('新模型截图或保存草稿失败:', screenshotError);
                  }
                }
                
                // 本地也弹出详细提示
                message.success({
                  content: `模型保存成功：模型ID=${modelId}，素材ID=${materialId}，进度：${processedCount}/${totalCombinations}`,
                  duration: 4,
                  key: `modelSaved_${modelId}_${materialId}`
                })
                
                console.log(`第 ${processedCount} 个组合上传成功`)
                
                results.push({
                  modelId,
                  materialId,
                  success: true,
                  uploaded: true,
                  index: processedCount
                })
                
              } catch (uploadError) {
                console.error(`第 ${processedCount} 个组合上传失败:`, uploadError)
                results.push({
                  modelId,
                  materialId,
                  success: true,
                  uploaded: false,
                  uploadError: uploadError.message,
                  index: processedCount
                })
              }
              
            } else {
              console.error(`第 ${processedCount} 个组合处理失败`)
              results.push({
                modelId,
                materialId,
                success: false,
                uploaded: false,
                index: processedCount
              })
            }
            
          } catch (error) {
            console.error(`处理第 ${processedCount} 个组合时出错:`, error)
            results.push({
              modelId,
              materialId,
              success: false,
              uploaded: false,
              error: error.message,
              index: processedCount
            })
          }
        }
      }

      // 处理完成，显示结果统计
      const successCount = results.filter(r => r.success).length
      const uploadedCount = results.filter(r => r.uploaded).length
      const failCount = results.filter(r => !r.success).length
      
      console.log('=== 所有组合处理完成 ===')
      console.log(`成功: ${successCount} 个`)
      console.log(`上传: ${uploadedCount} 个`)
      console.log(`失败: ${failCount} 个`)
      console.log(`总计: ${totalCombinations} 个`)
      
      // 显示最终结果
      if (uploadedCount === totalCombinations) {
        message.success({
          content: `所有组合处理并上传成功！共处理了 ${totalCombinations} 个组合`,
          key: 'processCombinations'
        })
      } else if (uploadedCount > 0) {
        message.warning({
          content: `部分组合处理完成。成功: ${successCount} 个，上传: ${uploadedCount} 个，失败: ${failCount} 个`,
          key: 'processCombinations'
        })
      } else {
        message.error({
          content: `所有组合处理失败！共 ${totalCombinations} 个组合`,
          key: 'processCombinations'
        })
      }
      
    } catch (error) {
      console.error('处理设计模型数据时发生错误:', error)
      message.error({
        content: '处理设计模型数据时发生错误',
        key: 'processCombinations'
      })
    }
  }

  // 等待模型加载完成

  // 销毁实例
  destroy() {
    if (this.messenger) {
      this.messenger.destroy && this.messenger.destroy()
      this.messenger = null
    }
    this.stopHeartbeat()
  }
}

// 创建全局实例
let globalDesignToolReceiver: DesignToolReceiver | null = null

export function initDesignToolReceiver(): DesignToolReceiver {
  if (!globalDesignToolReceiver) {
    globalDesignToolReceiver = new DesignToolReceiver()
  }
  return globalDesignToolReceiver
}

export function destroyDesignToolReceiver() {
  if (globalDesignToolReceiver) {
    globalDesignToolReceiver.destroy()
    globalDesignToolReceiver = null
  }
} 