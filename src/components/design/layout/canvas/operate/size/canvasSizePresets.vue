<template>
  <div class="size-presets-trigger">
    <Button
      size="sm"
      variant="outline"
      class="w-full"
      @click="dialogVisible = true"
    >
      <Setting class="w-3.5 h-3.5" />
      更多尺寸预设
    </Button>
  </div>

  <Dialog :modal="false" v-model:open="dialogVisible">
    <DialogContent class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col size-presets-dialog">
      <DialogHeader class="px-6 pt-6 pb-2 shrink-0">
        <DialogTitle>选择常用尺寸比例</DialogTitle>
      </DialogHeader>
    <div class="preset-container">
      <div class="preset-search">
        <div class="preset-search-input relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            v-model="searchKeyword"
            placeholder="搜索商品、用途、比例或尺寸，例如：鼠标垫 / 16:9 / 1080x1920"
            class="pl-8"
          />
        </div>
        <div class="preset-search-meta">共 {{ matchedCount }} 个结果</div>
      </div>

      <div v-if="filteredRatios.length === 0 && filteredSizeGroups.length === 0" class="preset-empty">
        没有找到匹配的尺寸，试试搜索商品名称、用途、比例或具体规格。
      </div>

      <!-- 比例快选 -->
      <div class="ratio-section" v-if="showRatioSection">
        <div class="section-title">比例快选 <span class="section-desc">选择比例后输入宽度自动生成尺寸</span></div>
        <div class="ratio-grid">
          <div
            v-for="ratio in filteredRatios"
            :key="ratio.display"
            class="ratio-card"
            @click="openRatioDialog(ratio)"
          >
            <div class="ratio-preview" :style="getRatioPreviewStyle(ratio)">
              <div class="ratio-inner"></div>
            </div>
            <div class="ratio-info">
              <div class="ratio-label">{{ ratio.display }}</div>
              <div class="ratio-name">{{ ratio.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 常用尺寸分组 -->
      <div
        v-for="group in filteredSizeGroups"
        :key="group.label"
        class="preset-group"
      >
        <div class="group-title">{{ group.label }}</div>
        <div class="preset-items">
          <div
            v-for="item in group.options"
            :key="item.label"
            class="preset-card"
            @click="handleSelect(item)"
          >
            <div class="preview-box">
              <div class="aspect-ratio-box" :style="getRatioStyle(item)"></div>
            </div>
            <div class="preset-info">
              <div class="preset-label">{{ item.label }}</div>
              <div class="preset-size">{{ item.width }} x {{ item.height }}</div>
              <div class="preset-ratio">{{ formatDisplayRatio(item) }}</div>
              <div class="preset-tags" v-if="item.tags?.length">
                <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DialogContent>
  </Dialog>

  <!-- 比例尺寸选择弹窗 -->
  <Dialog :modal="false" v-model:open="ratioDialogVisible">
    <DialogContent class="max-w-[480px] w-[480px] ratio-size-dialog">
      <DialogHeader>
        <DialogTitle>{{ `设置尺寸 - ${currentRatio?.display} ${currentRatio?.name || ''}` }}</DialogTitle>
      </DialogHeader>
    <div class="ratio-dialog-content" v-if="currentRatio">
      <div class="ratio-dialog-desc">
        {{ currentRatio.description }} · {{ currentRatio.usage }}
      </div>

      <div class="ratio-dialog-section">
        <div class="section-label">选择宽度</div>
        <div class="width-quick-btns">
          <Button
            v-for="w in quickWidths"
            :key="w"
            size="sm"
            :variant="customWidth === w ? 'default' : 'outline'"
            @click="customWidth = w; updateCustomHeight()"
          >
            {{ w }}
          </Button>
        </div>
        <div class="custom-width-group">
          <span class="width-label">自定义</span>
          <Input
            type="number"
            v-model.number="customWidth"
            :min="100"
            :max="20000"
            :step="10"
            class="custom-width-input"
            @input="updateCustomHeight"
          />
          <span class="width-unit">px</span>
        </div>
      </div>

      <div class="ratio-dialog-result">
        <div class="result-display">
          <span class="result-width">{{ customWidth }}</span>
          <span class="result-x">×</span>
          <span class="result-height">{{ customHeight }}</span>
          <span class="result-unit">px</span>
        </div>
      </div>
    </div>

      <div class="flex items-center justify-end gap-2 pt-4">
        <Button variant="outline" @click="ratioDialogVisible = false">取消</Button>
        <Button @click="handleRatioConfirm">确认使用</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Search, Settings as Setting } from "lucide-vue-next";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getAllRatios } from "../../crop/ratioData";
import type { RatioOption } from "../../crop/ratioData";

const emit = defineEmits(["select"]);

const dialogVisible = ref(false);
const searchKeyword = ref("");

// ==================== 比例选择相关 ====================

const ratioDialogVisible = ref(false);
const currentRatio = ref<RatioOption | null>(null);
const customWidth = ref(1080);
const customHeight = ref(1920);

const quickWidths = [5000, 6000, 7680, 8000, 10000, 12000, 15000];

// 所有比例，按 ratio 从窄到宽排序
const allRatios = computed(() => {
  return getAllRatios().sort((a, b) => (a.width / a.height) - (b.width / b.height));
});

function openRatioDialog(ratio: RatioOption) {
  currentRatio.value = ratio;
  customWidth.value = 5000;
  updateCustomHeight();
  ratioDialogVisible.value = true;
}

function updateCustomHeight() {
  if (!currentRatio.value) return;
  const ratio = currentRatio.value;
  customHeight.value = Math.round((customWidth.value / ratio.width) * ratio.height);
}

function handleRatioConfirm() {
  emit("select", {
    width: customWidth.value,
    height: customHeight.value,
  });
  ratioDialogVisible.value = false;
  dialogVisible.value = false;
}

