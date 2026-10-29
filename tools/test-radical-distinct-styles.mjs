import { io } from "socket.io-client";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiYWNjb3VudCI6ImphY2tpZSIsInRlcm1pbmFsVHlwZSI6ImFkbWluIiwidG9rZW5JZCI6IjhiOWM0MDlmLWUyYWMtNDU3Mi1iMTA4LTEyZTE3MTQ3NjIxZCIsImlhdCI6MTc5MTEzMDY1MCwiZXhwIjoyMTA2NzA2NjUwfQ.Ebae-frV7NN98CT48hYHTLkn8ct7Efpc_5KAL9zLop8";
const RAW_TOKEN = TOKEN.replace("Bearer ", "");
const SERVER_URL = "http://localhost:1520";
const SCRATCH_DIR = "/Users/jackie/.gemini/antigravity-ide/brain/00fa42cd-f28a-432f-b735-d44a270f2b84/scratch";

if (!existsSync(SCRATCH_DIR)) {
  mkdirSync(SCRATCH_DIR, { recursive: true });
}

// 5 款【结构形态完全不同、排版彻底分化】的超高阶长款桌垫 (3200 × 1400 px, 中间主体 + 左右实用留白)
const RADICAL_STYLES = [
  // -------------------------------------------------------------
  // 1. 【可爱少女风 · 奶油软萌3D手账贴纸风】
  // 视觉结构：波浪手账贴纸卡片 + 3D果冻软胶泡泡字 + 配料表条形码 + 胶带贴角
  // -------------------------------------------------------------
  {
    key: "deskpad_style1_kawaii_scrapbook",
    name: "长款桌垫印花 · 可爱3D手账贴纸风《天天开心》",
    width: 3200,
    height: 1400,
    style: "可爱少女风 · 奶油软萌3D贴纸手账",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:#1e111a;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:'PingFang SC','Yuanti SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;
  background-image: radial-gradient(rgba(244,114,182,0.18) 2px, transparent 2px);
  background-size: 38px 38px;">
  
  <!-- 柔和中心光晕 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:1100px;height:900px;background:radial-gradient(ellipse, rgba(244,114,182,0.2) 0%, transparent 70%);pointer-events:none;"></div>

  <!-- 中心悬浮手账卡片容器 (62% 宽度，左右纯净留白) -->
  <div style="position:relative;width:1700px;background:rgba(255,241,245,0.06);border:3px dashed rgba(244,114,182,0.5);border-radius:48px;padding:60px 80px;display:flex;flex-direction:column;align-items:center;gap:32px;backdrop-filter:blur(20px);box-shadow:0 30px 80px rgba(0,0,0,0.6), inset 0 0 40px rgba(244,114,182,0.1);">
    
    <!-- 左上角手账撕纸胶带装饰 -->
    <div style="position:absolute;top:-22px;left:80px;width:160px;height:44px;background:rgba(251,207,232,0.85);transform:rotate(-6deg);border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
      <span style="font-size:18px;font-weight:900;color:#9d174d;letter-spacing:3px;">★ SWEET ★</span>
    </div>

    <!-- 右上角手账圆角贴纸 -->
    <div style="position:absolute;top:-25px;right:90px;padding:10px 24px;background:#f472b6;border:2px solid #fff;border-radius:30px;transform:rotate(5deg);box-shadow:0 6px 16px rgba(0,0,0,0.3);">
      <span style="font-size:20px;font-weight:bold;color:#fff;letter-spacing:2px;">♥ 保持可爱</span>
    </div>

    <!-- 顶部情绪标语条 -->
    <div style="display:flex;align-items:center;gap:18px;padding:8px 28px;background:rgba(244,114,182,0.18);border:1.5px solid #f472b6;border-radius:24px;">
      <span style="font-size:20px;color:#fbcfe8;">✦</span>
      <span style="font-size:22px;color:#fdf2f8;font-weight:800;letter-spacing:6px;text-transform:uppercase;">HAPPINESS RECIPE // 快乐成分 100% · 烦恼通通清空</span>
      <span style="font-size:20px;color:#fbcfe8;">✦</span>
    </div>

    <!-- 核心文字：3D 果冻软胶泡泡字 (多层厚阴影，微倾斜) -->
    <div style="position:relative;margin:10px 0;">
      <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:36px;color:#ffffff;line-height:1;white-space:nowrap;text-indent:36px;transform:rotate(-2deg);
        text-shadow: 
          0 4px 0 #f472b6, 
          0 8px 0 #db2777, 
          0 14px 0 #9d174d, 
          0 22px 40px rgba(157,23,77,0.7);">
        天天开心
      </h1>
    </div>

    <!-- 底部贴纸栏：副标 + 条形码 + 营养成分表 -->
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;border-top:2px dashed rgba(244,114,182,0.3);padding-top:24px;">
      <div style="display:flex;align-items:center;gap:16px;">
        <span style="font-size:32px;letter-spacing:8px;color:#fce7f3;font-weight:600;">愿你的世界，永远温暖明媚</span>
      </div>
      
      <!-- 极简拟物条形码贴纸 -->
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:6px 16px;background:rgba(255,255,255,0.08);border-radius:8px;border:1px solid rgba(244,114,182,0.3);">
        <div style="display:flex;gap:3px;align-items:center;height:24px;">
          <div style="width:3px;height:100%;background:#f472b6;"></div>
          <div style="width:1px;height:100%;background:#f472b6;"></div>
          <div style="width:4px;height:100%;background:#f472b6;"></div>
          <div style="width:2px;height:100%;background:#f472b6;"></div>
          <div style="width:5px;height:100%;background:#f472b6;"></div>
          <div style="width:1px;height:100%;background:#f472b6;"></div>
          <div style="width:3px;height:100%;background:#f472b6;"></div>
          <div style="width:2px;height:100%;background:#f472b6;"></div>
          <div style="width:4px;height:100%;background:#f472b6;"></div>
        </div>
        <span style="font-size:14px;color:#fbcfe8;letter-spacing:3px;font-family:monospace;">NO.520-HAPPY</span>
      </div>
    </div>

  </div>
</div>
    `.trim(),
  },

  // -------------------------------------------------------------
  // 2. 【小清新森系 · 纵向排版日系素雅诗刊】
  // 视觉结构：100% 纵向竖排 (writing-mode: vertical-rl) + 优雅宋体 + 植物枝叶线描 + 杂志日签经纬度
  // -------------------------------------------------------------
  {
    key: "deskpad_style2_vertical_zen",
    name: "长款桌垫印花 · 日系竖排小清新《微风不燥》",
    width: 3200,
    height: 1400,
    style: "小清新森系 · 纵向排版日系素雅诗刊",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:#0d1612;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:'Songti SC','Source Han Serif SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  
  <!-- 素雅温润纵向纸张微纹 -->
  <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%, rgba(45,212,191,0.08) 0%, transparent 65%);pointer-events:none;"></div>
  
  <!-- 纵向画卷容器 (中间区域，高雅留白) -->
  <div style="display:flex;align-items:center;justify-content:center;gap:70px;z-index:2;height:820px;padding:40px 80px;border-left:1px solid rgba(45,212,191,0.2);border-right:1px solid rgba(45,212,191,0.2);">
    
    <!-- 第1栏 (从右至左)：日系经纬度与日刊标记 (竖排) -->
    <div style="writing-mode:vertical-rl;display:flex;align-items:center;gap:24px;font-family:'PingFang SC',sans-serif;color:#5eead4;opacity:0.75;">
      <span style="font-size:16px;letter-spacing:8px;text-transform:uppercase;">VOL. 07 // MORNING BREEZE</span>
      <div style="width:1px;height:80px;background:#2dd4bf;"></div>
      <span style="font-size:14px;letter-spacing:6px;font-family:monospace;">N 31°14′ / E 121°28′</span>
    </div>

    <!-- 第2栏：主标题 · 竖排巨幅宋体大字 -->
    <div style="writing-mode:vertical-rl;display:flex;align-items:center;justify-content:center;">
      <h1 style="margin:0;padding:0;font-size:148px;font-weight:900;letter-spacing:40px;line-height:1;color:#f0fdfa;text-shadow:0 10px 30px rgba(0,0,0,0.8), 0 0 40px rgba(45,212,191,0.3);white-space:nowrap;">
        微风不燥
      </h1>
    </div>

    <!-- 第3栏：精致植物枝叶 SVG 纯线描 -->
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;opacity:0.85;">
      <svg width="60" height="420" viewBox="0 0 60 420" fill="none" stroke="#2dd4bf" stroke-width="1.8" stroke-linecap="round">
        <path d="M30 10 V410" stroke-dasharray="4 4" opacity="0.4"/>
        <path d="M30 80 Q10 110 5 150 Q20 130 30 120" fill="rgba(45,212,191,0.15)"/>
        <path d="M30 160 Q50 190 55 230 Q40 210 30 200" fill="rgba(45,212,191,0.15)"/>
        <path d="M30 240 Q12 270 8 310 Q22 290 30 280" fill="rgba(45,212,191,0.15)"/>
        <circle cx="30" cy="50" r="4" fill="#5eead4"/>
      </svg>
    </div>

    <!-- 第4栏：竖排现代抒情长句诗文 -->
    <div style="writing-mode:vertical-rl;display:flex;align-items:flex-start;gap:20px;height:100%;justify-content:center;">
      <p style="margin:0;font-size:30px;line-height:1.8;letter-spacing:14px;color:#ccfbf1;font-weight:400;white-space:nowrap;">
        阳光正好，微风不燥，万物自得其所。
      </p>
      <p style="margin:0;font-size:24px;line-height:1.8;letter-spacing:10px;color:#99f6e4;font-weight:300;white-space:nowrap;opacity:0.8;">
        余生漫漫，何不放慢脚步，随心漫行。
      </p>
    </div>

    <!-- 第5栏：雅致青瓷小印章 (竖排方框) -->
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;padding-bottom:60px;">
      <div style="writing-mode:vertical-rl;padding:16px 8px;border:1.5px solid #5eead4;background:rgba(45,212,191,0.12);border-radius:2px;">
        <span style="font-size:20px;font-weight:bold;color:#f0fdfa;letter-spacing:8px;">清幽</span>
      </div>
    </div>

  </div>
</div>
    `.trim(),
  },

  // -------------------------------------------------------------
  // 3. 【绝对理智秩序 · NASA深空CAD蓝图与极客HUD坐标】
  // 视觉结构：CAD工程网格 + 4角精密尺寸刻度 + 示波器波形 + 极客参数面板 + 瑞士冷峻机能
  // -------------------------------------------------------------
  {
    key: "deskpad_style3_cad_blueprint",
    name: "长款桌垫印花 · 极客CAD工程蓝图《绝对理性》",
    width: 3200,
    height: 1400,
    style: "绝对理智秩序 · NASA深空CAD蓝图极客机能",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:#030812;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:'Consolas','JetBrains Mono','PingFang SC',monospace;overflow:hidden;-webkit-font-smoothing:antialiased;
  background-image: 
    linear-gradient(to right, rgba(0, 229, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 229, 255, 0.08) 1px, transparent 1px);
  background-size: 50px 50px;">
  
  <!-- CAD 蓝图精密技术外框 (1900px × 860px) -->
  <div style="position:relative;width:1900px;height:860px;border:1.5px solid rgba(0, 229, 255, 0.35);box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:40px 60px;background:rgba(4, 15, 30, 0.7);box-shadow:0 0 60px rgba(0, 229, 255, 0.1);">
    
    <!-- 四角精密机械角标与公差 -->
    <div style="position:absolute;top:-1px;left:-1px;width:30px;height:30px;border-top:4px solid #00e5ff;border-left:4px solid #00e5ff;"></div>
    <div style="position:absolute;top:-1px;right:-1px;width:30px;height:30px;border-top:4px solid #00e5ff;border-right:4px solid #00e5ff;"></div>
    <div style="position:absolute;bottom:-1px;left:-1px;width:30px;height:30px;border-bottom:4px solid #00e5ff;border-left:4px solid #00e5ff;"></div>
    <div style="position:absolute;bottom:-1px;right:-1px;width:30px;height:30px;border-bottom:4px solid #00e5ff;border-right:4px solid #00e5ff;"></div>

    <!-- 顶部技术规格条 (Telemetry Bar) -->
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(0, 229, 255, 0.25);padding-bottom:20px;">
      <div style="display:flex;align-items:center;gap:24px;">
        <span style="font-size:20px;color:#00e5ff;font-weight:bold;letter-spacing:4px;">[SYS_SPEC // 0x7E3]</span>
        <span style="font-size:18px;color:#94a3b8;letter-spacing:2px;">SCALE: 1:1.000 // TOLERANCE: ±0.001mm</span>
      </div>
      <div style="display:flex;align-items:center;gap:20px;">
        <div style="width:10px;height:10px;background:#00e5ff;box-shadow:0 0 10px #00e5ff;border-radius:50%;"></div>
        <span style="font-size:18px;color:#38bdf8;font-weight:bold;letter-spacing:4px;">STATUS: DETERMINISTIC</span>
      </div>
    </div>

    <!-- 中间主视觉：准星 + 示波器波形 + 瑞士机能大字 -->
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;">
      
      <!-- 准星瞄准十字标与音波 -->
      <div style="display:flex;align-items:center;gap:40px;width:100%;justify-content:center;">
        <div style="flex:1;height:1px;background:linear-gradient(90deg, transparent, #00e5ff);"></div>
        <div style="display:flex;align-items:center;gap:12px;color:#00e5ff;font-size:22px;letter-spacing:6px;">
          <span>⌖</span>
          <span>COGNITIVE LOGIC ENGINE</span>
          <span>⌖</span>
        </div>
        <div style="flex:1;height:1px;background:linear-gradient(90deg, #00e5ff, transparent);"></div>
      </div>

      <!-- 瑞士冷峻超大标题 -->
      <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 17);font-weight:900;letter-spacing:52px;color:#f8fafc;line-height:1;white-space:nowrap;text-indent:52px;font-family:'PingFang SC','Helvetica Neue',sans-serif;
        text-shadow: 0 0 40px rgba(0, 229, 255, 0.4), 0 10px 40px rgba(0,0,0,0.9);">
        绝对理性
      </h1>

      <!-- 下标：逻辑求真公理 -->
      <div style="display:flex;align-items:center;gap:24px;">
        <span style="font-size:32px;letter-spacing:14px;color:#bae6fd;font-family:'PingFang SC',sans-serif;font-weight:500;">过滤情绪噪声，惟以第一性原理破局</span>
      </div>

    </div>

    <!-- 底部数据栏：真实刻度尺与实时参数矩阵 -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(0, 229, 255, 0.25);padding-top:20px;">
      <div style="display:flex;gap:40px;font-size:16px;color:#64748b;letter-spacing:2px;">
        <span>ENTROPY: 0.000</span>
        <span>LATENCY: 0.14ms</span>
        <span>CORE: OPTIMAL</span>
      </div>
      
      <!-- 极客毫米刻度尺 -->
      <div style="display:flex;align-items:flex-end;gap:4px;height:22px;">
        <div style="width:2px;height:22px;background:#00e5ff;"></div>
        <div style="width:2px;height:10px;background:#64748b;"></div>
        <div style="width:2px;height:10px;background:#64748b;"></div>
        <div style="width:2px;height:10px;background:#64748b;"></div>
        <div style="width:2px;height:16px;background:#00e5ff;"></div>
        <div style="width:2px;height:10px;background:#64748b;"></div>
        <div style="width:2px;height:10px;background:#64748b;"></div>
        <div style="width:2px;height:10px;background:#64748b;"></div>
        <div style="width:2px;height:22px;background:#00e5ff;"></div>
        <span style="font-size:14px;color:#00e5ff;margin-left:8px;font-weight:bold;">3200mm</span>
      </div>
    </div>

  </div>
</div>
    `.trim(),
  },

  // -------------------------------------------------------------
  // 4. 【书法复古金石 · 秦汉金石碑拓与古宣纸朱拓】
  // 视觉结构：秦汉碑额双层子母回纹框 + 魏碑斑驳凿痕字 + 真实阳刻朱砂方印 + 阴刻椭圆闲章 + 岁在丙午题跋
  // -------------------------------------------------------------
  {
    key: "deskpad_style4_han_rubbing",
    name: "长款桌垫印花 · 秦汉金石碑拓《道阻且长》",
    width: 3200,
    height: 1400,
    style: "书法复古金石 · 秦汉金石碑拓与古宣纸朱拓",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:#0d0b0a;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:'Kaiti SC','Songti SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  
  <!-- 宣纸拓片深邃斑驳底色 -->
  <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%, rgba(180,83,9,0.12) 0%, transparent 70%);pointer-events:none;"></div>

  <!-- 秦汉碑拓双层重线方框 (1800px × 840px, 纯正金石骨架) -->
  <div style="position:relative;width:1800px;height:840px;border:4px solid #b45309;padding:12px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;">
    
    <!-- 内层细线框 -->
    <div style="width:100%;height:100%;border:1.5px solid rgba(217,119,6,0.6);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:50px 70px;position:relative;">
      
      <!-- 四角古铜回纹角花 -->
      <div style="position:absolute;top:10px;left:10px;width:24px;height:24px;border-top:3px solid #f59e0b;border-left:3px solid #f59e0b;"></div>
      <div style="position:absolute;top:10px;right:10px;width:24px;height:24px;border-top:3px solid #f59e0b;border-right:3px solid #f59e0b;"></div>
      <div style="position:absolute;bottom:10px;left:10px;width:24px;height:24px;border-bottom:3px solid #f59e0b;border-left:3px solid #f59e0b;"></div>
      <div style="position:absolute;bottom:10px;right:10px;width:24px;height:24px;border-bottom:3px solid #f59e0b;border-right:3px solid #f59e0b;"></div>

      <!-- 顶部：传统横额篆刻小引 -->
      <div style="display:flex;align-items:center;gap:30px;">
        <div style="width:60px;height:1px;background:#d97706;"></div>
        <span style="font-size:24px;color:#fde68a;letter-spacing:14px;font-weight:bold;">金石之交 · 岁寒不凋</span>
        <div style="width:60px;height:1px;background:#d97706;"></div>
      </div>

      <!-- 中间核心：魏碑凿刻大字 + 两侧双朱砂印章 -->
      <div style="display:flex;align-items:center;justify-content:center;gap:60px;width:100%;">
        
        <!-- 左侧：阳刻朱文方印【行稳】 -->
        <div style="width:70px;height:70px;background:#991b1b;border:3px solid #fecaca;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.6);transform:rotate(-3deg);">
          <span style="font-size:32px;font-weight:900;color:#fef2f2;letter-spacing:4px;writing-mode:vertical-rl;font-family:'Songti SC',serif;">行稳</span>
        </div>

        <!-- 碑拓大字 (沧桑质感，金石凹凸阴影) -->
        <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 17);font-weight:900;letter-spacing:48px;line-height:1;white-space:nowrap;text-indent:48px;
          background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 40%, #d97706 75%, #78350f 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 12px 30px rgba(0,0,0,0.95);
          filter: drop-shadow(0 0 24px rgba(217,119,6,0.3));">
          道阻且长
        </h1>

        <!-- 右侧：阴刻白文圆角闲章【行则将至】 -->
        <div style="padding:14px 10px;background:#b91c1c;border:2px solid #fee2e2;border-radius:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.6);transform:rotate(2deg);">
          <span style="font-size:22px;font-weight:bold;color:#fef2f2;writing-mode:vertical-rl;letter-spacing:6px;font-family:'Songti SC',serif;">将至</span>
        </div>

      </div>

      <!-- 底部：诗文古训 + 岁次题跋 -->
      <div style="display:flex;align-items:center;gap:40px;">
        <span style="font-size:34px;letter-spacing:14px;color:#fef3c7;font-weight:400;">道阻且长，行则将至；行而不辍，未来可期</span>
      </div>

    </div>
  </div>

</div>
    `.trim(),
  },

  // -------------------------------------------------------------
  // 5. 【美式复古公路车库 · 70年代机车汽车菱形徽章】
  // 视觉结构：双线八角菱形工业徽章 + 拱形弧线文字 + 警示星爆 + 70年代美式复古做旧
  // -------------------------------------------------------------
  {
    key: "deskpad_style5_vintage_garage",
    name: "长款桌垫印花 · 70s美式复古车库徽章《保持热爱》",
    width: 3200,
    height: 1400,
    style: "美式复古公路车库 · 70年代机车汽车菱形徽章",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:#141210;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:'PingFang SC','Impact',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;
  background-image: radial-gradient(rgba(245,158,11,0.1) 1.5px, transparent 1.5px);
  background-size: 32px 32px;">

  <!-- 复古中心琥珀暖光 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:1100px;height:900px;background:radial-gradient(circle, rgba(217,119,6,0.2) 0%, transparent 70%);pointer-events:none;"></div>

  <!-- 美式工业复古六角/菱形大徽章框体 (1700px × 840px) -->
  <div style="position:relative;width:1700px;height:840px;background:#1c1917;border:5px solid #d97706;outline:3px solid #78350f;outline-offset:10px;border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,0.8), inset 0 0 50px rgba(0,0,0,0.8);display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:50px 80px;box-sizing:border-box;">
    
    <!-- 顶部复古汽车标语拱形栏 -->
    <div style="display:flex;align-items:center;gap:24px;">
      <span style="font-size:28px;color:#f59e0b;">★ ★ ★</span>
      <span style="font-size:24px;color:#fde68a;font-weight:900;letter-spacing:10px;text-transform:uppercase;">MOTORCYCLE & SPEED CLUB // SINCE 1978</span>
      <span style="font-size:28px;color:#f59e0b;">★ ★ ★</span>
    </div>

    <!-- 核心排版：美式复古高强度力量字体 + 镀金反光 -->
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
      <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 17.5);font-weight:900;letter-spacing:40px;line-height:1;white-space:nowrap;text-indent:40px;
        background: linear-gradient(180deg, #ffffff 0%, #fef3c7 35%, #f59e0b 60%, #b45309 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 16px 40px rgba(0,0,0,0.9);
        filter: drop-shadow(0 0 30px rgba(245,158,11,0.5));">
        保持热爱
      </h1>
      
      <div style="display:flex;align-items:center;gap:20px;margin-top:8px;">
        <div style="width:80px;height:3px;background:#f59e0b;"></div>
        <span style="font-size:32px;letter-spacing:12px;color:#fef3c7;font-weight:800;text-transform:uppercase;">STAY WILD · BEYOND THE ROAD</span>
        <div style="width:80px;height:3px;background:#f59e0b;"></div>
      </div>
    </div>

    <!-- 底部复古铭牌条：极速宣言与复古金属铭牌编号 -->
    <div style="display:flex;justify-content:space-between;align-items:center;width:100%;border-top:2px solid rgba(245,158,11,0.3);padding-top:20px;">
      <span style="font-size:26px;color:#d6d3d1;letter-spacing:8px;font-weight:600;">奔赴山海，终有繁华相送</span>
      
      <!-- 金属铭牌标签 -->
      <div style="padding:6px 20px;background:#b45309;border:2px solid #fde68a;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
        <span style="font-size:18px;font-weight:900;color:#fffbeb;letter-spacing:4px;">AUTHENTIC GARAGE</span>
      </div>
    </div>

  </div>
</div>
    `.trim(),
  },
];

async function postApi(path, body) {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: TOKEN },
    body: JSON.stringify(body || {}),
  });
  return res.json();
}

async function getOnlineDesignTools() {
  const res = await postApi("/api/websocket/connections");
  const list = Array.isArray(res) ? res : (res.data || []);
  return list.filter((c) => {
    const src = String(c?.clientSource || c?.query?.clientSource || "").trim();
    const app = String(c?.clientInfo?.app?.name || "").trim();
    const id = String(c?.id || "").trim();
    return src === "设计工具" || src === "设计端" || app === "yishe-tool" || id.startsWith("designtool-");
  });
}

let globalSocket = null;
const pendingResolvers = new Map();

async function initGlobalSocket() {
  if (globalSocket?.connected) return globalSocket;
  globalSocket = io(`${SERVER_URL.replace(/^http/, "ws")}/ws`, {
    transports: ["websocket"],
    auth: { token: RAW_TOKEN },
    query: { clientSource: "管理后台", clientId: `radical-styles-run-${Date.now()}` },
    reconnection: true,
  });

  globalSocket.on("remote-result", (data) => {
    const reqId = data?.requestId;
    if (!reqId) return;
    const resolver = pendingResolvers.get(reqId);
    if (!resolver) return;
    if (data?.phase === "accepted") return;
    pendingResolvers.delete(reqId);
    resolver.resolve(data);
  });

  await new Promise((resolve) => globalSocket.on("connect", resolve));
  return globalSocket;
}

function sendRemoteCommand(connectionId, type, payload = {}, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const requestId = `rad-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timer = setTimeout(() => {
      pendingResolvers.delete(requestId);
      reject(new Error(`工位 ${connectionId} 执行超时`));
    }, timeoutMs);

    pendingResolvers.set(requestId, {
      resolve: (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      reject: (err) => {
        clearTimeout(timer);
        reject(err);
      },
    });

    fetch(`${SERVER_URL}/api/websocket/remote-command`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: TOKEN },
      body: JSON.stringify({ connectionId, command: { type, payload, requestId } }),
    }).catch(reject);
  });
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buf);
}

