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

// 8 款全新进阶长款桌垫印花设计素材 (3200 × 1400 px, 纯中间居中)
const DESKPAD_BATCH_PART2 = [
  // 1. 可爱少女风 ·《快乐万岁》(樱花奶白甜妹)
  {
    key: "deskpad_girly_kuaile",
    name: "长款桌垫印花 ·《快乐万岁》",
    width: 3200,
    height: 1400,
    style: "可爱少女风 · 樱花奶白治愈",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #29121d 0%, #16080e 55%, #050204 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Yuanti SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:950px;height:950px;background:radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:800px;height:800px;border:2px dashed rgba(244,114,182,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:inline-flex;align-items:center;gap:16px;padding:8px 28px;background:rgba(244,114,182,0.12);border:1.5px solid rgba(244,114,182,0.35);border-radius:30px;white-space:nowrap;">
      <span style="font-size:22px;color:#f472b6;">♥</span>
      <span style="font-size:22px;color:#fce7f3;font-weight:700;letter-spacing:6px;text-transform:uppercase;">HAPPINESS FIRST // 烦恼清零 · 今天也要超开心</span>
      <span style="font-size:22px;color:#f472b6;">♥</span>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:42px;background:linear-gradient(180deg, #ffffff 0%, #fce7f3 30%, #f472b6 65%, #db2777 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 40px rgba(0,0,0,0.85), 0 0 38px rgba(244,114,182,0.45);line-height:1;white-space:nowrap;text-indent:42px;">
      快乐万岁
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#fdf2f8;font-weight:500;">心怀浪漫宇宙，也珍惜人间日常</span>
      <div style="padding:6px 22px;background:#9d174d;border:1.5px solid #fbcfe8;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        <span style="font-size:22px;font-weight:bold;color:#fdf2f8;letter-spacing:4px;">元气</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 2. 可爱少女风 ·《星河入梦》(极光幻紫梦境)
  {
    key: "deskpad_girly_xinghe",
    name: "长款桌垫印花 ·《星河入梦》",
    width: 3200,
    height: 1400,
    style: "可爱少女风 · 极光幻紫梦境",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #1e1130 0%, #0d0617 55%, #030107 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Yuanti SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:950px;height:950px;background:radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:800px;height:800px;border:2px dashed rgba(168,85,247,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:inline-flex;align-items:center;gap:16px;padding:8px 28px;background:rgba(168,85,247,0.12);border:1.5px solid rgba(168,85,247,0.35);border-radius:30px;white-space:nowrap;">
      <span style="font-size:22px;color:#a855f7;">✧</span>
      <span style="font-size:22px;color:#f3e8ff;font-weight:700;letter-spacing:6px;text-transform:uppercase;">SWEET DREAM // 晚安好梦 · 披星戴月奔向美好</span>
      <span style="font-size:22px;color:#a855f7;">✧</span>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:42px;background:linear-gradient(180deg, #ffffff 0%, #f3e8ff 30%, #a855f7 65%, #7e22ce 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 40px rgba(0,0,0,0.85), 0 0 38px rgba(168,85,247,0.45);line-height:1;white-space:nowrap;text-indent:42px;">
      星河入梦
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#faf5ff;font-weight:500;">今夜无忧，枕着满天星辰入眠</span>
      <div style="padding:6px 22px;background:#581c87;border:1.5px solid #d8b4fe;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        <span style="font-size:22px;font-weight:bold;color:#faf5ff;letter-spacing:4px;">好梦</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 3. 小清新森系 ·《自在如风》(鼠尾草灰绿松弛)
  {
    key: "deskpad_fresh_zizai",
    name: "长款桌垫印花 ·《自在如风》",
    width: 3200,
    height: 1400,
    style: "小清新森系 · 鼠尾草灰绿松弛",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #111a14 0%, #080f0a 55%, #020403 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Songti SC','PingFang SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(74,222,128,0.14) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1px solid rgba(74,222,128,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#4ade80;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#bbf7d0;font-weight:500;text-transform:uppercase;">FREE LIKE WIND // 步履轻盈 · 心无挂碍</span>
      <div style="width:40px;height:1px;background:#4ade80;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #ffffff 0%, #f0fdf4 35%, #4ade80 70%, #16a34a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.85), 0 0 34px rgba(74,222,128,0.35);line-height:1;white-space:nowrap;text-indent:44px;">
      自在如风
    </h1>
    <div style="display:flex;align-items:center;gap:26px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#dcfce7;font-weight:400;">不为往事扰，余生只愿清欢自在</span>
      <div style="padding:6px 20px;border:1.5px solid #86efac;background:rgba(74,222,128,0.15);border-radius:4px;">
        <span style="font-size:22px;color:#dcfce7;font-weight:bold;letter-spacing:6px;">随喜</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 4. 小清新森系 ·《半亩花田》(晨雾浅粉柔光)
  {
    key: "deskpad_fresh_huatian",
    name: "长款桌垫印花 ·《半亩花田》",
    width: 3200,
    height: 1400,
    style: "小清新森系 · 晨雾浅粉柔光",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #1e1319 0%, #0f080c 55%, #040203 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Songti SC','PingFang SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(251,113,133,0.14) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1px solid rgba(251,113,133,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#fb7185;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#fecdd3;font-weight:500;text-transform:uppercase;">BLOOMING DAYS // 繁花似锦 · 岁月静好</span>
      <div style="width:40px;height:1px;background:#fb7185;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #ffffff 0%, #fff1f2 35%, #fb7185 70%, #e11d48 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.85), 0 0 34px rgba(251,113,133,0.35);line-height:1;white-space:nowrap;text-indent:44px;">
      半亩花田
    </h1>
    <div style="display:flex;align-items:center;gap:26px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#ffe4e6;font-weight:400;">愿你在尘世里，亦能嗅得草木芬芳</span>
      <div style="padding:6px 20px;border:1.5px solid #fda4af;background:rgba(251,113,133,0.15);border-radius:4px;">
        <span style="font-size:22px;color:#ffe4e6;font-weight:bold;letter-spacing:6px;">静好</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 5. 理智与秩序 ·《保持编译》(极客终端绿光)
  {
    key: "deskpad_rational_compile",
    name: "长款桌垫印花 ·《保持编译》",
    width: 3200,
    height: 1400,
    style: "绝对理智秩序 · 极客终端黑客绿",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0a1711 0%, #040c08 55%, #010403 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Courier New',Consolas,monospace;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:900px;height:900px;background:radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:760px;height:760px;border:1px solid rgba(34,197,94,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:inline-flex;align-items:center;gap:18px;padding:8px 24px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:4px;white-space:nowrap;">
      <div style="width:8px;height:8px;background:#22c55e;border-radius:50%;box-shadow:0 0 10px #22c55e;"></div>
      <span style="font-size:22px;color:#86efac;font-weight:700;letter-spacing:8px;text-transform:uppercase;">COMPILE & RUN // 0 ERRORS · 0 WARNINGS</span>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:48px;background:linear-gradient(180deg, #ffffff 0%, #f0fdf4 35%, #4ade80 70%, #15803d 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.95), 0 0 36px rgba(34,197,94,0.4);line-height:1;white-space:nowrap;text-indent:48px;">
      保持编译
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#dcfce7;font-weight:500;">逻辑自洽，在不确定中构建确定性</span>
      <div style="padding:6px 20px;background:#15803d;border:1.5px solid #86efac;border-radius:3px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:900;color:#f0fdf4;letter-spacing:6px;">构建</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 6. 理智与秩序 ·《绝对重构》(硬核极客冷银)
  {
    key: "deskpad_rational_refactor",
    name: "长款桌垫印花 ·《绝对重构》",
    width: 3200,
    height: 1400,
    style: "绝对理智秩序 · 极客冷银重构",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #13171f 0%, #090c12 55%, #020305 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Helvetica Neue',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:900px;height:900px;background:radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:760px;height:760px;border:1px solid rgba(99,102,241,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:inline-flex;align-items:center;gap:18px;padding:8px 24px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.3);border-radius:4px;white-space:nowrap;">
      <span style="font-size:22px;color:#a5b4fc;font-weight:700;letter-spacing:8px;text-transform:uppercase;">REFACTORING // 抽丝剥茧 · 建立新秩序</span>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:48px;background:linear-gradient(180deg, #ffffff 0%, #eef2ff 35%, #818cf8 70%, #4338ca 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.95), 0 0 36px rgba(99,102,241,0.4);line-height:1;white-space:nowrap;text-indent:48px;">
      绝对重构
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#e0e7ff;font-weight:500;">打破旧有混沌，在秩序中重构无限</span>
      <div style="padding:6px 20px;background:#3730a3;border:1.5px solid #a5b4fc;border-radius:3px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:900;color:#eef2ff;letter-spacing:6px;">重构</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 7. 书法复古金石 ·《海阔天空》(汉简雄奇金墨)
  {
    key: "deskpad_calligraphy_haikuo",
    name: "长款桌垫印花 ·《海阔天空》",
    width: 3200,
    height: 1400,
    style: "书法复古金石 · 汉简雄奇金墨",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #17130f 0%, #0b0906 55%, #030201 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Kaiti SC','Songti SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1.5px solid rgba(245,158,11,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#f59e0b;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#fde68a;font-weight:500;text-transform:uppercase;">BOUNDLESS HORIZON // 气象万千 · 纵横开阖</span>
      <div style="width:40px;height:1px;background:#f59e0b;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #fffbeb 0%, #fef3c7 35%, #f59e0b 70%, #92400e 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.9), 0 0 40px rgba(245,158,11,0.4);line-height:1;white-space:nowrap;text-indent:44px;">
      海阔天空
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#fef3c7;font-weight:400;">海纳百川有容乃大，壁立千仞无欲则刚</span>
      <div style="padding:6px 20px;background:#b45309;border:1.5px solid #fef3c7;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:bold;color:#fef3c7;letter-spacing:6px;">旷达</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 8. 书法复古金石 ·《大智若愚》(魏碑金石沉稳)
  {
    key: "deskpad_calligraphy_dazhi",
    name: "长款桌垫印花 ·《大智若愚》",
    width: 3200,
    height: 1400,
    style: "书法复古金石 · 魏碑金石沉稳",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #151618 0%, #0a0b0c 55%, #020303 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Kaiti SC','Songti SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(226,232,240,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1.5px solid rgba(226,232,240,0.22);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#94a3b8;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#cbd5e1;font-weight:500;text-transform:uppercase;">PROFOUND WISDOM // 抱朴守拙 · 藏锋于内</span>
      <div style="width:40px;height:1px;background:#94a3b8;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #ffffff 0%, #f1f5f9 35%, #94a3b8 70%, #475569 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.9), 0 0 40px rgba(255,255,255,0.3);line-height:1;white-space:nowrap;text-indent:44px;">
      大智若愚
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#e2e8f0;font-weight:400;">大智若愚，大巧若拙，大音希声</span>
      <div style="padding:6px 20px;background:#b91c1c;border:1.5px solid #fecaca;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:bold;color:#fef2f2;letter-spacing:6px;">抱朴</span>
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
    query: { clientSource: "管理后台", clientId: `deskpad-batch2-run-${Date.now()}` },
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
    const requestId = `dp-b2-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
  console.log("=== 启动第二批长款桌垫自适应并发生产流水线 ===");
  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (tools.length === 0) {
    console.error("❌ 无在线设计端工位");
    process.exit(1);
  }
  console.log(`检测到在线工位数: ${tools.length}`);
  tools.forEach((t, i) => console.log(`   [工位 ${i + 1}] ID: ${t.id}`));

  const queue = [...DESKPAD_BATCH_PART2];
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
        console.log(`   ✅ [${task.name}] 成功落库并下载 (${res.cost}s)`);
        results.push(res);
      } catch (e) {
        console.error(`   ❌ [${task.name}] 制作失败:`, e.message);
      }
    }
  }

  const startAll = Date.now();
  await Promise.all(tools.map((w) => workerLoop(w)));
  const totalCost = ((Date.now() - startAll) / 1000).toFixed(1);

  console.log(`\n🎉 【第二批流水线全部完成！】总耗时: ${totalCost}s，成功制作: ${results.length}/${total}`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
