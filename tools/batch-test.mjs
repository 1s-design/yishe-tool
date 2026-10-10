#!/usr/bin/env node
/**
 * 批量测试脚本 - 并行控制多个设计工具
 * 目标：生成 1000 个设计作品
 */

import { io } from "socket.io-client";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, ".test-token"), "utf-8").trim();
const SERVER_URL = "http://localhost:1520";

// 设计任务列表
const DESIGN_TASKS = [
  // 名片类
  { name: "极简名片", prompt: "设计一张极简名片：姓名'张三'，职位'产品经理'，公司'创新科技'。黑白配色。保存到贴纸库。" },
  { name: "商务名片", prompt: "设计一张商务名片：姓名'李四'，职位'CTO'，公司'TechFlow'。蓝色系。保存到贴纸库。" },
  { name: "创意名片", prompt: "设计一张创意名片：姓名'王五'，职位'设计师'，公司'创意工作室'。彩色渐变。保存到贴纸库。" },
  // 海报类
  { name: "产品海报", prompt: "设计一张手机产品海报：产品名'iPhone 17'，价格'¥7999起'。科技感风格。保存到贴纸库。" },
  { name: "美食海报", prompt: "设计一张美食海报：标题'Delicious'，背景粉色渐变。优雅风格。保存到贴纸库。" },
  { name: "音乐海报", prompt: "设计一张音乐专辑封面：专辑名'星际迷航'。深紫色背景，霓虹蓝文字。保存到贴纸库。" },
  { name: "书籍封面", prompt: "设计一本书籍封面：书名'时间简史'，作者'史蒂芬·霍金'。深蓝色宇宙背景。保存到贴纸库。" },
  { name: "旅行海报", prompt: "设计一张旅游海报：目的地'马尔代夫'，口号'阳光沙滩海浪'。蓝色海洋背景。保存到贴纸库。" },
  // 贴纸类
  { name: "猫咪贴纸", prompt: "设计一张可爱猫咪贴纸，粉色背景，文字'喵星人'。保存到贴纸库。" },
  { name: "爱心贴纸", prompt: "设计一张红色爱心贴纸，白色背景，文字'LOVE'。保存到贴纸库。" },
  { name: "星星贴纸", prompt: "设计一张金色星星贴纸，深蓝背景，文字'STAR'。保存到贴纸库。" },
  { name: "花朵贴纸", prompt: "设计一张花朵贴纸，粉色渐变背景，文字'BLOOM'。保存到贴纸库。" },
  // 菜单类
  { name: "餐厅菜单", prompt: "设计一张餐厅菜单：店名'小厨娘'，招牌菜'红烧肉¥38、糖醋鱼¥42'。温馨风格。保存到贴纸库。" },
  // 请柬类
  { name: "婚礼请柬", prompt: "设计一张婚礼请柬：新郎'李明'，新娘'王芳'，日期'2026年6月18日'。浪漫风格。保存到贴纸库。" },
  // Logo类
  { name: "科技Logo", prompt: "设计一个科技公司Logo：公司名'TechFlow'，蓝色渐变，简约风格。保存到贴纸库。" },
  { name: "餐饮Logo", prompt: "设计一个餐饮品牌Logo：品牌名'小厨娘'，红色暖色系，温馨风格。保存到贴纸库。" },
  // 标签类
  { name: "产品标签", prompt: "设计一个产品标签：产品名'有机蜂蜜'，品牌'蜂之源'。自然风格。保存到贴纸库。" },
  // 社交媒体
  { name: "Instagram帖子", prompt: "设计一张Instagram帖子：主题'夏日促销'，文字'Summer Sale 50% Off'。清新风格。保存到贴纸库。" },
  { name: "微信头像", prompt: "设计一个微信头像：简约风格，蓝色渐变背景，白色字母'W'。保存到贴纸库。" },
  { name: "小红书封面", prompt: "设计一张小红书封面：主题'美食探店'，暖色调，吸引眼球。保存到贴纸库。" },
];

// 获取设计工具列表
async function getDesignTools() {
  try {
    const res = await fetch(`${SERVER_URL}/api/websocket/connections`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: "{}",
    });
    const data = await res.json();
    return (data?.data || [])
      .filter(c => c.query?.clientSource === "设计端")
      .map(c => c.id);
  } catch { return []; }
}

// 发送设计任务
async function sendDesignTask(toolId, task) {
  try {
    const res = await fetch(`${SERVER_URL}/api/websocket/remote-command`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId: toolId,
        command: { type: "chat", payload: { message: task.prompt, executionMode: "manual" } }
      }),
    });
    return await res.json();
  } catch { return null; }
}

// 主循环
async function main() {
  console.log("🚀 开始批量测试...");
  
  let totalCompleted = 0;
  let taskIndex = 0;
  
  while (totalCompleted < 1000) {
    // 获取可用的设计工具
    const tools = await getDesignTools();
    if (tools.length === 0) {
      console.log("⏳ 没有可用的设计工具，等待 30 秒...");
      await new Promise(r => setTimeout(r, 30000));
      continue;
    }
    
    console.log(`🔧 找到 ${tools.length} 个设计工具`);
    
    // 为每个工具分配任务
    for (const toolId of tools) {
      if (totalCompleted >= 1000) break;
      
      const task = DESIGN_TASKS[taskIndex % DESIGN_TASKS.length];
      taskIndex++;
      
      console.log(`📤 [${totalCompleted + 1}/1000] 发送任务: ${task.name} → ${toolId.slice(0, 20)}...`);
      
      const result = await sendDesignTask(toolId, task);
      if (result?.data?.success) {
        totalCompleted++;
        console.log(`✅ 任务已发送: ${task.name}`);
      } else {
        console.log(`❌ 任务发送失败: ${task.name}`);
      }
    }
    
    // 等待一段时间让任务执行
    console.log(`⏳ 等待 120 秒让任务执行... (已完成: ${totalCompleted}/1000)`);
    await new Promise(r => setTimeout(r, 120000));
  }
  
  console.log(`\n🎉 完成！共发送 ${totalCompleted} 个设计任务`);
}

main().catch(console.error);