async function executeTaskOnWorker(workerId, task) {
  const start = Date.now();
  await sendRemoteCommand(workerId, "resetAgent", {}, 10_000).catch(() => null);
  await sendRemoteCommand(workerId, "executeOperation", { operation: "canvas.clear" }, 10_000).catch(() => null);

  await sendRemoteCommand(workerId, "executeOperation", {
    operation: "canvas.setSize",
    parameters: { width: task.width, height: task.height, unit: "px" },
  });

  const html = task.generateHtml();
  await sendRemoteCommand(workerId, "executeOperation", {
    operation: "canvas.addHtml",
    parameters: { htmlContent: html, htmlBindings: {} },
  });

  const saveRes = await sendRemoteCommand(workerId, "executeOperation", {
    operation: "canvas.updateAndSaveSticker",
    parameters: { name: task.name },
  }, 60_000);

  const cost = ((Date.now() - start) / 1000).toFixed(1);
  const data = saveRes?.data;
  if (data?.url) {
    const localPath = join(SCRATCH_DIR, `${task.key}.png`);
    await downloadFile(data.url, localPath);
    return { task, cost, url: data.url, localPath, workerId };
  } else {
    throw new Error(`保存失败: ${JSON.stringify(saveRes)}`);
  }
}

async function run() {
  console.log("=== 启动【彻底分化·5大不同设计体系】长款桌垫制作流水线 ===");
  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (tools.length === 0) {
    console.error("❌ 无在线设计端工位");
    process.exit(1);
  }
  console.log(`检测到在线工位数: ${tools.length}`);
  tools.forEach((t, i) => console.log(`   [工位 ${i + 1}] ID: ${t.id}`));

  const queue = [...RADICAL_STYLES];
  const results = [];
  const total = queue.length;

  console.log(`\n待制作总数: ${total} 款，正在动态分配至 ${tools.length} 个工位...\n`);

  async function workerLoop(worker) {
    while (queue.length > 0) {
      const task = queue.shift();
      if (!task) break;
      const index = total - queue.length;
      console.log(`⚡ [工位 ${worker.id}] 正在制作 [${index}/${total}]: ${task.name}`);
      try {
        const res = await executeTaskOnWorker(worker.id, task);
        console.log(`   ✅ [${task.name}] 成功落库并下载 (${res.cost}s) -> ${res.localPath}`);
        results.push(res);
      } catch (e) {
        console.error(`   ❌ [${task.name}] 制作失败:`, e.message);
      }
    }
  }

  const startAll = Date.now();
  await Promise.all(tools.map((w) => workerLoop(w)));
  const totalCost = ((Date.now() - startAll) / 1000).toFixed(1);

  console.log(`\n🎉 【5大差异化风格制作完成！】总耗时: ${totalCost}s，成功制作: ${results.length}/${total}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
