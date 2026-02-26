
export interface ColorItem {
    name: string;
    color: string;
    type: 'pure' | 'gradient';
    description?: string;
}

export interface ColorCategory {
    name: string;
    items: ColorItem[];
}

export const colorLibrary: ColorCategory[] = [
    {
        name: '精选渐变 (Top 50)',
        items: [
            { name: 'Warm Flame', color: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)', type: 'gradient', description: '温暖的火焰，柔和的粉橙色调' },
            { name: 'Night Fade', color: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)', type: 'gradient', description: '夜幕降临，紫罗兰色的渐进' },
            { name: 'Spring Warmth', color: 'linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)', type: 'gradient', description: '春日的温暖，清新脱俗' },
            { name: 'Juicy Peach', color: 'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)', type: 'gradient', description: '水蜜桃般的甜香感' },
            { name: 'Young Passion', color: 'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)', type: 'gradient', description: '年轻的激情' },
            { name: 'Lady Lips', color: 'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', type: 'gradient', description: '娇艳的唇色' },
            { name: 'Sunny Morning', color: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', type: 'gradient' },
            { name: 'Rainy Ashville', color: 'linear-gradient(to top, #fdfcfb 0%, #e2ebf0 100%)', type: 'gradient' },
            { name: 'Frozen Dreams', color: 'linear-gradient(to top, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)', type: 'gradient' },
            { name: 'Winter Neva', color: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', type: 'gradient' },
            { name: 'Dusty Grass', color: 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)', type: 'gradient' },
            { name: 'Tempting Azure', color: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', type: 'gradient' },
            { name: 'Heavy Rain', color: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', type: 'gradient' },
            { name: 'Amy Crisp', color: 'linear-gradient(120deg, #a6c0fe 0%, #f68084 100%)', type: 'gradient' },
            { name: 'Mean Fruit', color: 'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)', type: 'gradient' },
            { name: 'Deep Blue', color: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)', type: 'gradient' },
            { name: 'Ripe Malinka', color: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', type: 'gradient' },
            { name: 'Cloudy Knoxville', color: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)', type: 'gradient' },
            { name: 'Malibu Beach', color: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', type: 'gradient' },
            { name: 'New Retiro', color: 'linear-gradient(to top, #3b41c5 0%, #a981bb 49%, #ffc8a9 100%)', type: 'gradient' },
            { name: 'Fresh Milk', color: 'linear-gradient(to top, #feada6 0%, #f5efef 100%)', type: 'gradient' },
            { name: 'Snowy Mint', color: 'linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%)', type: 'gradient' },
            { name: 'Everlasting Sky', color: 'linear-gradient(135deg, #fdfcfb 0%, #e2ebf0 100%)', type: 'gradient' },
            { name: 'Plum Plate', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', type: 'gradient' },
            { name: 'Premium Dark', color: 'linear-gradient(135deg, #434343 0%, #000000 100%)', type: 'gradient' },
            { name: 'Happy Fisher', color: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)', type: 'gradient' },
            { name: 'Blessing', color: 'linear-gradient(to top, #fddb92 0%, #d1f2ff 100%)', type: 'gradient' },
            { name: 'Sharpeye', color: 'linear-gradient(to top, #330867 0%, #30cfd0 100%)', type: 'gradient' },
            { name: 'Stellar', color: 'linear-gradient(to right, #7474bf, #348ac7)', type: 'gradient' },
            { name: 'Under the Lake', color: 'linear-gradient(to right, #093028, #237a57)', type: 'gradient' },
            { name: 'Honey Dew', color: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', type: 'gradient' },
            { name: 'Morning Glow', color: 'linear-gradient(to right, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', type: 'gradient' },
            { name: 'River City', color: 'linear-gradient(to top, #4481eb 0%, #04befe 100%)', type: 'gradient' },
            { name: 'Soft Grass', color: 'linear-gradient(to top, #c1dfc4 0%, #deecdd 100%)', type: 'gradient' },
            { name: 'Mars Party', color: 'linear-gradient(to top, #5f72bd 0%, #9b23ea 100%)', type: 'gradient' },
            { name: 'Eternal Constance', color: 'linear-gradient(to top, #09203f 0%, #537895 100%)', type: 'gradient' },
            { name: 'Japan Blush', color: 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)', type: 'gradient' },
            { name: 'Smiling Rain', color: 'linear-gradient(-20deg, #dcb0ed 0%, #99c99c 100%)', type: 'gradient' },
            { name: 'Cloudy Apple', color: 'linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)', type: 'gradient' },
            { name: 'Big Mango', color: 'linear-gradient(to top, #f093fb 0%, #f5576c 100%)', type: 'gradient' },
            { name: 'Healthy Water', color: 'linear-gradient(120deg, #96deda 0%, #50c9c3 100%)', type: 'gradient' },
            { name: 'Amour Amour', color: 'linear-gradient(to top, #f77062 0%, #fe5196 100%)', type: 'gradient' },
            { name: 'Risky Concrete', color: 'linear-gradient(to top, #c471f5 0%, #fa71cd 100%)', type: 'gradient' },
            { name: 'Strong Bliss', color: 'linear-gradient(to right, #f78ca0 0%, #f9748f 19%, #fd868c 60%, #fe9a8b 100%)', type: 'gradient' },
            { name: 'Sweet Period', color: 'linear-gradient(to top, #3f51b1 0%, #5a55ae 13%, #7b5fac 25%, #8f67ab 38%, #a86aa4 50%, #cc6b8e 62%, #eb6b73 75%, #f3ac71 87%, #f3eb6d 100%)', type: 'gradient' }
        ]
    },
    {
        name: '中国传统色 (100+)',
        items: [
            { name: '朱砂', color: '#ff461f', type: 'pure', description: '中国红的代表，高贵热烈' },
            { name: '黛蓝', color: '#426666', type: 'pure', description: '深沉如黛，书卷气息' },
            { name: '琉璃', color: '#2a5caa', type: 'pure', description: '澄澈如琉璃，高雅宁静' },
            { name: '胭脂', color: '#9d2933', type: 'pure', description: '古典柔美，温婉动人' },
            { name: '竹青', color: '#789262', type: 'pure', description: '翠竹之色，生机勃勃' },
            { name: '琥珀', color: '#ca6924', type: 'pure', description: '晶莹通透，温暖醇厚' },
            { name: '艾翠', color: '#a1af9d', type: 'pure', description: '淡雅如艾，清爽自然' },
            { name: '藕荷', color: '#e4c6d0', type: 'pure', description: '藕花淡紫，温柔委婉' },
            { name: '玄青', color: '#3d3b4f', type: 'pure', description: '深沉肃穆，内敛深厚' },
            { name: '杏黄', color: '#ffa631', type: 'pure', description: '明亮欢快，如杏成熟' },
            { name: '秋香', color: '#d9b611', type: 'pure', description: '金秋之色，成熟内敛' },
            { name: '天青', color: '#1bd1a5', type: 'pure', description: '雨过天晴，清透淡雅' },
            { name: '苍色', color: '#7397ab', type: 'pure', description: '苍茫天色，宁静深远' },
            { name: '月白', color: '#d6ecf0', type: 'pure', description: '如月光皎洁，清新脱俗' },
            { name: '妃色', color: '#ed5736', type: 'pure', description: '杨妃之色，明艳照人' },
            { name: '桃红', color: '#f47983', type: 'pure' },
            { name: '海棠红', color: '#db5a6b', type: 'pure' },
            { name: '酡颜', color: '#f9906f', type: 'pure' },
            { name: '鹅黄', color: '#fff143', type: 'pure' },
            { name: '鸭蛋青', color: '#e0eee8', type: 'pure' },
            { name: '葱青', color: '#0eb83a', type: 'pure' },
            { name: '黛', color: '#4a4266', type: 'pure' },
            { name: '鸦青', color: '#424c50', type: 'pure' },
            { name: '黎', color: '#758a99', type: 'pure' },
            { name: '墨色', color: '#50616d', type: 'pure' },
            { name: '酡红', color: '#dc3023', type: 'pure' },
            { name: '牙白', color: '#fffbf0', type: 'pure' },
            { name: '绾', color: '#a98175', type: 'pure' },
            { name: '缃', color: '#f0c239', type: 'pure' },
            { name: '绀青', color: '#003371', type: 'pure' },
            { name: '绛紫', color: '#8c4356', type: 'pure' },
            { name: '栗色', color: '#60281e', type: 'pure' },
            { name: '驼色', color: '#a88462', type: 'pure' },
            { name: '藕色', color: '#edd1d8', type: 'pure' },
            { name: '松花', color: '#bce672', type: 'pure' },
            { name: '柳绿', color: '#afdd22', type: 'pure' },
            { name: '葱黄', color: '#a3d900', type: 'pure' },
            { name: '黛绿', color: '#424c50', type: 'pure' },
            { name: '葱蓝', color: '#a3d900', type: 'pure' },
            { name: '水红', color: '#f3d3e7', type: 'pure' },
            { name: '品红', color: '#f00056', type: 'pure' },
            { name: '宝蓝', color: '#4b5cc4', type: 'pure' },
            { name: '靛蓝', color: '#065279', type: 'pure' },
            { name: '翠绿', color: '#20a162', type: 'pure' },
            { name: '荷叶绿', color: '#1a6840', type: 'pure' },
            { name: '石青', color: '#163471', type: 'pure' },
            { name: '漆黑', color: '#161823', type: 'pure' },
            { name: '苍翠', color: '#519a73', type: 'pure' },
            { name: '茶色', color: '#b35c44', type: 'pure' },
            { name: '金茶', color: '#ed784a', type: 'pure' }
        ]
    },
    {
        name: '莫兰迪 & 莫奈',
        items: [
            { name: '莫兰迪粉', color: '#e2b3ad', type: 'pure' },
            { name: '静谧蓝', color: '#9dafc2', type: 'pure' },
            { name: '烟草绿', color: '#929c89', type: 'pure' },
            { name: '米驼色', color: '#c6b4a1', type: 'pure' },
            { name: '灰紫兰', color: '#b9a5ae', type: 'pure' },
            { name: '雾霾蓝', color: '#88a0b9', type: 'pure' },
            { name: '燕麦色', color: '#d9d0c7', type: 'pure' },
            { name: '松石绿', color: '#9bb0a5', type: 'pure' },
            { name: '陶土棕', color: '#9b7d6a', type: 'pure' },
            { name: '浅滩灰', color: '#c4c3c0', type: 'pure' },
            { name: '森林影', color: '#6b7a70', type: 'pure' },
            { name: '晨雾紫', color: '#aca5b0', type: 'pure' },
            { name: '古铜金', color: '#a69076', type: 'pure' },
            { name: '沙砾黄', color: '#dcc6ac', type: 'pure' },
            { name: '石楠红', color: '#b48a8a', type: 'pure' },
            { name: '雨后莫奈', color: '#8ca3ba', type: 'pure' },
            { name: '睡莲淡紫', color: '#c5b5cf', type: 'pure' },
            { name: '浮光绿', color: '#cbd4c1', type: 'pure' },
            { name: '池畔深绿', color: '#4a5744', type: 'pure' },
            { name: '晚霞粉', color: '#eab4b1', type: 'pure' }
        ]
    },
    {
        name: '品牌 & 科技',
        items: [
            { name: 'Tiffany Blue', color: '#0abab5', type: 'pure' },
            { name: 'Hermès Orange', color: '#f37021', type: 'pure' },
            { name: 'Coca-Cola Red', color: '#f40009', type: 'pure' },
            { name: 'Starbucks Green', color: '#00704a', type: 'pure' },
            { name: 'Facebook Blue', color: '#1877f2', type: 'pure' },
            { name: 'Google Blue', color: '#4285f4', type: 'pure' },
            { name: 'YouTube Red', color: '#ff0000', type: 'pure' },
            { name: 'Netfix Red', color: '#e50914', type: 'pure' },
            { name: 'Spotify Green', color: '#1db954', type: 'pure' },
            { name: 'Instagram 1', color: '#405de6', type: 'pure' },
            { name: 'Instagram 2', color: '#e1306c', type: 'pure' },
            { name: 'Twitter Blue', color: '#1da1f2', type: 'pure' },
            { name: 'Airbnb Pink', color: '#ff5a5f', type: 'pure' },
            { name: 'Slack Purple', color: '#4a154b', type: 'pure' },
            { name: 'Discord Blue', color: '#7289da', type: 'pure' },
            { name: 'Tiktok Black', color: '#010101', type: 'pure' },
            { name: 'Reddit Orange', color: '#ff4500', type: 'pure' },
            { name: 'Pinterest Red', color: '#bd081c', type: 'pure' }
        ]
    },
    {
        name: 'Material UI (200+)',
        items: [
            { name: 'Red 50', color: '#ffebee', type: 'pure' }, { name: 'Red 100', color: '#ffcdd2', type: 'pure' },
            { name: 'Red 200', color: '#ef9a9a', type: 'pure' }, { name: 'Red 300', color: '#e57373', type: 'pure' },
            { name: 'Red 400', color: '#ef5350', type: 'pure' }, { name: 'Red 500', color: '#f44336', type: 'pure' },
            { name: 'Red 600', color: '#e53935', type: 'pure' }, { name: 'Red 700', color: '#d32f2f', type: 'pure' },
            { name: 'Red 800', color: '#c62828', type: 'pure' }, { name: 'Red 900', color: '#b71c1c', type: 'pure' },
            { name: 'Blue 50', color: '#e3f2fd', type: 'pure' }, { name: 'Blue 100', color: '#bbdefb', type: 'pure' },
            { name: 'Blue 200', color: '#90caf9', type: 'pure' }, { name: 'Blue 300', color: '#64b5f6', type: 'pure' },
            { name: 'Blue 400', color: '#42a5f5', type: 'pure' }, { name: 'Blue 500', color: '#2196f3', type: 'pure' },
            { name: 'Blue 600', color: '#1e88e5', type: 'pure' }, { name: 'Blue 700', color: '#1976d2', type: 'pure' },
            { name: 'Blue 800', color: '#1565c0', type: 'pure' }, { name: 'Blue 900', color: '#0d47a1', type: 'pure' },
            { name: 'Green 50', color: '#e8f5e9', type: 'pure' }, { name: 'Green 100', color: '#c8e6c9', type: 'pure' },
            { name: 'Green 200', color: '#a5d6a7', type: 'pure' }, { name: 'Green 300', color: '#81c784', type: 'pure' },
            { name: 'Green 400', color: '#66bb6a', type: 'pure' }, { name: 'Green 500', color: '#4caf50', type: 'pure' },
            { name: 'Green 600', color: '#43a047', type: 'pure' }, { name: 'Green 700', color: '#388e3c', type: 'pure' },
            { name: 'Green 800', color: '#2e7d32', type: 'pure' }, { name: 'Green 900', color: '#1b5e20', type: 'pure' },
            { name: 'Orange 50', color: '#fff3e0', type: 'pure' }, { name: 'Orange 500', color: '#ff9800', type: 'pure' },
            { name: 'Purple 500', color: '#9c27b0', type: 'pure' }, { name: 'Amber 500', color: '#ffc107', type: 'pure' },
            { name: 'Cyan 500', color: '#00bcd4', type: 'pure' }, { name: 'Grey 500', color: '#9e9e9e', type: 'pure' },
            { name: 'Deep Purple 500', color: '#673ab7', type: 'pure' }, { name: 'Indigo 500', color: '#3f51b5', type: 'pure' },
            { name: 'Light Blue 500', color: '#03a9f4', type: 'pure' }, { name: 'Teal 500', color: '#009688', type: 'pure' },
            { name: 'Lime 500', color: '#cddc39', type: 'pure' }, { name: 'Yellow 500', color: '#ffeb3b', type: 'pure' }
        ]
    },
    {
        name: '经典 Pantone',
        items: [
            { name: 'Peach Fuzz (2024)', color: '#FFBE98', type: 'pure', description: '柔和桃，温暖而宁静' },
            { name: 'Viva Magenta (2023)', color: '#BB2649', type: 'pure', description: '非凡洋红，充满活力' },
            { name: 'Very Peri (2022)', color: '#6667AB', type: 'pure' },
            { name: 'Ultimate Gray (2021)', color: '#939597', type: 'pure' },
            { name: 'Illuminating (2021)', color: '#F5DF4D', type: 'pure' },
            { name: 'Classic Blue (2020)', color: '#0f4c81', type: 'pure' },
            { name: 'Living Coral (2019)', color: '#ff6f61', type: 'pure' },
            { name: 'Ultra Violet (2018)', color: '#663399', type: 'pure' },
            { name: 'Greenery (2017)', color: '#88b04b', type: 'pure' },
            { name: 'Rose Quartz (2016)', color: '#f7cac9', type: 'pure' },
            { name: 'Serenity (2016)', color: '#91a8d0', type: 'pure' },
            { name: 'Marsala (2015)', color: '#955251', type: 'pure' },
            { name: 'Radiant Orchid (2014)', color: '#b163a3', type: 'pure' },
            { name: 'Emerald (2013)', color: '#009473', type: 'pure' },
            { name: 'Tangerine Tango (2012)', color: '#dd4124', type: 'pure' }
        ]
    },
    {
        name: '幻彩 & 极光 (Aurora & Neon)',
        items: [
            { name: 'Neon Purple', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', type: 'gradient', description: '高饱和霓虹紫，充满赛博感' },
            { name: 'Cyber Blue', color: 'linear-gradient(135deg, #2af598 0%, #08aeea 100%)', type: 'gradient', description: '青翠赛博蓝' },
            { name: 'Aurora Green', color: 'linear-gradient(to right, #00c6ff, #0072ff)', type: 'gradient', description: '极光之森' },
            { name: 'Electric Violet', color: 'linear-gradient(to right, #833ab4, #fd1d1d, #fcb045)', type: 'gradient', description: '电子紫罗兰' },
            { name: 'JShine', color: 'linear-gradient(to right, #12c2e9, #c471ed, #f64f59)', type: 'gradient', description: '晨曦霞光' },
            { name: 'Miami Night', color: 'linear-gradient(135deg, #ff00cc 0%, #3333ff 100%)', type: 'gradient', description: '迈阿密之夜' },
            { name: 'Royal Garden', color: 'linear-gradient(to right, #ed6ea0 0%, #ec8c69 100%)', type: 'gradient' },
            { name: 'Hidden Jaguar', color: 'linear-gradient(to top, #0fd850 0%, #f9f047 100%)', type: 'gradient' }
        ]
    },
    {
        name: '径向 & 锥形 (Special Shapes)',
        items: [
            { name: 'Soft Sphere', color: 'radial-gradient(circle at center, #ff9a9e 0%, #fecfef 100%)', type: 'gradient', description: '中心向外散发的柔光' },
            { name: 'Blue Pearl', color: 'radial-gradient(circle at 30% 30%, #a1c4fd 0%, #c2e9fb 100%)', type: 'gradient', description: '珍珠般的圆润质感' },
            { name: 'Golden Sun', color: 'conic-gradient(from 180deg at 50% 50%, #f6d365, #fda085, #f6d365)', type: 'gradient', description: '金色阳光螺旋' },
            { name: 'Rainbow Wheel', color: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', type: 'gradient', description: '标准色轮' },
            { name: 'Modern Arctic', color: 'radial-gradient(circle at 50% 120%, rgba(255,255,255,0.5), rgba(255,255,255,0) 70%), linear-gradient(to bottom, #74ebd5, #acb6e5)', type: 'gradient', description: '北极光的余晖' }
        ]
    },
    {
        name: '背景纹理与图案 (CSS Patterns)',
        items: [
            { name: 'Blueprint Grid', color: 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), #003366', type: 'gradient', description: '蓝图网格纹理' },
            { name: 'Honeycomb', color: 'radial-gradient(circle at 100% 50%, transparent 20%, #222 21%, #222 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, #222 21%, #222 34%, transparent 35%, transparent), #333', type: 'gradient', description: '蜂巢几何纹理' },
            { name: 'Japanese Wave (Seigaiha)', color: 'radial-gradient(circle at 50% 100%, rgba(255,255,255,0.1) 20%, transparent 20%), #2c3e50', type: 'gradient', description: '日式青海波纹 (简化版)' },
            { name: 'Polka Dots Soft', color: 'radial-gradient(#ddd 15%, transparent 16%), radial-gradient(#ddd 15%, transparent 16%), #fff', type: 'gradient', description: '经典清新波点' },
            { name: 'Diagonal Stripes', color: 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #ffffff 10px, #ffffff 20px)', type: 'gradient' },
            { name: 'Paper Fiber', color: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px), #fffef0', type: 'gradient', description: '纸质纤维感' },
            { name: 'Circuit Board', color: 'linear-gradient(90deg, #111 2px, transparent 2px), linear-gradient(#111 2px, transparent 2px), #1a1a1a', type: 'gradient', description: '电路板风格网格' }
        ]
    },
    {
        name: '顶级 UI 特效 (Premium CSS)',
        items: [
            { name: 'Holographic Foil', color: 'linear-gradient(135deg, #ff0080 0%, #ff8c00 20%, #40e0d0 40%, #8a2be2 60%, #ff0080 80%, #ff8c00 100%)', type: 'gradient', description: '全息箔质感，丰富的色彩流动' },
            { name: 'Cosmic Nebula', color: 'radial-gradient(circle at 20% 30%, #4e54c8 0%, transparent 40%), radial-gradient(circle at 80% 70%, #8f94fb 0%, transparent 40%), radial-gradient(circle at 50% 50%, #111 0%, #000 100%)', type: 'gradient', description: '宇宙星云，多层次径向叠加' },
            { name: 'Soft Velvet Red', color: 'radial-gradient(circle at top left, #ff5f6d, #ffc371)', type: 'gradient', description: '丝绒红，极具触感的柔和渐变' },
            { name: 'Cyberpunk Grid', color: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)), #222', type: 'gradient', description: '赛博格网格纹理' },
            { name: 'Carbon Fiber', color: 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%), #111', type: 'gradient', description: '碳纤维质感背景' },
            { name: 'Iridescent Light', color: 'linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%), linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%), linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)', type: 'gradient', description: '红绿蓝三原色弥散叠加' },
            { name: 'Golden Silk', color: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)', type: 'gradient', description: '金丝绸缎质感' },
            { name: 'Midnight Aurora', color: 'linear-gradient(to bottom, #020111 60%, #20202c 100%), radial-gradient(at 0% 100%, #327ad5 0, transparent 50%), radial-gradient(at 100% 100%, #1d79c7 0, transparent 50%)', type: 'gradient' },
            { name: 'Frosted Emerald', color: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)', type: 'gradient', description: '磨砂翡翠绿' },
            { name: 'Web3 Violet', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', type: 'gradient' },
            { name: 'Deep Space Mesh', color: 'radial-gradient(at 80% 20%, hsla(242, 78%, 60%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(333, 80%, 56%, 1) 0px, transparent 50%), radial-gradient(at 40% 80%, hsla(189, 71%, 48%, 1) 0px, transparent 50%)', type: 'gradient' },
            { name: 'Vintage Paper', color: 'linear-gradient(30deg, #f39c12 12%, transparent 12.5%, transparent 87%, #f39c12 87.5%, #f39c12), linear-gradient(150deg, #f39c12 12%, transparent 12.5%, transparent 87%, #f39c12 87.5%, #f39c12), linear-gradient(30deg, #f39c12 12%, transparent 12.5%, transparent 87%, #f39c12 87.5%, #f39c12), linear-gradient(150deg, #f39c12 12%, transparent 12.5%, transparent 87%, #f39c12 87.5%, #f39c12), linear-gradient(60deg, #e67e22 25%, transparent 25.5%, transparent 75%, #e67e22 75.5%, #e67e22), linear-gradient(60deg, #e67e22 25%, transparent 25.5%, transparent 75%, #e67e22 75.5%, #e67e22), #d35400', type: 'gradient', description: '复古几何包装纸纹理' },
            { name: 'Modern Dark Glass', color: 'linear-gradient(rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%), #121212', type: 'gradient' },
            { name: 'Retro Sunset', color: 'repeating-linear-gradient(transparent, transparent 2px, #f43f5e 2px, #f43f5e 4px), linear-gradient(#fbbf24, #f43f5e)', type: 'gradient', description: '80年代复古落日条纹' }
        ]
    },
    {
        name: '和风色彩 (Japanese Colors)',
        items: [
            { name: '桜色 (Sakura)', color: '#fef4f4', type: 'pure', description: '樱花色，极浅的粉红' },
            { name: '抚子 (Nadeshiko)', color: '#eebbcb', type: 'pure', description: '抚子色，如秋牡丹般温婉' },
            { name: '瑠璃 (Ruri)', color: '#2a5caa', type: 'pure', description: '深邃高贵的宝石蓝色' },
            { name: '萌葱 (Moegi)', color: '#006e54', type: 'pure', description: '萌芽的葱色，充满生命力' },
            { name: '京緋 (Kyo-hi)', color: '#c3272b', type: 'pure', description: '京都风格的绯红色' },
            { name: '若草 (Wakakusa)', color: '#abc03d', type: 'pure', description: '初春嫩草之色' },
            { name: '藤 (Fuji)', color: '#bbbcde', type: 'pure', description: '紫藤花色，优雅从容' },
            { name: '山吹 (Yamabuki)', color: '#ffb61e', type: 'pure', description: '棣棠花色，明艳的黄橙' }
        ]
    },
    {
        name: '现代色彩空间 (OKLCH)',
        items: [
            { name: 'OKLCH Rainbow', color: 'linear-gradient(to right, oklch(60% 0.3 0), oklch(60% 0.3 120), oklch(60% 0.3 240), oklch(60% 0.3 360))', type: 'gradient', description: '基于 OKLCH 的等亮度彩虹渐变，视觉极其和谐' },
            { name: 'Soft OKLCH Blue', color: 'oklch(70% 0.1 250)', type: 'pure', description: '现代浏览器推荐的 OKLCH 柔和蓝' },
            { name: 'Vibrant Magenta', color: 'oklch(65% 0.3 330)', type: 'pure', description: '极高饱和度的现代洋红' },
            { name: 'Deep Sea OKLCH', color: 'linear-gradient(to bottom, oklch(40% 0.2 240), oklch(20% 0.1 260))', type: 'gradient' },
            { name: 'Sunset Glow', color: 'linear-gradient(to right, oklch(75% 0.15 40), oklch(70% 0.2 20), oklch(60% 0.25 340))', type: 'gradient' }
        ]
    },
    {
        name: '高级特殊渐变 (Advanced)',
        items: [
            { name: 'Mesh Aurora', color: 'radial-gradient(at 0% 0%, oklch(80% 0.1 150) 0%, transparent 50%), radial-gradient(at 100% 0%, oklch(80% 0.1 300) 0%, transparent 50%), radial-gradient(at 50% 100%, oklch(70% 0.2 200) 0%, transparent 50%), #f0f0f0', type: 'gradient', description: '多重径向拼接出的弥散光质感' },
            { name: 'Conic Metal', color: 'conic-gradient(from 45deg, #ddd, #999, #ddd, #999, #ddd)', type: 'gradient', description: '锥形渐变模拟金属反光' },
            { name: 'Polka Dots', color: 'radial-gradient(#333 10%, transparent 11%), transparent', type: 'gradient', description: '利用径向渐变实现的波点纹理' },
            { name: 'Stripes', color: 'repeating-linear-gradient(45deg, #ccc, #ccc 10px, #eee 10px, #eee 20px)', type: 'gradient', description: '重复线条纹理' },
            { name: 'Cyber Ring', color: 'conic-gradient(from 0deg at 50% 50%, oklch(60% 0.3 0) 0%, oklch(60% 0.3 180) 50%, oklch(60% 0.3 360) 100%)', type: 'gradient' }
        ]
    },
    {
        name: '多重复杂渐变 (Complex)',
        items: [
            { name: 'Deep Space', color: 'linear-gradient(to bottom, #000000, #434343 50%, #000000)', type: 'gradient', description: '深邃空间感' },
            { name: 'Rainbow Soft', color: 'linear-gradient(to right, #ff9a9e 0%, #fecfef 20%, #fbc2eb 40%, #a18cd1 60%, #8fd3f4 80%, #84fab0 100%)', type: 'gradient', description: '七彩柔和过渡' },
            { name: 'Metal Chrome', color: 'linear-gradient(to bottom, #d5d4d0 0%, #d5d4d0 1%, #eeeeec 31%, #efeeec 75%, #e9e9e7 100%)', type: 'gradient', description: '金属铬质感' },
            { name: 'Glassy Texture', color: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)', type: 'gradient', description: '毛玻璃质感底色' },
            { name: 'Vibrant Mesh', color: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 25%, #ffecd2 50%, #fcb69f 75%, #ff8177 100%)', type: 'gradient', description: '多层色彩堆叠' }
        ]
    },
    {
        name: '复古油画 (Vintage Oil)',
        items: [
            { name: '梵高星空', color: '#1a2a6c', type: 'pure', description: '深邃夜空的普鲁士蓝' },
            { name: '向日葵黄', color: '#f1c40f', type: 'pure', description: '明亮饱满的土黄' },
            { name: '莫奈花园', color: '#48c6ef', type: 'pure', description: '清透的睡莲池色' },
            { name: '复古玫瑰', color: '#9d2933', type: 'pure', description: '干枯玫瑰的暗红色' },
            { name: '古典金箔', color: '#bf953f', type: 'pure', description: '斑驳质感的金色' },
            { name: '文艺复兴', color: '#6d4c41', type: 'pure', description: '古典画作的赭石基调' }
        ]
    },
    {
        name: '极简中性 (Minimal Neutrals)',
        items: [
            { name: 'Warm Grey', color: '#8d8d8d', type: 'pure' },
            { name: 'Cool Grey', color: '#656565', type: 'pure' },
            { name: 'Desert Sand', color: '#edc9af', type: 'pure' },
            { name: 'Bone White', color: '#f9f6ee', type: 'pure' },
            { name: 'Charcoal', color: '#36454f', type: 'pure' },
            { name: 'Greige', color: '#b0abb0', type: 'pure' },
            { name: 'Taupe', color: '#483c32', type: 'pure' }
        ]
    },
    {
        name: '马卡龙 (Macaron Pastel)',
        items: [
            { name: 'Mint Candy', color: '#b2f7ef', type: 'pure' },
            { name: 'Lemon Soda', color: '#efffb8', type: 'pure' },
            { name: 'Strawberry Milk', color: '#f7d1cd', type: 'pure' },
            { name: 'Lavender Ice', color: '#e2afff', type: 'pure' },
            { name: 'Peach Cream', color: '#ffcb77', type: 'pure' },
            { name: 'Blueberry Pie', color: '#7bdff2', type: 'pure' }
        ]
    },
    {
        name: 'Flat UI 调色盘',
        items: [
            { name: 'Turquoise', color: '#1abc9c', type: 'pure' },
            { name: 'Emerland', color: '#2ecc71', type: 'pure' },
            { name: 'Peter River', color: '#3498db', type: 'pure' },
            { name: 'Amethyst', color: '#9b59b6', type: 'pure' },
            { name: 'Wet Asphalt', color: '#34495e', type: 'pure' },
            { name: 'Green Sea', color: '#16a085', type: 'pure' },
            { name: 'Nephritis', color: '#27ae60', type: 'pure' },
            { name: 'Belize Hole', color: '#2980b9', type: 'pure' },
            { name: 'Wisteria', color: '#8e44ad', type: 'pure' },
            { name: 'Midnight Blue', color: '#2c3e50', type: 'pure' },
            { name: 'Sun Flower', color: '#f1c40f', type: 'pure' },
            { name: 'Carrot', color: '#e67e22', type: 'pure' },
            { name: 'Alizarin', color: '#e74c3c', type: 'pure' },
            { name: 'Clouds', color: '#ecf0f1', type: 'pure' },
            { name: 'Concrete', color: '#95a5a6', type: 'pure' },
            { name: 'Orange', color: '#f39c12', type: 'pure' },
            { name: 'Pumpkin', color: '#d35400', type: 'pure' },
            { name: 'Pomegranate', color: '#c0392b', type: 'pure' },
            { name: 'Silver', color: '#bdc3c7', type: 'pure' },
            { name: 'Asbestos', color: '#7f8c8d', type: 'pure' }
        ]
    }
];
