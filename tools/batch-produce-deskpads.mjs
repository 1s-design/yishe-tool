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

// 8 款全新长款桌垫印花设计素材 (3200 × 1400 px, 纯中间居中)
const DESKPAD_BATCH = [
  // 1. 可爱少女风 ·《万事顺意》(香芋紫粉软萌治愈)
  {
    key: "deskpad_girly_shunyi",
    name: "长款桌垫印花 ·《万事顺意》",
    width: 3200,
    height: 1400,
    style: "可爱少女风 · 香芋紫粉梦幻",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #20102b 0%, #100618 55%, #050208 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Yuanti SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:950px;height:950px;background:radial-gradient(circle, rgba(192,132,252,0.18) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:800px;height:800px;border:2px dashed rgba(192,132,252,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:inline-flex;align-items:center;gap:16px;padding:8px 28px;background:rgba(192,132,252,0.12);border:1.5px solid rgba(192,132,252,0.35);border-radius:30px;white-space:nowrap;">
      <span style="font-size:22px;color:#c084fc;">★</span>
      <span style="font-size:22px;color:#f3e8ff;font-weight:700;letter-spacing:6px;text-transform:uppercase;">SWEET DREAMS // 把开心存起来 · 做自己的小太阳</span>
      <span style="font-size:22px;color:#c084fc;">★</span>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:42px;background:linear-gradient(180deg, #ffffff 0%, #f5d0fe 30%, #c084fc 65%, #9333ea 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 40px rgba(0,0,0,0.85), 0 0 38px rgba(192,132,252,0.45);line-height:1;white-space:nowrap;text-indent:42px;">
      万事顺意
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#faf5ff;font-weight:500;">愿日子清净，抬头遇见满眼温柔</span>
      <div style="padding:6px 22px;background:#6b21a8;border:1.5px solid #e9d5ff;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        <span style="font-size:22px;font-weight:bold;color:#fdf4ff;letter-spacing:4px;">顺遂</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 2. 可爱少女风 ·《好运爆棚》(蜜桃甜橘暖阳)
  {
    key: "deskpad_girly_haoyun",
    name: "长款桌垫印花 ·《好运爆棚》",
    width: 3200,
    height: 1400,
    style: "可爱少女风 · 蜜桃甜橘欧气",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #2b170c 0%, #150903 55%, #050201 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Yuanti SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:950px;height:950px;background:radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:800px;height:800px;border:2px dashed rgba(251,146,60,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:inline-flex;align-items:center;gap:16px;padding:8px 28px;background:rgba(251,146,60,0.12);border:1.5px solid rgba(251,146,60,0.35);border-radius:30px;white-space:nowrap;">
      <span style="font-size:22px;color:#fb923c;">✨</span>
      <span style="font-size:22px;color:#fed7aa;font-weight:700;letter-spacing:6px;text-transform:uppercase;">LUCKY DAY // 生活明朗 · 万物可爱</span>
      <span style="font-size:22px;color:#fb923c;">✨</span>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:42px;background:linear-gradient(180deg, #ffffff 0%, #ffedd5 30%, #fb923c 65%, #ea580c 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 40px rgba(0,0,0,0.85), 0 0 38px rgba(251,146,60,0.45);line-height:1;white-space:nowrap;text-indent:42px;">
      好运爆棚
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#fff7ed;font-weight:500;">所有美好的相遇，都在奔你而来</span>
      <div style="padding:6px 22px;background:#c2410c;border:1.5px solid #fed7aa;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        <span style="font-size:22px;font-weight:bold;color:#fff7ed;letter-spacing:4px;">欧气</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 3. 小清新森系 ·《白茶清欢》(清雅静谧茶香)
  {
    key: "deskpad_fresh_baicha",
    name: "长款桌垫印花 ·《白茶清欢》",
    width: 3200,
    height: 1400,
    style: "小清新森系 · 白茶清雅青瓷",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0c1a17 0%, #060e0c 55%, #020404 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Songti SC','PingFang SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(45,212,191,0.14) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1px solid rgba(45,212,191,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#2dd4bf;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#99f6e4;font-weight:500;text-transform:uppercase;">TEA & SERENITY // 心若素雅 · 岁月生香</span>
      <div style="width:40px;height:1px;background:#2dd4bf;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #ffffff 0%, #f0fdfa 35%, #2dd4bf 70%, #0d9488 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.85), 0 0 34px rgba(45,212,191,0.35);line-height:1;white-space:nowrap;text-indent:44px;">
      白茶清欢
    </h1>
    <div style="display:flex;align-items:center;gap:26px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#ccfbf1;font-weight:400;">白茶清欢无别事，我在等风也等你</span>
      <div style="padding:6px 20px;border:1.5px solid #99f6e4;background:rgba(45,212,191,0.15);border-radius:4px;">
        <span style="font-size:22px;color:#ccfbf1;font-weight:bold;letter-spacing:6px;">清幽</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 4. 小清新海风 ·《夏日海盐》(蔚蓝清凉治愈)
  {
    key: "deskpad_fresh_haiyan",
    name: "长款桌垫印花 ·《夏日海盐》",
    width: 3200,
    height: 1400,
    style: "小清新海风 · 冰爽海盐微风",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #071926 0%, #030d14 55%, #010406 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Songti SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(56,189,248,0.16) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1.5px solid rgba(56,189,248,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#38bdf8;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#7dd3fc;font-weight:500;text-transform:uppercase;">SEA SALT BREEZE // 浪花拍岸 · 烦恼随风</span>
      <div style="width:40px;height:1px;background:#38bdf8;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #ffffff 0%, #e0f2fe 35%, #38bdf8 70%, #0284c7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.85), 0 0 34px rgba(56,189,248,0.35);line-height:1;white-space:nowrap;text-indent:44px;">
      夏日海盐
    </h1>
    <div style="display:flex;align-items:center;gap:26px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#e0f2fe;font-weight:400;">去吹吹海边的晚风，让一切温柔落地</span>
      <div style="padding:6px 20px;border:1.5px solid #7dd3fc;background:rgba(56,189,248,0.15);border-radius:4px;">
        <span style="font-size:22px;color:#bae6fd;font-weight:bold;letter-spacing:6px;">海风</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 5. 理智与秩序 ·《心流模式》(极客专注冷凝)
  {
    key: "deskpad_rational_flowstate",
    name: "长款桌垫印花 ·《心流模式》",
    width: 3200,
    height: 1400,
    style: "绝对理智秩序 · 极客心流蓝冷",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0d1624 0%, #060b13 55%, #020306 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Helvetica Neue',Consolas,sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:900px;height:900px;background:radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:760px;height:760px;border:1px solid rgba(14,165,233,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:inline-flex;align-items:center;gap:18px;padding:8px 24px;background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.3);border-radius:4px;white-space:nowrap;">
      <div style="width:8px;height:8px;background:#0ea5e9;border-radius:50%;box-shadow:0 0 10px #0ea5e9;"></div>
      <span style="font-size:22px;color:#7dd3fc;font-weight:700;letter-spacing:8px;text-transform:uppercase;">FLOW STATE // 专注内在 · 抵御喧嚣</span>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:48px;background:linear-gradient(180deg, #ffffff 0%, #e0f2fe 35%, #38bdf8 70%, #0369a1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.95), 0 0 36px rgba(14,165,233,0.4);line-height:1;white-space:nowrap;text-indent:48px;">
      心流模式
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#e0f2fe;font-weight:500;">屏蔽干扰，沉入深度思考之境</span>
      <div style="padding:6px 20px;background:#0369a1;border:1.5px solid #7dd3fc;border-radius:3px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:900;color:#f0f9ff;letter-spacing:6px;">专注</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 6. 理智与秩序 ·《降噪思考》(冷金属灰极简)
  {
    key: "deskpad_rational_jiangzao",
    name: "长款桌垫印花 ·《降噪思考》",
    width: 3200,
    height: 1400,
    style: "绝对理智秩序 · 冷金属灰秩序",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #15181c 0%, #0b0d10 55%, #030405 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Helvetica Neue',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:900px;height:900px;background:radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:760px;height:760px;border:1px solid rgba(255,255,255,0.18);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:inline-flex;align-items:center;gap:18px;padding:8px 24px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.22);border-radius:4px;white-space:nowrap;">
      <span style="font-size:22px;color:#cbd5e1;font-weight:700;letter-spacing:8px;text-transform:uppercase;">NOISE CANCELED // 过滤噪音 · 独立清醒</span>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:48px;background:linear-gradient(180deg, #ffffff 0%, #f1f5f9 35%, #94a3b8 70%, #475569 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.95), 0 0 36px rgba(255,255,255,0.3);line-height:1;white-space:nowrap;text-indent:48px;">
      降噪思考
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#cbd5e1;font-weight:500;">不为人言所动，惟以逻辑求真</span>
      <div style="padding:6px 20px;background:#1e293b;border:1.5px solid #94a3b8;border-radius:3px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:900;color:#f8fafc;letter-spacing:6px;">理智</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 7. 书法复古金石 ·《厚德载物》(魏碑雄浑金石)
  {
    key: "deskpad_calligraphy_houde",
    name: "长款桌垫印花 ·《厚德载物》",
    width: 3200,
    height: 1400,
    style: "书法复古金石 · 魏碑汉简赤金",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #1a140b 0%, #0d0904 55%, #030200 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Kaiti SC','Songti SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1.5px solid rgba(217,119,6,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#d97706;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#fde68a;font-weight:500;text-transform:uppercase;">GREAT VIRTUE // 容载万物 · 气度开阔</span>
      <div style="width:40px;height:1px;background:#d97706;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #fffbeb 0%, #fef3c7 35%, #d97706 70%, #78350f 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.9), 0 0 40px rgba(217,119,6,0.4);line-height:1;white-space:nowrap;text-indent:44px;">
      厚德载物
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#fef3c7;font-weight:400;">地势坤，君子以厚德载物</span>
      <div style="padding:6px 20px;background:#991b1b;border:1.5px solid #fecaca;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:bold;color:#fef2f2;letter-spacing:6px;">载物</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 8. 书法复古金石 ·《宁静致远》(典雅墨染行草)
  {
    key: "deskpad_calligraphy_ningjing",
    name: "长款桌垫印花 ·《宁静致远》",
    width: 3200,
    height: 1400,
    style: "书法复古金石 · 墨染青绿致远",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0d1a1b 0%, #060e0f 55%, #010404 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Kaiti SC','Songti SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1.5px solid rgba(56,189,248,0.22);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#38bdf8;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#7dd3fc;font-weight:500;text-transform:uppercase;">TRANQUIL & FAR // 心静致远 · 气清神宁</span>
      <div style="width:40px;height:1px;background:#38bdf8;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #ffffff 0%, #e0f2fe 35%, #38bdf8 70%, #0284c7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.9), 0 0 40px rgba(56,189,248,0.4);line-height:1;white-space:nowrap;text-indent:44px;">
      宁静致远
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#f0f9ff;font-weight:400;">淡泊以明志，宁静以致远</span>
      <div style="padding:6px 20px;background:#991b1b;border:1.5px solid #fecaca;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:bold;color:#fef2f2;letter-spacing:6px;">致远</span>
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
    query: { clientSource: "管理后台", clientId: `deskpad-batch-run-${Date.now()}` },
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
    const requestId = `dp-b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
  console.log("=== 启动桌垫印花自适应并发生产流水线 ===");
  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (tools.length === 0) {
    console.error("❌ 无在线设计端工位");
    process.exit(1);
  }
  console.log(`检测到在线工位数: ${tools.length}`);
  tools.forEach((t, i) => console.log(`   [工位 ${i + 1}] ID: ${t.id}`));

  // 并发池调度器
  const queue = [...DESKPAD_BATCH];
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

  console.log(`\n🎉 【流水线全部完成！】总耗时: ${totalCost}s，成功制作: ${results.length}/${total}`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
