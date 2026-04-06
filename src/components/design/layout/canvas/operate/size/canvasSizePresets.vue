<template>
    <operate-form-item>
        <template #icon>
            <Setting />
        </template>
        <template #name> 常用尺寸比例 </template>
        <template #content>
            <el-button 
                size="small" 
                @click="dialogVisible = true" 
                style="width: 160px"
            >
                选择常用尺寸
            </el-button>
        </template>
    </operate-form-item>

    <el-dialog
        v-model="dialogVisible"
        title="选择常用尺寸比例"
        fullscreen
        append-to-body
        class="size-presets-dialog"
    >
        <div class="preset-container">
            <div class="preset-search">
                <el-input
                    v-model="searchKeyword"
                    placeholder="搜索商品、用途或尺寸，例如：鼠标垫 / 杯子 / 900x400"
                    clearable
                    class="preset-search-input"
                >
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
                <div class="preset-search-meta">
                    共 {{ matchedPresetCount }} 个结果
                </div>
            </div>

            <div v-if="filteredSizeGroups.length === 0" class="preset-empty">
                没有找到匹配的尺寸，试试搜索商品名称、用途或具体规格。
            </div>

            <div v-for="group in filteredSizeGroups" :key="group.label" class="preset-group">
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
                            <div class="preset-size">
                                {{ item.width }} x {{ item.height }}
                            </div>
                            <div class="preset-ratio">
                                比例 {{ formatDisplayRatio(item) }}
                            </div>
                            <div class="preset-desc" v-if="item.description">{{ item.description }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Search, Setting } from "@element-plus/icons-vue";
import operateFormItem from "../operateFormItem.vue";

const emit = defineEmits(['select']);

const dialogVisible = ref(false);
const searchKeyword = ref('');

interface SizeOption {
    label: string;
    width: number;
    height: number;
    ratio?: number;
    description?: string;
}

interface SizeGroup {
    label: string;
    options: SizeOption[];
}