function getRatioPreviewStyle(ratio: RatioOption) {
  const aspectRatio = ratio.width / ratio.height;
  const MAX_SIZE = 48;
  let w, h;
  if (aspectRatio > 1) {
    w = MAX_SIZE;
    h = MAX_SIZE / aspectRatio;
  } else {
    h = MAX_SIZE;
    w = MAX_SIZE * aspectRatio;
  }
  return {
    width: `${w}px`,
    height: `${h}px`,
  };
}

// ==================== 常用尺寸相关 ====================

interface SizeOption {
  label: string;
  width: number;
  height: number;
  ratio?: number;
  description?: string;
  tags?: string[];
}

interface SizeGroup {
  label: string;
  options: SizeOption[];
}

const sizeGroups: SizeGroup[] = [
  {
    label: "国旗标准尺寸",
    options: [
      { label: "中国国旗 1号", width: 5000, height: 3333, description: "2880×1920mm 旗杆用" },
      { label: "中国国旗 2号", width: 5000, height: 3333, description: "2400×1600mm" },
      { label: "中国国旗 3号", width: 5000, height: 3333, description: "1920×1280mm" },
      { label: "中国国旗 4号", width: 5000, height: 3333, description: "1440×960mm" },
      { label: "中国国旗 5号", width: 5000, height: 3333, description: "960×640mm" },
      { label: "美国国旗 (标准)", width: 5000, height: 2632, description: "1.9:1 星条旗" },
      { label: "英国国旗", width: 5000, height: 2500, description: "2:1 米字旗" },
      { label: "日本国旗", width: 5000, height: 3333, description: "3:2 日之丸" },
      { label: "韩国国旗", width: 5000, height: 3333, description: "3:2 太极旗" },
      { label: "法国国旗", width: 5000, height: 3333, description: "3:2 三色旗" },
      { label: "德国国旗", width: 5000, height: 3000, description: "5:3 三色旗" },
      { label: "意大利国旗", width: 5000, height: 3333, description: "3:2 三色旗" },
      { label: "俄罗斯国旗", width: 5000, height: 3333, description: "3:2 三色旗" },
      { label: "加拿大国旗", width: 5000, height: 2500, description: "2:1 枫叶旗" },
      { label: "澳大利亚国旗", width: 5000, height: 2500, description: "2:1" },
      { label: "巴西国旗", width: 5000, height: 3500, description: "10:7" },
      { label: "印度国旗", width: 5000, height: 3333, description: "3:2 三色旗" },
      { label: "联合国旗帜", width: 5000, height: 3333, description: "3:2" },
      { label: "奥林匹克旗帜", width: 5000, height: 3125, description: "8:5" },
    ],
  },
  {
    label: "常用标准固定尺寸",
    options: [
      { label: "证件照 一寸", width: 5000, height: 7083, description: "25×35mm 标准证件照" },
      { label: "证件照 二寸", width: 5000, height: 6667, description: "35×49mm" },
      { label: "证件照 小二寸", width: 5000, height: 6250, description: "35×45mm 护照用" },
      { label: "证件照 大一寸", width: 5000, height: 6667, description: "33×48mm" },
      { label: "证件照 五寸", width: 7500, height: 5000, description: "89×127mm 生活照" },
      { label: "证件照 六寸", width: 7500, height: 5000, description: "102×152mm" },
      { label: "护照照片 (中国)", width: 5000, height: 7083, description: "33×48mm" },
      { label: "护照照片 (美国)", width: 5000, height: 6250, description: "2×2英寸 正方形" },
      { label: "签证照片 (申根)", width: 5000, height: 6250, description: "35×45mm" },
      { label: "驾照照片", width: 5000, height: 6250, description: "22×32mm 等比例放大" },
      { label: "学生证照片", width: 5000, height: 6667, description: "25×35mm 等比例放大" },
      { label: "工作证照片", width: 5000, height: 6667, description: "25×35mm 等比例放大" },
      { label: "结婚证照片", width: 5000, height: 6667, description: "大二寸 40×60mm" },
      { label: "港澳通行证照片", width: 5000, height: 6250, description: "33×48mm" },
      { label: "社保卡照片", width: 5000, height: 6667, description: "26×32mm 等比例放大" },
      { label: "门禁卡/工牌", width: 5000, height: 8000, description: "54×86mm 标准卡竖版" },
      { label: "银行卡/信用卡", width: 8519, height: 5000, description: "85.6×53.98mm" },
      { label: "IC卡/ID卡", width: 8519, height: 5000, description: "85.6×54mm 标准卡" },
      { label: "胸牌/吊牌", width: 5000, height: 8000, description: "54×86mm 竖版" },
      { label: "入场券/门票", width: 8000, height: 5000, description: "200×80mm 横版" },
      { label: "优惠券/代金券", width: 8000, height: 5000, description: "200×90mm" },
      { label: "名片 (横版)", width: 8333, height: 5000, description: "90×54mm 中国标准" },
      { label: "名片 (竖版)", width: 5000, height: 8333, description: "54×90mm" },
      { label: "VIP卡/会员卡", width: 8519, height: 5000, description: "85.6×54mm" },
      { label: "书签", width: 5000, height: 16667, description: "50×150mm" },
      { label: "红包封面", width: 5000, height: 7500, description: "竖版红包" },
      { label: "邀请函 (横版)", width: 7500, height: 5000, description: "5×7英寸" },
      { label: "邀请函 (竖版)", width: 5000, height: 7500, description: "5×7英寸" },
      { label: "菜单/酒水单", width: 5000, height: 7097, description: "A4 竖版" },
      { label: "吊旗/挂旗", width: 5000, height: 7500, description: "竖版吊旗" },
      { label: "桌旗", width: 7500, height: 5000, description: "横版桌旗" },
      { label: "袖标/臂章", width: 5000, height: 6250, description: "竖版臂章" },
      { label: "胸章/徽章", width: 5000, height: 5000, description: "圆形 徽章" },
      { label: "杯垫 (圆形)", width: 5000, height: 5000, description: "直径100mm" },
      { label: "杯垫 (方形)", width: 5000, height: 5000, description: "100×100mm" },
      { label: "冰箱贴", width: 5000, height: 5000, description: "方形/圆形" },
      { label: "手机壁纸 (iPhone)", width: 5000, height: 10870, description: "1179×2556px iPhone 15 Pro" },
      { label: "手机壁纸 (Android)", width: 5000, height: 10526, description: "1440×3200px 2K" },
      { label: "电脑壁纸 (4K)", width: 8889, height: 5000, description: "3840×2160px" },
      { label: "iPad壁纸", width: 5000, height: 6667, description: "2048×2732px" },
      { label: "微信头像", width: 5000, height: 5000, description: "正方形" },
      { label: "微信二维码名片", width: 5000, height: 5000, description: "正方形" },
    ],
  },
  {
    label: "通用比例 / 屏幕",
    options: [
      { label: "电影宽屏 (21:9)", width: 11667, height: 5000 },
      { label: "高清横屏 (16:9)", width: 8889, height: 5000 },
      { label: "黄金比例横向 (1.618:1)", width: 8090, height: 5000 },
      { label: "传统屏幕 (4:3)", width: 6667, height: 5000 },
      { label: "正方形 (1:1)", width: 5000, height: 5000 },
      { label: "移动端全屏 (9:16)", width: 5000, height: 8889 },
      { label: "4K超清宽屏", width: 8889, height: 5000 },
    ],
  },
  {
    label: "高清印刷 / 大幅面输出 (300 PPI)",
    options: [
      { label: "8K 超清横幅 (16:9)", width: 8889, height: 5000, description: "大幅高清" },
      { label: "6K 宽幅 (3:2)", width: 7500, height: 5000, description: "摄影级画质" },
      { label: "大尺寸海报横幅 (3:2)", width: 7500, height: 5000, description: "展览级" },
      { label: "巨型海报横幅 (2:1)", width: 10000, height: 5000, description: "超大面幅" },
      { label: "A0 高清 (横幅)", width: 7093, height: 5000, description: "84.1x59.4cm 国际标准" },
      { label: "A1 高清 (横幅)", width: 7073, height: 5000, description: "59.4x42cm" },
      { label: "A2 高清 (横幅)", width: 7073, height: 5000, description: "42x29.7cm" },
      { label: "正方形超清 (1:1)", width: 8000, height: 8000, description: "67.7x67.7cm 大幅贴纸/海报" },
      { label: "正方形高清 (1:1)", width: 6000, height: 6000, description: "50.8x50.8cm" },
      { label: "竖版超清 (2:3)", width: 5000, height: 7500, description: "50.8x76.2cm" },
      { label: "竖版高清 (3:4)", width: 5000, height: 6667, description: "50.8x67.7cm" },
      { label: "竖版超清 (4:5)", width: 5000, height: 6250, description: "54.2x67.7cm" },
      { label: "竖版横幅 (9:16)", width: 5000, height: 8889, description: "36.6x65.0cm" },
    ],
  },
  {
    label: "标准纸张与印刷 (300 PPI)",
    options: [
      { label: "信封 (DL尺寸)", width: 10000, height: 5000, description: "220x110mm" },
      { label: "中国标准名片", width: 8333, height: 5000, description: "横版名片 90x54mm" },
      { label: "欧美标准名片 (US)", width: 8750, height: 5000, description: "3.5×2英寸" },
      { label: "日本/国际名片", width: 7754, height: 5000, description: "信用卡尺寸 85x55mm" },
      { label: "US Letter (北美常用)", width: 5000, height: 6471, description: "8.5x11英寸 信纸" },
      { label: "US Legal (北美常用)", width: 5000, height: 8235, description: "8.5x14英寸 法律" },
      { label: "US Tabloid (北美常用)", width: 5000, height: 7727, description: "11x17英寸 报纸" },
      { label: "竖版名片 (中国)", width: 5000, height: 8333, description: "54x90mm" },
      { label: "A6 (国际通版)", width: 5000, height: 7048, description: "明信片/口袋本 10.5x14.8cm" },
      { label: "贺卡/邀请函 (对折)", width: 5000, height: 7000, description: "5x7英寸" },
      { label: "A5 (国际通版)", width: 5000, height: 7097, description: "小折页/手写本 14.8x21cm" },
      { label: "A4 (国际通版)", width: 5000, height: 7071, description: "传单/文档标准 21x29.7cm" },
      { label: "A3 (国际通版)", width: 5000, height: 7074, description: "小图海报/画册 29.7x42cm" },
      { label: "A2 (国际通版)", width: 5000, height: 7071, description: "中型海报/挂历 42x59.4cm" },
      { label: "A1 (国际通版)", width: 5000, height: 7087, description: "大型海报 59.4x84.1cm" },
      { label: "A0 (国际通版)", width: 5000, height: 7069, description: "超大海报/展板 84.1x118.9cm" },
    ],
  },
  {
    label: "国内电商设计",
    options: [
      { label: "PC端通栏海报", width: 13714, height: 5000, description: "网页宽版店铺海报" },
      { label: "淘宝/天猫主图 (1:1)", width: 5000, height: 5000, description: "商品方图主图" },
      { label: "京东主图 (1:1)", width: 5000, height: 5000, description: "京东常标准主图" },
      { label: "1688主图 (1:1)", width: 5000, height: 5000, description: "阿里巴巴国内主图" },
      { label: "拼多多主图 (1:1)", width: 5000, height: 5000, description: "建议正方形高清" },
      { label: "淘宝主图/长图 (3:4)", width: 5000, height: 6667, description: "高点击率长图" },
      { label: "京东详情页", width: 5000, height: 6667, description: "京东移动端设计区" },
      { label: "淘宝无线端主图 (2:3)", width: 5000, height: 7500, description: "女装等长款展示" },
      { label: "拼多多轮播图 (3:4)", width: 5000, height: 6667, description: "拼多多竖版轮播" },
      { label: "淘宝/天猫详情页", width: 5000, height: 10000, description: "无线端标准详宽" },
    ],
  },
  {
    label: "跨境电商设计",
    options: [
      { label: "Etsy店铺横幅", width: 20000, height: 5000, description: "大尺寸横幅" },
      { label: "Etsy商品图 (5:4)", width: 6250, height: 5000, description: "Etsy首图推荐比例" },
      { label: "A+ Content (主横幅)", width: 8083, height: 5000, description: "亚马逊A+页面模块" },
      { label: "eBay主图", width: 5000, height: 5000, description: "eBay高质量正方图" },
      { label: "Amazon主图 (推荐)", width: 5000, height: 5000, description: "支持高清放大(Zoom)" },
      { label: "Etsy商品图 (方)", width: 5000, height: 5000, description: "商品次图/备选" },
      { label: "速卖通主图 (AliExpress)", width: 5000, height: 5000, description: "1:1 正方形" },
      { label: "Shopee主图 (虾皮)", width: 5000, height: 5000, description: "东南亚电商" },
      { label: "独立站通用 (Shopify)", width: 5000, height: 5000, description: "自建站高质量适配" },
    ],
  },
  {
    label: "广告与户外展板",
    options: [
      { label: "横幅/条幅 (3米)", width: 21429, height: 5000, description: "3x0.7m" },
      { label: "海报横幅 (3:2)", width: 7500, height: 5000, description: "76x51cm 展览级" },
      { label: "超宽横幅 (21:9)", width: 11667, height: 5000, description: "89x38cm 宽幅展示" },
      { label: "桌面台卡 (A5)", width: 5000, height: 7097, description: "收款/提示牌" },
      { label: "X展架 (常规)", width: 5000, height: 13333, description: "60x160cm" },
      { label: "易拉宝 (国内常用)", width: 5000, height: 12488, description: "80x200cm" },
    ],
  },
  {
    label: "定制周边: 服饰箱包 (300 PPI)",
    options: [
      { label: "鸭舌帽/棒球帽 (前幅)", width: 12500, height: 5000, description: "贴布/刺绣面 5x2英寸" },
      { label: "左胸小Logo", width: 5000, height: 5000, description: "4x4英寸 刺绣/小标" },
      { label: "卫衣/套头衫正面", width: 5000, height: 5000, description: "14x14英寸方图" },
      { label: "T恤印花区 (常规前胸)", width: 5000, height: 6667, description: "约12x16英寸 (300x400mm)" },
      { label: "环保袋/托特包 (全图)", width: 5000, height: 5714, description: "单肩包约35x40cm" },
      { label: "T恤印花区 (超大满印)", width: 5000, height: 6250, description: "16x20英寸" },
      { label: "袖子印花", width: 5000, height: 21429, description: "3.5x15英寸 侧面袖标" },
      { label: "紧身裤/瑜伽裤 (满印)", width: 5000, height: 6667, description: "裤腿大尺寸满版包裹" },
    ],
  },
  {
    label: "定制周边: 饮具杯具 (300 PPI)",
    options: [
      { label: "11oz 马克杯 (全包围)", width: 12857, height: 5000, description: "9x3.5英寸" },
      { label: "15oz 马克杯 (全包围)", width: 11842, height: 5000, description: "9x3.8英寸" },
      { label: "11oz 马克杯 (常规印花)", width: 10526, height: 5000, description: "200x95mm 单侧/双侧" },
      { label: "运动水壶", width: 7727, height: 5000, description: "8.5x5.5英寸" },
      { label: "20oz Skinny随行保温杯", width: 5673, height: 5000, description: "9.3x8.2英寸" },
      { label: "30oz Skinny随行保温杯", width: 5368, height: 5000, description: "10.2x9.5英寸" },
    ],
  },
  {
    label: "定制周边: 家居桌搭与3C",
    options: [
      { label: "电竞桌垫 (超宽)", width: 10905, height: 5000, description: "1200x550mm 展示/直播桌垫" },
      { label: "桌垫鼠标垫 (700x300)", width: 11667, height: 5000, description: "键盘+鼠标一体桌垫" },
      { label: "电竞鼠标垫 (超大 XL)", width: 11250, height: 5000, description: "900x400mm 满印" },
      { label: "电竞鼠标垫 (加长 L)", width: 13333, height: 5000, description: "800x300mm 满印" },
      { label: "电竞桌垫 (XXL)", width: 10000, height: 5000, description: "1000x500mm 超大桌面垫" },
      { label: "挂毯/背景布 (大)", width: 6667, height: 5000, description: "80x60英寸 150ppi" },
      { label: "挂毯/背景布 (中)", width: 6000, height: 5000, description: "60x50英寸 150ppi" },
      { label: "游戏鼠标垫 (M)", width: 7000, height: 5000, description: "350x250mm 常见游戏规格" },
      { label: "法兰绒毛毯", width: 5000, height: 6000, description: "50x60英寸 150ppi" },
      { label: "大号游戏鼠标垫", width: 6000, height: 5000, description: "300x250mm 游戏/办公两用" },
      { label: "常规办公鼠标垫", width: 6000, height: 5000, description: "240x200mm" },
      { label: "标准鼠标垫", width: 6054, height: 5000, description: "230x190mm 常规通用款" },
      { label: "迷你鼠标垫", width: 6122, height: 5000, description: "220x180mm 小尺寸办公垫" },
      { label: "圆形鼠标垫", width: 5000, height: 5000, description: "直径200mm" },
      { label: "方形抱枕/靠枕", width: 5000, height: 5000, description: "18x18英寸" },
      { label: "手机壳背板 (苹果/安卓)", width: 5000, height: 9286, description: "兼容所有机型" },
      { label: "方形贴纸套件", width: 5000, height: 7500, description: "4x6英寸 不干胶板" },
    ],
  },
  {
    label: "国内社交媒体 (移动端)",
    options: [
      { label: "微信公众号首图", width: 11776, height: 5000, description: "2.35:1 最佳比例" },
      { label: "B站(Bilibili)视频封面", width: 7989, height: 5000, description: "1.6:1" },
      { label: "知乎文章封面图", width: 8889, height: 5000, description: "16:9 内容流顶部" },
      { label: "微信公众号次图", width: 5000, height: 5000, description: "1:1 方形" },
      { label: "微信朋友圈封面", width: 5000, height: 5000, description: "朋友圈相册背景墙" },
      { label: "微博正文配图", width: 5000, height: 5000, description: "宫格1:1或长图皆可" },
      { label: "小红书方图", width: 5000, height: 5000, description: "1:1 正方形图库" },
      { label: "小红书推荐竖图", width: 5000, height: 6250, description: "3:4 最占屏幅比例" },
      { label: "抖音/快手短视频封面", width: 5000, height: 8889, description: "9:16 全屏竖图" },
    ],
  },
  {
    label: "海外社交媒体 (出海投放)",
    options: [
      { label: "LinkedIn公司横幅", width: 29529, height: 5000, description: "领英商业主页Banner" },
      { label: "Facebook封面背景", width: 13120, height: 5000, description: "Facebook公共主页Banner" },
      { label: "Facebook单图广告/推文", width: 9554, height: 5000, description: "带链接的标准广告尺寸" },
      { label: "X(Twitter)推文配图", width: 8889, height: 5000, description: "16:9 防截断比例" },
      { label: "YouTube缩略图", width: 8889, height: 5000, description: "油管视频封面 (推荐)" },
      { label: "YouTube频道横幅 (Banner)", width: 8889, height: 5000, description: "TV/PC/移动端安全区设定" },
      { label: "Instagram帖子 (正方)", width: 5000, height: 5000, description: "1:1" },
      { label: "Instagram帖子 (肖像)", width: 5000, height: 6250, description: "4:5 收割注意力" },
      { label: "Pinterest Pin竖图", width: 5000, height: 7500, description: "2:3 灵感板标准" },
      { label: "Instagram/FB快拍 (Story)", width: 5000, height: 8889, description: "9:16 全竖屏" },
      { label: "TikTok广告竖屏短视频", width: 5000, height: 8889, description: "推荐视频原始帧大小" },
    ],
  },
  {
    label: "贴纸 / 标签 (300 PPI 高清印刷)",
    options: [
      { label: "超宽贴纸 (2:1)", width: 10000, height: 5000, description: "50.8x25.4cm 横幅标签" },
      { label: "宽幅贴纸 (3:2)", width: 7500, height: 5000, description: "50.8x33.9cm 异形贴纸" },
      { label: "横幅贴纸 (16:9)", width: 8889, height: 5000, description: "48.8x27.4cm 长条贴纸" },
      { label: "横幅贴纸 (4:3)", width: 6667, height: 5000, description: "40.6x30.5cm" },
      { label: "方形大贴纸 (1:1)", width: 6000, height: 6000, description: "50.8x50.8cm 大型贴纸" },
      { label: "方形中贴纸 (1:1)", width: 5000, height: 5000, description: "40.6x40.6cm" },
      { label: "竖幅贴纸 (3:4)", width: 5000, height: 6667, description: "30.5x40.6cm 竖版标签" },
      { label: "竖幅贴纸 (2:3)", width: 5000, height: 7500, description: "33.9x50.8cm 长条竖贴" },
      { label: "竖幅贴纸 (4:5)", width: 5000, height: 6250, description: "40.6x50.8cm" },
      { label: "竖幅贴纸 (9:16)", width: 5000, height: 8889, description: "27.4x48.8cm 手机壳贴纸" },
      { label: "贴纸套版 (Letter)", width: 5000, height: 7727, description: "8.5x11英寸 整版贴纸页" },
      { label: "贴纸套版 (A4)", width: 5000, height: 7073, description: "21x29.7cm 整版贴纸页" },
    ],
  },
  {
    label: "地垫/地毯",
    options: [
      { label: "40x60", width: 5000, height: 7500, tags: ["地垫", "地毯", "进门垫", "玄关垫"] },
      { label: "40x120", width: 5000, height: 15000, tags: ["地垫", "地毯", "走廊垫", "长条垫"] },
      { label: "45x75", width: 5000, height: 8333, tags: ["地垫", "地毯"] },
      { label: "45x120", width: 5000, height: 13333, tags: ["地垫", "地毯", "走廊垫"] },
      { label: "45x150", width: 5000, height: 16667, tags: ["地垫", "地毯", "走廊垫"] },
      { label: "50x80", width: 5000, height: 8000, tags: ["地垫", "地毯", "门口垫"] },
      { label: "55x120", width: 5000, height: 10909, tags: ["地垫", "地毯", "走廊垫"] },
      { label: "60x90", width: 5000, height: 7500, tags: ["地垫", "地毯", "门口垫", "入户垫"] },
      { label: "60x120", width: 5000, height: 10000, tags: ["地垫", "地毯", "走廊垫"] },
      { label: "60x160", width: 5000, height: 13333, tags: ["地垫", "地毯", "走廊垫", "长条垫"] },
      { label: "80x120", width: 5000, height: 7500, tags: ["地垫", "地毯", "客厅垫"] },
      { label: "100x100", width: 5000, height: 5000, tags: ["地垫", "地毯", "方形垫", "茶几垫"] },
      { label: "100x150", width: 5000, height: 7500, tags: ["地垫", "地毯", "客厅垫"] },
      { label: "100x160", width: 5000, height: 8000, tags: ["地垫", "地毯"] },
      { label: "120x120", width: 5000, height: 5000, tags: ["地垫", "地毯", "方形垫", "茶几垫"] },
      { label: "120x160", width: 5000, height: 6667, tags: ["地垫", "地毯", "客厅垫"] },
      { label: "140x140", width: 5000, height: 5000, tags: ["地垫", "地毯", "方形垫"] },
      { label: "150x200", width: 5000, height: 6667, tags: ["地垫", "地毯", "客厅垫", "沙发垫"] },
      { label: "160x200", width: 5000, height: 6250, tags: ["地垫", "地毯", "客厅垫", "沙发垫"] },
      { label: "160x230", width: 5000, height: 7188, tags: ["地垫", "地毯", "客厅垫", "大尺寸"] },
    ],
  },
  {
    label: "地垫/地毯 (圆形)",
    options: [
      { label: "直径60", width: 5000, height: 5000, tags: ["地垫", "地毯", "圆形垫", "圆垫"] },
      { label: "直径80", width: 5000, height: 5000, tags: ["地垫", "地毯", "圆形垫", "圆垫"] },
      { label: "直径100", width: 5000, height: 5000, tags: ["地垫", "地毯", "圆形垫", "圆垫"] },
      { label: "直径120", width: 5000, height: 5000, tags: ["地垫", "地毯", "圆形垫", "圆垫"] },
      { label: "直径140", width: 5000, height: 5000, tags: ["地垫", "地毯", "圆形垫", "圆垫"] },
      { label: "直径150", width: 5000, height: 5000, tags: ["地垫", "地毯", "圆形垫", "圆垫", "大尺寸"] },
    ],
  },
  {
    label: "地垫/地毯 (半圆形)",
    options: [
      { label: "40x60 半圆", width: 5000, height: 7500, tags: ["地垫", "地毯", "半圆垫", "半圆形"] },
      { label: "50x80 半圆", width: 5000, height: 8000, tags: ["地垫", "地毯", "半圆垫", "半圆形"] },
      { label: "60x90 半圆", width: 5000, height: 7500, tags: ["地垫", "地毯", "半圆垫", "半圆形"] },
    ],
  },
  {
    label: "沥水垫/灶台垫",
    options: [
      { label: "20x30", width: 5000, height: 7500, tags: ["沥水垫", "灶台垫", "杯垫", "小垫"] },
      { label: "30x40", width: 5000, height: 6667, tags: ["沥水垫", "灶台垫", "杯垫"] },
      { label: "36x46", width: 5000, height: 6389, tags: ["沥水垫", "灶台垫"] },
      { label: "38x38", width: 5000, height: 5000, tags: ["沥水垫", "灶台垫", "方形垫"] },
      { label: "40x50", width: 5000, height: 6250, tags: ["沥水垫", "灶台垫"] },
      { label: "40x60", width: 5000, height: 7500, tags: ["沥水垫", "灶台垫", "厨房垫"] },
      { label: "40x70", width: 5000, height: 8750, tags: ["沥水垫", "灶台垫"] },
      { label: "40x80", width: 5000, height: 10000, tags: ["沥水垫", "灶台垫", "厨房垫"] },
      { label: "45x30", width: 7500, height: 5000, tags: ["沥水垫", "灶台垫", "杯垫"] },
      { label: "48x71", width: 5000, height: 7396, tags: ["沥水垫", "灶台垫"] },
      { label: "48x86", width: 5000, height: 8958, tags: ["沥水垫", "灶台垫"] },
      { label: "50x50", width: 5000, height: 5000, tags: ["沥水垫", "灶台垫", "方形垫"] },
      { label: "50x60", width: 5000, height: 6000, tags: ["沥水垫", "灶台垫"] },
      { label: "50x80", width: 5000, height: 8000, tags: ["沥水垫", "灶台垫"] },
      { label: "52x60", width: 5000, height: 5769, tags: ["沥水垫", "灶台垫"] },
      { label: "52x72", width: 5000, height: 6923, tags: ["沥水垫", "灶台垫"] },
      { label: "56x78", width: 5000, height: 6964, tags: ["沥水垫", "灶台垫"] },
      { label: "56x86", width: 5000, height: 7679, tags: ["沥水垫", "灶台垫"] },
      { label: "60x60", width: 5000, height: 5000, tags: ["沥水垫", "灶台垫", "方形垫"] },
      { label: "60x90", width: 5000, height: 7500, tags: ["沥水垫", "灶台垫"] },
      { label: "60x120", width: 5000, height: 10000, tags: ["沥水垫", "灶台垫", "大尺寸"] },
      { label: "75x75", width: 5000, height: 5000, tags: ["沥水垫", "灶台垫", "方形垫"] },
      { label: "80x80", width: 5000, height: 5000, tags: ["沥水垫", "灶台垫", "方形垫"] },
      { label: "80x120", width: 5000, height: 7500, tags: ["沥水垫", "灶台垫", "大尺寸"] },
    ],
  },
  {
    label: "鼠标垫",
    options: [
      { label: "20x20", width: 5000, height: 5000, tags: ["鼠标垫", "小鼠标垫", "方形"] },
      { label: "20x24", width: 5000, height: 6000, tags: ["鼠标垫", "小鼠标垫"] },
      { label: "21x26", width: 5000, height: 6190, tags: ["鼠标垫"] },
      { label: "22x18", width: 6111, height: 5000, tags: ["鼠标垫", "小鼠标垫"] },
      { label: "25x25", width: 5000, height: 5000, tags: ["鼠标垫", "方形", "异形鼠标垫"] },
      { label: "25x29", width: 5000, height: 5800, tags: ["鼠标垫"] },
      { label: "30x30", width: 5000, height: 5000, tags: ["鼠标垫", "方形", "异形鼠标垫"] },
      { label: "30x60", width: 5000, height: 10000, tags: ["鼠标垫", "中号鼠标垫"] },
      { label: "30x70", width: 5000, height: 11667, tags: ["鼠标垫", "中号鼠标垫"] },
      { label: "30x80", width: 5000, height: 13333, tags: ["鼠标垫", "大鼠标垫"] },
      { label: "40x70", width: 5000, height: 8750, tags: ["鼠标垫", "大鼠标垫"] },
      { label: "40x80", width: 5000, height: 10000, tags: ["鼠标垫", "大鼠标垫", "加长鼠标垫"] },
      { label: "40x90", width: 5000, height: 11250, tags: ["鼠标垫", "大鼠标垫", "加长鼠标垫"] },
      { label: "90x40", width: 11250, height: 5000, tags: ["鼠标垫", "大鼠标垫", "加长鼠标垫", "横版鼠标垫"] },
      { label: "100x50", width: 10000, height: 5000, tags: ["鼠标垫", "超大鼠标垫", "桌垫", "电竞鼠标垫"] },
    ],
  },
  {
    label: "楼梯垫/汽车垫",
    options: [
      { label: "20x75", width: 5000, height: 18750, tags: ["楼梯垫", "楼梯", "台阶垫"] },
      { label: "100x75", width: 6667, height: 5000, tags: ["汽车垫", "后备箱垫", "车垫"] },
    ],
  },
  {
    label: "浴室地垫",
    options: [
      { label: "40x60", width: 5000, height: 7500, tags: ["浴室垫", "浴室地垫", "卫生间垫"] },
      { label: "40x120", width: 5000, height: 15000, tags: ["浴室垫", "浴室地垫", "卫生间垫", "长条垫"] },
      { label: "50x80", width: 5000, height: 8000, tags: ["浴室垫", "浴室地垫", "卫生间垫"] },
    ],
  },
];

