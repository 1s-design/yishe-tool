#!/usr/bin/env node
/**
 * 批量测试脚本 v2 - 改进版
 */

import { io } from "socket.io-client";
import { readFileSync, writeFileSync, appendFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, ".test-token"), "utf-8").trim();
const SERVER_URL = "http://localhost:1520";
const LOG_FILE = "/tmp/batch-test-v2.log";

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + "\n");
}

// 设计任务列表
const DESIGN_TASKS = [
  // 书法挂毯类
  "设计一幅书法挂毯：文字'宁静致远'，竖排书法字体，宣纸质感背景，水墨风格。保存到贴纸库。",
  "设计一幅书法挂毯：文字'厚德载物'，隶书字体，米黄色背景，古典风格。保存到贴纸库。",
  "设计一幅书法挂毯：文字'上善若水'，行书字体，淡蓝色渐变背景，禅意风格。保存到贴纸库。",
  "设计一幅书法挂毯：文字'天道酬勤'，楷书字体，深棕色木质背景，古朴风格。保存到贴纸库。",
  "设计一幅书法挂毯：文字'海纳百川'，草书字体，海蓝色背景，大气风格。保存到贴纸库。",
  "设计一幅书法挂毯：文字'紫气东来'，篆书字体，紫色渐变背景，仙气风格。保存到贴纸库。",
  "设计一幅书法挂毯：文字'家和万事兴'，行楷字体，红色背景，喜庆风格。保存到贴纸库。",
  "设计一幅书法挂毯：文字'福'，大字单字书法，红色背景，春节风格。保存到贴纸库。",
  // 艺术字挂毯类
  "设计一幅艺术字挂毯：文字'岁月静好'，手写艺术字体，暖色调背景，文艺风格。保存到贴纸库。",
  "设计一幅艺术字挂毯：文字'不忘初心'，创意艺术字体，蓝白配色，清新风格。保存到贴纸库。",
  "设计一幅艺术字挂毯：文字'未来可期'，渐变艺术字体，星空背景，梦幻风格。保存到贴纸库。",
  "设计一幅艺术字挂毯：文字'一路生花'，花卉艺术字体，粉色背景，浪漫风格。保存到贴纸库。",
  "设计一幅艺术字挂毯：文字'平安喜乐'，圆润艺术字体，暖黄色背景，温馨风格。保存到贴纸库。",
  "设计一幅艺术字挂毯：文字'万事胜意'，金色艺术字体，深蓝色背景，高端风格。保存到贴纸库。",
  // 对联/诗词挂毯
  "设计一幅对联挂毯：上联'春风得意马蹄疾'，下联'一日看尽长安花'，横批'前程似锦'。保存到贴纸库。",
  "设计一幅诗词挂毯：诗句'落霞与孤鹜齐飞'，书法字体，水墨山水背景。保存到贴纸库。",
  "设计一幅诗词挂毯：诗句'大漠孤烟直'，竖排书法，沙漠色调背景。保存到贴纸库。",
  // 禅意/国风挂毯
  "设计一幅禅意挂毯：文字'禅'，大字书法，枯山水背景，极简风格。保存到贴纸库。",
  "设计一幅国风挂毯：文字'国泰民安'，楷书字体，中国红背景，传统风格。保存到贴纸库。",
  "设计一幅国风挂毯：文字'龙凤呈祥'，金色书法，红色背景，华丽风格。保存到贴纸库。",
  // 现代艺术字挂毯
  "设计一幅现代艺术字挂毯：文字'LOVE'，立体艺术字，粉色渐变背景。保存到贴纸库。",
  "设计一幅现代艺术字挂毯：文字'DREAM'，霓虹艺术字，深蓝背景，赛博朋克风格。保存到贴纸库。",
  "设计一幅现代艺术字挂毯：文字'HOPE'，水彩艺术字，清新背景，文艺风格。保存到贴纸库。",
  // 名言警句挂毯
  "设计一幅名言挂毯：名言'Stay hungry, stay foolish'，英文艺术字，简约背景。保存到贴纸库。",
  "设计一幅名言挂毯：名言'知行合一'，书法字体，古典背景，哲学风格。保存到贴纸库。",
  "设计一幅名言挂毯：名言'活在当下'，现代艺术字体，渐变背景，治愈风格。保存到贴纸库。",
  // 节日挂毯
  "设计一幅春节挂毯：文字'恭喜发财'，金色书法，红色背景，喜庆风格。保存到贴纸库。",
  "设计一幅中秋挂毯：文字'花好月圆'，书法字体，月夜背景，浪漫风格。保存到贴纸库。",
  "设计一幅新年挂毯：文字'2026'，艺术字体，烟花背景，节日风格。保存到贴纸库。",
  // 自然主题挂毯
  "设计一幅山水挂毯：文字'山高水长'，书法字体，水墨山水背景，意境风格。保存到贴纸库。",
  "设计一幅花鸟挂毯：文字'鸟语花香'，书法字体，花鸟画背景，自然风格。保存到贴纸库。",
];

async function getDesignTools() {
  try {
    const res = await fetch(`${SERVER_URL}/api/websocket/connections`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    return (data?.data || [])
      .filter(c => c.query?.clientSource === "设计端")
      .map(c => c.id);
  } catch (e) {
    log(`获取连接失败: ${e.message}`);
    return [];
  }
}

async function sendTask(toolId, prompt) {
  try {
    const res = await fetch(`${SERVER_URL}/api/websocket/remote-command`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId: toolId,
        command: { type: "chat", payload: { message: prompt, executionMode: "manual" } }
      }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    return data?.data?.success;
  } catch (e) {
    log(`发送任务失败: ${e.message}`);
    return false;
  }
}

async function main() {
  log("🚀 批量测试 v2 启动");
  
  let totalSent = 0;
  let taskIndex = 0;
  
  while (totalSent < 1000) {
    const tools = await getDesignTools();
    
    if (tools.length === 0) {
      log("⏳ 没有可用的设计工具，等待 30 秒...");
      await new Promise(r => setTimeout(r, 60000));
      continue;
    }
    
    log(`🔧 找到 ${tools.length} 个设计工具`);
    
    for (const toolId of tools) {
      if (totalSent >= 1000) break;
      
      const prompt = DESIGN_TASKS[taskIndex % DESIGN_TASKS.length];
      taskIndex++;
      totalSent++;
      
      log(`📤 [${totalSent}/1000] 发送: ${prompt.substring(0, 20)}... → ${toolId.substring(0, 15)}...`);
      
      const ok = await sendTask(toolId, prompt);
      if (ok) {
        log(`✅ 任务已发送`);
      } else {
        log(`❌ 任务发送失败`);
      }
    }
    
    log(`⏳ 等待 90 秒... (已发送: ${totalSent}/1000)`);
    await new Promise(r => setTimeout(r, 90000));
  }
  
  log(`🎉 完成！共发送 ${totalSent} 个任务`);
}

main().catch(e => log(`错误: ${e.message}`));