const sizeGroups: SizeGroup[] = [
    {
        label: '通用比例 / 屏幕',
        options: [
            { label: '正方形 (1:1)', width: 1080, height: 1080 },
            { label: '高清横屏 (16:9)', width: 1920, height: 1080 },
            { label: '电影宽屏 (21:9)', width: 2560, height: 1080 },
            { label: '传统屏幕 (4:3)', width: 1024, height: 768 },
            { label: '移动端全屏 (9:16)', width: 1080, height: 1920 },
            { label: '黄金比例横向 (1.618:1)', width: 1618, height: 1000 },
            { label: '4K超清宽屏', width: 3840, height: 2160 },
        ]
    },
    {
        label: '标准纸张与印刷 (300 PPI，最大边 5000px)',
        options: [
            { label: 'A0 (国际通版)', width: 3541, height: 5000, description: '超大海报/展板' },
            { label: 'A1 (国际通版)', width: 3532, height: 5000, description: '大型海报' },
            { label: 'A2 (国际通版)', width: 3534, height: 5000, description: '中型海报/挂历' },
            { label: 'A3 (国际通版)', width: 3534, height: 5000, description: '小图海报/画册' },
            { label: 'A4 (国际通版)', width: 2480, height: 3508, description: '传单/文档标准' },
            { label: 'A5 (国际通版)', width: 1748, height: 2480, description: '小折页/手写本' },
            { label: 'A6 (国际通版)', width: 1240, height: 1748, description: '明信片/口袋本' },
            { label: 'US Letter (北美常用)', width: 2550, height: 3300, description: '8.5x11英寸 信纸' },
            { label: 'US Legal (北美常用)', width: 2550, height: 4200, description: '8.5x14英寸 法律' },
            { label: 'US Tabloid (北美常用)', width: 3235, height: 5000, description: '11x17英寸 报纸' },
            { label: '中国标准名片', width: 1063, height: 638, description: '横版名片 90x54mm' },
            { label: '竖版名片 (中国)', width: 638, height: 1063, description: '54x90mm' },
            { label: '欧美标准名片 (US)', width: 1050, height: 600, description: '3.5×2英寸' },
            { label: '日本/国际名片', width: 1004, height: 650, description: '信用卡尺寸 85x55mm' },
            { label: '贺卡/邀请函 (对折)', width: 1500, height: 2100, description: '5x7英寸' },
            { label: '信封 (DL尺寸)', width: 2598, height: 1299, description: '220x110mm' },
        ]
    },
    {
        label: '国内电商设计',
        options: [
            { label: '淘宝/天猫主图 (1:1)', width: 800, height: 800, description: '商品方图主图' },
            { label: '淘宝主图/长图 (3:4)', width: 750, height: 1000, description: '高点击率长图' },
            { label: '淘宝无线端主图 (2:3)', width: 800, height: 1200, description: '女装等长款展示' },
            { label: '淘宝/天猫详情页', width: 750, height: 1500, description: '无线端标准详宽' },
            { label: 'PC端通栏海报', width: 1920, height: 700, description: '网页宽版店铺海报' },
            { label: '京东主图 (1:1)', width: 800, height: 800, description: '京东常标准主图' },
            { label: '京东详情页', width: 750, height: 1000, description: '京东移动端设计区' },
            { label: '1688主图 (1:1)', width: 750, height: 750, description: '阿里巴巴国内主图' },
            { label: '拼多多主图 (1:1)', width: 800, height: 800, description: '建议正方形高清' },
            { label: '拼多多轮播图 (3:4)', width: 1080, height: 1440, description: '拼多多竖版轮播' },
        ]
    },
    {
        label: '跨境电商设计',
        options: [
            { label: 'Amazon主图 (推荐)', width: 2000, height: 2000, description: '支持高清放大(Zoom)' },
            { label: 'Amazon主图 (最低)', width: 1000, height: 1000, description: '亚马逊基础要求' },
            { label: 'A+ Content (主横幅)', width: 970, height: 600, description: '亚马逊A+页面模块' },
            { label: '速卖通主图 (AliExpress)', width: 1000, height: 1000, description: '1:1 正方形' },
            { label: 'Shopee主图 (虾皮)', width: 800, height: 800, description: '东南亚电商' },
            { label: 'Etsy商品图 (5:4)', width: 2000, height: 1600, description: 'Etsy首图推荐比例' },
            { label: 'Etsy商品图 (方)', width: 2000, height: 2000, description: '商品次图/备选' },
            { label: 'Etsy店铺横幅', width: 3360, height: 840, description: '大尺寸横幅' },
            { label: 'eBay主图', width: 1600, height: 1600, description: 'eBay高质量正方图' },
            { label: '独立站通用 (Shopify)', width: 1080, height: 1080, description: '自建站高质量适配' }
        ]
    },
    {
        label: '广告与户外展板 (最大边 5000px)',
        options: [
            { label: '易拉宝 (国内常用)', width: 2002, height: 5000, description: '80x200cm (推荐下调DPI)' },
            { label: 'X展架 (常规)', width: 1875, height: 5000, description: '60x160cm' },
            { label: '横幅/条幅 (3米)', width: 5000, height: 1166, description: '3x0.7m (需下调DPI导出)' },
            { label: '桌面台卡 (A5)', width: 1748, height: 2480, description: '收款/提示牌' },
        ]
    },
    {
        label: '定制周边: 服饰箱包 (300 PPI，最大边 5000px)',
        options: [
            { label: 'T恤印花区 (超大满印)', width: 4000, height: 5000, description: '16x20英寸' },
            { label: 'T恤印花区 (常规前胸)', width: 3543, height: 4724, description: '约12x16英寸 (300x400mm)' },
            { label: '卫衣/套头衫正面', width: 4200, height: 4200, description: '14x14英寸方图' },
            { label: '左胸小Logo', width: 1200, height: 1200, description: '4x4英寸 刺绣/小标' },
            { label: '袖子印花', width: 1050, height: 4500, description: '3.5x15英寸 侧面袖标' },
            { label: '环保袋/托特包 (全图)', width: 4134, height: 4724, description: '单肩包约35x40cm' },
            { label: '鸭舌帽/棒球帽 (前幅)', width: 1500, height: 600, description: '贴布/刺绣面 5x2英寸' },
            { label: '紧身裤/瑜伽裤 (满印)', width: 3750, height: 5000, description: '裤腿大尺寸满版包裹' },
        ]
    },
    {
        label: '定制周边: 饮具杯具 (300 PI)',
        options: [
            { label: '11oz 马克杯 (常规印花)', width: 2362, height: 1122, description: '200x95mm 单侧/双侧' },
            { label: '11oz 马克杯 (全包围)', width: 2700, height: 1050, description: '9x3.5英寸' },
            { label: '15oz 马克杯 (全包围)', width: 2700, height: 1140, description: '9x3.8英寸' },
            { label: '20oz Skinny随行保温杯', width: 2790, height: 2460, description: '9.3x8.2英寸' },
            { label: '30oz Skinny随行保温杯', width: 3060, height: 2850, description: '10.2x9.5英寸' },
            { label: '运动水壶', width: 2550, height: 1650, description: '8.5x5.5英寸' },
        ]
    },
    {
        label: '定制周边: 家居桌搭与3C (300/150 PPI，最大边 5000px)',
        options: [
            { label: '迷你鼠标垫', width: 2598, height: 2126, description: '220x180mm 小尺寸办公垫' },
            { label: '标准鼠标垫', width: 2717, height: 2244, description: '230x190mm 常规通用款' },
            { label: '电竞鼠标垫 (超大 XL)', width: 5000, height: 2224, description: '900x400mm 满印' },
            { label: '电竞鼠标垫 (加长 L)', width: 5000, height: 1875, description: '800x300mm 满印' },
            { label: '常规办公鼠标垫', width: 2835, height: 2362, description: '240x200mm' },
            { label: '大号游戏鼠标垫', width: 3543, height: 2953, description: '300x250mm 游戏/办公两用' },
            { label: '游戏鼠标垫 (M)', width: 4134, height: 2953, description: '350x250mm 常见游戏规格' },
            { label: '桌垫鼠标垫 (700x300)', width: 5000, height: 2143, description: '键盘+鼠标一体桌垫' },
            { label: '电竞桌垫 (XXL)', width: 5000, height: 2500, description: '1000x500mm 超大桌面垫' },
            { label: '电竞桌垫 (超宽)', width: 5000, height: 2292, description: '1200x550mm 展示/直播桌垫' },
            { label: '圆形鼠标垫', width: 2362, height: 2362, description: '直径200mm' },
            { label: '手机壳背板 (苹果/安卓)', width: 1050, height: 1950, description: '兼容所有机型含初延' },
            { label: '挂毯/背景布 (大)', width: 5000, height: 3750, description: '80x60英寸 150ppi' },
            { label: '挂毯/背景布 (中)', width: 5000, height: 4167, description: '60x50英寸 150ppi' },
            { label: '方形抱枕/靠枕', width: 4629, height: 4629, description: '18x18英寸' },
            { label: '法兰绒毛毯', width: 4167, height: 5000, description: '50x60英寸 150ppi' },
            { label: '方形贴纸套件', width: 1200, height: 1800, description: '4x6英寸 不干胶板' },
        ]
    },
    {
        label: '国内社交媒体 (移动端)',
        options: [
            { label: '微信公众号首图', width: 900, height: 383, description: '2.35:1 最佳比例' },
            { label: '微信公众号次图', width: 200, height: 200, description: '1:1 方形' },
            { label: '微信朋友圈封面', width: 1200, height: 1200, description: '朋友圈相册背景墙' },
            { label: '小红书推荐竖图', width: 1080, height: 1350, description: '3:4 最占屏幅比例' },
            { label: '小红书方图', width: 1080, height: 1080, description: '1:1 正方形图库' },
            { label: '抖音/快手短视频封面', width: 1080, height: 1920, description: '9:16 全屏竖图' },
            { label: 'B站(Bilibili)视频封面', width: 1146, height: 717, description: '1.6:1' },
            { label: '微博正文配图', width: 1200, height: 1200, description: '宫格1:1或长图皆可' },
            { label: '知乎文章封面图', width: 1920, height: 1080, description: '16:9 内容流顶部' },
        ]
    },
    {
        label: '海外社交媒体 (出海投放)',
        options: [
            { label: 'Instagram帖子 (正方)', width: 1080, height: 1080, description: '1:1' },
            { label: 'Instagram帖子 (肖像)', width: 1080, height: 1350, description: '4:5 收割注意力' },
            { label: 'Instagram/FB快拍 (Story)', width: 1080, height: 1920, description: '9:16 全竖屏' },
            { label: 'Facebook单图广告/推文', width: 1200, height: 628, description: '带链接的标准广告尺寸' },
            { label: 'Facebook封面背景', width: 1640, height: 624, description: 'Facebook公共主页Banner' },
            { label: 'YouTube缩略图', width: 1280, height: 720, description: '油管视频封面 (推荐)' },
            { label: 'YouTube频道横幅 (Banner)', width: 2560, height: 1440, description: 'TV/PC/移动端安全区设定' },
            { label: 'X(Twitter)推文配图', width: 1200, height: 675, description: '16:9 防截断比例' },
            { label: 'Pinterest Pin竖图', width: 1000, height: 1500, description: '2:3 灵感板标准' },
            { label: 'LinkedIn公司横幅', width: 1128, height: 191, description: '领英商业主页Banner' },
            { label: 'TikTok广告竖屏短视频', width: 1080, height: 1920, description: '推荐视频原始帧大小' }
        ]
    }
];