// ==================== 搜索过滤 ====================

const keyword = computed(() => searchKeyword.value.trim().toLowerCase());

// 是否显示比例快选区
const showRatioSection = computed(() => {
  if (!keyword.value) return true;
  // 搜索词含比例相关关键词时显示
  const ratioHints = [':', '：', '比', 'ratio', '比例', '宽屏', '竖屏', '横版', '竖版', '正方', '宽'];
  return ratioHints.some(h => keyword.value.includes(h)) || filteredRatios.value.length > 0;
});

// 过滤比例
const filteredRatios = computed(() => {
  if (!keyword.value) return allRatios.value;
  return allRatios.value.filter(r => {
    const text = [r.display, r.name, r.description, r.usage].join(' ').toLowerCase();
    return text.includes(keyword.value);
  });
});

// 过滤尺寸
const filteredSizeGroups = computed(() => {
  if (!keyword.value) return sizeGroups;
  return sizeGroups
    .map((group) => {
      const groupMatched = group.label.toLowerCase().includes(keyword.value);
      const options = group.options.filter((item) => {
        const searchableText = [
          item.label,
          item.description,
          ...(item.tags || []),
          `${item.width}x${item.height}`,
          `${item.width} x ${item.height}`,
          `${item.width}/${item.height}`,
          formatDisplayRatio(item),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return groupMatched || searchableText.includes(keyword.value);
      });
      return { ...group, options };
    })
    .filter((group) => group.options.length > 0);
});

const matchedCount = computed(() => {
  return filteredRatios.value.length + filteredSizeGroups.value.reduce(
    (count, group) => count + group.options.length, 0,
  );
});

// ==================== 工具函数 ====================

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function formatDisplayRatio(item: SizeOption) {
  const width = Number(item.width || 0);
  const height = Number(item.height || 0);
  if (!width || !height) return "1 : 1";
  const divisor = gcd(Math.round(width), Math.round(height));
  const w = Math.round(width / divisor);
  const h = Math.round(height / divisor);
  if (w > 100 || h > 100) return `${width} : ${height}`;
  return `${w} : ${h}`;
}

function getRatioStyle(item: SizeOption) {
  const ratio = item.width / item.height;
  const MAX_SIZE = 36;
  let w, h;
  if (ratio > 1) {
    w = MAX_SIZE;
    h = MAX_SIZE / ratio;
  } else {
    h = MAX_SIZE;
    w = MAX_SIZE * ratio;
  }
  return {
    width: `${w}px`,
    height: `${h}px`,
    borderRadius: "2px",
    backgroundColor: "var(--1s-control-surface-muted)",
    border: "1px solid var(--1s-border-color)",
    transition: "all 0.2s ease",
  };
}

function handleSelect(item: SizeOption) {
  emit("select", {
    width: item.width,
    height: item.height,
  });
  dialogVisible.value = false;
}
</script>

<style scoped>
.size-presets-trigger {
  padding: 2px 8px 8px;
  box-sizing: border-box;
}

.size-presets-trigger :deep(.u-btn),
.size-presets-trigger :deep(button) {
  height: var(--1s-control-h-sm);
  gap: 5px;
  font-size: var(--1s-control-font-md);
}

.preset-container {
  height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 0 24px 40px;
  background: var(--1s-surface-background, #ffffff);
  color: var(--1s-text-color, #09090b);
}

.preset-search {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0 16px;
  margin-bottom: 12px;
  background: var(--1s-surface-background);
  border-bottom: 1px solid var(--1s-border-color);
}

:global(html.dark) .preset-search,
:global(.dark) .preset-search {
  background: var(--1s-surface-background);
  border-bottom-color: var(--1s-border-color);
}

.preset-search-input {
  max-width: 440px;
}

.preset-search-meta {
  font-size: 11px;
  font-weight: 500;
  color: var(--1s-text-color-secondary, #71717a);
  white-space: nowrap;
}

.preset-empty {
  padding: 60px 0;
  text-align: center;
  font-size: 12px;
  color: var(--1s-text-color-secondary, #71717a);
}

.preset-container::-webkit-scrollbar {
  width: 6px;
}
.preset-container::-webkit-scrollbar-thumb {
  background-color: var(--1s-scrollbar-background, rgba(0, 0, 0, 0.18));
  border-radius: 4px;
}

/* 比例快选区 */
.ratio-section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 14px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--1s-border-color, #e4e4e7);
  color: var(--1s-text-color, #09090b);
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.02em;
}

.section-desc {
  font-size: 11px;
  font-weight: 400;
  color: var(--1s-text-color-secondary, #71717a);
}

.ratio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
}

.ratio-card {
  border-radius: 8px;
  padding: 10px 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background-color: var(--1s-elevated-background, #f4f4f5);
  border: 1px solid var(--1s-border-color, #e4e4e7);
}

.ratio-card:hover {
  background-color: var(--1s-hover-background, rgba(0, 0, 0, 0.04));
  border-color: var(--1s-border-color-strong, #a1a1aa);
  
}

:global(html.dark) .ratio-card,
:global(.dark) .ratio-card {
  background-color: var(--1s-elevated-background);
  border-color: var(--1s-border-color);
}

:global(html.dark) .ratio-card:hover,
:global(.dark) .ratio-card:hover {
  background-color: var(--1s-hover-background);
  border-color: var(--1s-border-color-strong);
}

.ratio-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ratio-inner {
  width: 100%;
  height: 100%;
  background-color: var(--1s-surface-background, #ffffff);
  border: 1px solid var(--1s-dialog-border);
  border-radius: 3px;
  transition: all 0.15s ease;
}

:global(html.dark) .ratio-inner,
:global(.dark) .ratio-inner {
  background-color: var(--1s-surface-background);
  border-color: var(--1s-border-color-strong);
}

.ratio-info {
  text-align: center;
}

.ratio-label {
  font-weight: 700;
  font-size: 12px;
  color: var(--1s-text-color, #09090b);
}

.ratio-name {
  font-size: 10px;
  color: var(--1s-text-color-secondary, #71717a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

/* 常用尺寸分组 */
.preset-group {
  margin-bottom: 28px;
}

.group-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--1s-border-color, #e4e4e7);
  color: var(--1s-text-color, #09090b);
  letter-spacing: 0.02em;
}

.preset-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.preset-card {
  border-radius: 8px;
  padding: 10px 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--1s-elevated-background, #f4f4f5);
  border: 1px solid var(--1s-border-color, #e4e4e7);
}

.preset-card:hover {
  background-color: var(--1s-hover-background, rgba(0, 0, 0, 0.04));
  border-color: var(--1s-border-color-strong, #a1a1aa);
  
}

:global(html.dark) .preset-card,
:global(.dark) .preset-card {
  background-color: var(--1s-elevated-background);
  border-color: var(--1s-border-color);
}

:global(html.dark) .preset-card:hover,
:global(.dark) .preset-card:hover {
  background-color: var(--1s-hover-background);
  border-color: var(--1s-border-color-strong);
}

.preview-box {
  width: 100%;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px;
}

.aspect-ratio-box {
  background-color: var(--1s-surface-background, #ffffff) !important;
  border: 1px solid var(--1s-dialog-border) !important;
  border-radius: 3px;
}

:global(html.dark) .aspect-ratio-box,
:global(.dark) .aspect-ratio-box {
  background-color: var(--1s-surface-background) !important;
  border-color: var(--1s-border-color-strong) !important;
}

.preset-info {
  text-align: center;
  width: 100%;
}

.preset-label {
  font-weight: 600;
  font-size: 11px;
  margin-bottom: 2px;
  color: var(--1s-text-color, #09090b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preset-size {
  font-size: 10px;
  color: var(--1s-text-color-secondary, #71717a);
  font-family: monospace;
}

.preset-ratio {
  font-size: 10px;
  font-weight: 600;
  color: var(--1s-text-color, #09090b);
  margin-top: 2px;
  letter-spacing: 0.2px;
}

.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
  justify-content: center;
}

.preset-tags .tag {
  font-size: 9px;
  padding: 0 4px;
  background-color: var(--1s-surface-background, #ffffff);
  color: var(--1s-text-color-secondary, #71717a);
  border-radius: 3px;
  border: 1px solid var(--1s-border-color, #e4e4e7);
  white-space: nowrap;
}

:global(html.dark) .preset-tags .tag,
:global(.dark) .preset-tags .tag {
  background-color: var(--1s-surface-background);
  border-color: var(--1s-border-color);
  color: var(--1s-text-color-secondary);
}

@media (max-width: 768px) {
  .preset-search {
    align-items: stretch;
    flex-direction: column;
  }

  .preset-search-input {
    max-width: none;
    width: 100%;
  }

  .preset-search-meta {
    width: 100%;
    text-align: left;
  }
}

/* 比例尺寸弹窗样式 */
.ratio-dialog-content {
  padding: 0;
  color: var(--1s-text-color, #09090b);
}

.ratio-dialog-desc {
  font-size: 11px;
  color: var(--1s-text-color-secondary, #71717a);
  margin-bottom: 14px;
}

.ratio-dialog-section {
  margin-bottom: 16px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--1s-text-color, #09090b);
  margin-bottom: 8px;
}

.width-quick-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.custom-width-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.width-label {
  font-size: 11px;
  color: var(--1s-text-color-secondary, #71717a);
}

.custom-width-input {
  width: 140px;
}

.width-unit {
  font-size: 11px;
  color: var(--1s-text-color-secondary, #71717a);
}

.ratio-dialog-result {
  padding: 12px;
  background-color: var(--1s-elevated-background, #f4f4f5);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 8px;
  text-align: center;
}

:global(html.dark) .ratio-dialog-result,
:global(.dark) .ratio-dialog-result {
  background-color: var(--1s-elevated-background);
  border-color: var(--1s-border-color);
}

.result-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.result-width,
.result-height {
  font-size: 22px;
  font-weight: 700;
  color: var(--1s-text-color, #09090b);
  font-family: monospace;
}

.result-x {
  font-size: 16px;
  color: var(--1s-text-color-secondary, #71717a);
}

.result-unit {
  font-size: 12px;
  color: var(--1s-text-color-secondary, #71717a);
}
</style>