const filteredSizeGroups = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase();

    if (!keyword) {
        return sizeGroups;
    }

    return sizeGroups
        .map((group) => {
            const groupMatched = group.label.toLowerCase().includes(keyword);
            const options = group.options.filter((item) => {
                const searchableText = [
                    item.label,
                    item.description,
                    `${item.width}x${item.height}`,
                    `${item.width} x ${item.height}`,
                    `${item.width}/${item.height}`,
                    formatDisplayRatio(item)
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                return groupMatched || searchableText.includes(keyword);
            });

            return {
                ...group,
                options
            };
        })
        .filter((group) => group.options.length > 0);
});

const matchedPresetCount = computed(() => {
    return filteredSizeGroups.value.reduce((count, group) => count + group.options.length, 0);
});

function formatDisplayRatio(item: SizeOption) {
    const width = Number(item.width || 0);
    const height = Number(item.height || 0);

    if (!width || !height) {
        return '1.00 : 1.00';
    }

    if (width >= height) {
        return `${(width / height).toFixed(2)} : 1.00`;
    }

    return `1.00 : ${(height / width).toFixed(2)}`;
}

function getRatioStyle(item: SizeOption) {
    const ratio = item.width / item.height;
    // Base size limit for the preview box (smaller size for flat design)
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
        borderRadius: '2px',
        backgroundColor: '#e4e7ed',
        border: '1px solid #dcdfe6',
        transition: 'all 0.2s ease'
    };
}

function handleSelect(item: SizeOption) {
    emit('select', {
        width: item.width,
        height: item.height
    });
    dialogVisible.value = false;
}
</script>

<style scoped>
.preset-container {
    height: calc(100vh - 120px);
    overflow-y: auto;
    padding: 0 20px 40px;
}

.preset-search {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0 16px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(8px);
}

.preset-search-input {
    max-width: 420px;
}

.preset-search-meta {
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
}

.preset-empty {
    padding: 48px 0;
    text-align: center;
    font-size: 13px;
    color: #909399;
}

/* 隐藏滚动条但保留功能 */
.preset-container::-webkit-scrollbar {
    width: 6px;
}
.preset-container::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 4px;
}

.preset-group {
    margin-bottom: 24px;
}

.group-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #f0f0f0;
    color: #606266;
}

.preset-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
}

.preset-card {
    border-radius: 6px;
    padding: 12px 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f8f9fa;
    border: 1px solid transparent;
}

.preset-card:hover {
    background-color: #f0f4ff;
    border-color: var(--el-color-primary-light-5);
    transform: translateY(-1px);
}

.preset-card:hover .aspect-ratio-box {
    background-color: var(--el-color-primary-light-8) !important;
    border-color: var(--el-color-primary) !important;
}

.preview-box {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
}

.preset-info {
    text-align: center;
    width: 100%;
}

.preset-label {
    font-weight: 500;
    font-size: 12px;
    margin-bottom: 4px;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.preset-size {
    font-size: 11px;
    color: #909399;
}

.preset-ratio {
    font-size: 11px;
    color: #606266;
    margin-top: 2px;
}

.preset-desc {
    font-size: 11px;
    color: #c0c4cc;
    margin-top: 2px;
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
</style>
