
/**
 * 统一的画布组件配置架构文件
 * 
 * 用途：确保 AI 提示词、remap 函数、操作面板组件三者的一致性
 * - AI 提示词：使用 aiBindingSchema 中定义的简单配置结构
 * - remap 函数：根据 componentMapping 将简单配置映射到实际选项路径
 * - 默认配置：defaultConfig 用于初始化新创建的组件
 */

export interface ComponentConfigSchema {
  type: string;
  label: string;
  // AI 使用的绑定结构说明
  aiBindingSchema: Record<string, {
    type: string;
    description: string;
    example?: any;
  }>;
  // 简单键到实际选项路径的映射
  componentMapping: Record<string, string>;
  // 默认配置（完整的嵌套结构）
  defaultConfig: Record<string, any>;
  // AI 提示词中使用的示例
  aiExample: Record<string, any>;
}

/**
 * 所有组件配置的完整定义
 */
export const COMPONENT_CONFIGS: Record<string, ComponentConfigSchema> = {
  echart: {
    type: "echart",
    label: "ECharts 图表",
    aiBindingSchema: {
      option: {
        type: "object",
        description: "标准 ECharts 配置对象",
        example: {
          title: { text: "销售数据" },
          xAxis: { data: ["Q1", "Q2", "Q3", "Q4"] },
          yAxis: {},
          series: [{ type: "bar", data: [120, 200, 150, 180] }]
        }
      },
      renderer: {
        type: "string",
        description: "渲染器类型：canvas 或 svg",
        example: "canvas"
      },
      theme: {
        type: "string",
        description: "主题名称",
        example: "light"
      }
    },
    componentMapping: {
      option: "echart.engines.echarts.option",
      renderer: "echart.engines.echarts.renderer",
      theme: "echart.engines.echarts.theme"
    },
    defaultConfig: {
      echart: {
        engines: {
          echarts: {
            option: {
              title: { text: "图表标题" },
              xAxis: { type: "category", data: ["A", "B", "C"] },
              yAxis: { type: "value" },
              series: [{ type: "bar", data: [100, 200, 150] }]
            },
            renderer: "canvas",
            theme: "light"
          }
        }
      }
    },
    aiExample: {
      option: {
        title: { text: "销售数据" },
        xAxis: { data: ["Q1", "Q2", "Q3", "Q4"] },
        yAxis: {},
        series: [{ type: "bar", data: [120, 200, 150, 180] }]
      }
    }
  },

  chartjs: {
    type: "chartjs",
    label: "Chart.js 图表",
    aiBindingSchema: {
      chartType: {
        type: "string",
        description: "图表类型：bar, line, pie, doughnut, radar, scatter, polarArea",
        example: "bar"
      },
      data: {
        type: "object",
        description: "Chart.js 数据对象",
        example: {
          labels: ["A", "B", "C"],
          datasets: [{ label: "数据", data: [10, 20, 30] }]
        }
      },
      options: {
        type: "object",
        description: "Chart.js 配置选项",
        example: {}
      }
    },
    componentMapping: {},
    defaultConfig: {
      chartType: "bar",
      data: {
        labels: ["January", "February", "March"],
        datasets: [
          {
            label: "数据",
            data: [65, 59, 80],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)"
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)"
            ],
            borderWidth: 1
          }
        ]
      },
      options: {}
    },
    aiExample: {
      chartType: "bar",
      data: {
        labels: ["A", "B", "C"],
        datasets: [{ label: "数据", data: [10, 20, 30] }]
      }
    }
  },

  threeScene: {
    type: "threeScene",
    label: "Three.js 3D 模型",
    aiBindingSchema: {
      scene: {
        type: "object",
        description: "3D 场景配置：包含 camera, lights, objects",
        example: {
          camera: { fov: 45, position: [0, 0, 3.5] },
          lights: [
            { type: "ambient", color: "#fff", intensity: 0.9 },
            { type: "directional", color: "#fff", intensity: 1.1, position: [2, 2, 3] }
          ],
          objects: []
        }
      },
      renderer: {
        type: "object",
        description: "渲染器配置",
        example: {}
      }
    },
    componentMapping: {
      scene: "threeScene.engines.threejs.scene",
      renderer: "threeScene.engines.threejs.renderer"
    },
    defaultConfig: {
      threeScene: {
        engines: {
          threejs: {
            scene: {
              camera: { fov: 45, position: [0, 0, 3.5] },
              lights: [
                { type: "ambient", color: "#ffffff", intensity: 0.5 },
                { type: "pointLight", color: "#ffffff", intensity: 1, position: [2, 2, 2] }
              ],
              objects: [
                { type: "boxGeometry", color: "#4285F4", scale: [1, 1, 1] }
              ]
            },
            renderer: {}
          }
        }
      }
    },
    aiExample: {
      scene: {
        camera: { fov: 45, position: [0, 0, 3.5] },
        lights: [
          { type: "ambient", color: "#fff", intensity: 0.9 },
          { type: "directional", color: "#fff", intensity: 1.1, position: [2, 2, 3] }
        ],
        objects: []
      }
    }
  },

  wordCloud: {
    type: "wordCloud",
    label: "词云",
    aiBindingSchema: {
      list: {
        type: "array",
        description: "词云数据：二维数组 [[词, 权重], ...]",
        example: [["设计", 72], ["创意", 56], ["画布", 48], ["模板", 42], ["标签", 36]]
      },
      colors: {
        type: "array",
        description: "颜色数组",
        example: ["#ff4d6d", "#2ec4b6", "#ffbe0b", "#3a86ff"]
      },
      fontFamily: {
        type: "string",
        description: "字体",
        example: "Arial"
      },
      colorMode: {
        type: "string",
        description: "颜色模式",
        example: "random"
      },
      shape: {
        type: "string",
        description: "词云形状",
        example: "circle"
      }
    },
    componentMapping: {
      list: "wordCloud.engines.wordcloud2.list",
      colors: "wordCloud.engines.wordcloud2.colors",
      color: "wordCloud.engines.wordcloud2.color",
      fontFamily: "wordCloud.engines.wordcloud2.fontFamily",
      fontUrl: "wordCloud.engines.wordcloud2.fontUrl",
      fontFamilyInfo: "wordCloud.engines.wordcloud2.fontFamilyInfo",
      fontWeight: "wordCloud.engines.wordcloud2.fontWeight",
      colorMode: "wordCloud.engines.wordcloud2.colorMode",
      shape: "wordCloud.engines.wordcloud2.shape",
      backgroundColor: "wordCloud.engines.wordcloud2.backgroundColor",
      weightFactor: "wordCloud.engines.wordcloud2.weightFactor",
      gridSize: "wordCloud.engines.wordcloud2.gridSize",
      minSize: "wordCloud.engines.wordcloud2.minSize",
      rotateRatio: "wordCloud.engines.wordcloud2.rotateRatio",
      minRotation: "wordCloud.engines.wordcloud2.minRotation",
      maxRotation: "wordCloud.engines.wordcloud2.maxRotation",
      rotationSteps: "wordCloud.engines.wordcloud2.rotationSteps",
      ellipticity: "wordCloud.engines.wordcloud2.ellipticity",
      shrinkToFit: "wordCloud.engines.wordcloud2.shrinkToFit",
      drawOutOfBound: "wordCloud.engines.wordcloud2.drawOutOfBound",
      shuffle: "wordCloud.engines.wordcloud2.shuffle"
    },
    defaultConfig: {
      wordCloud: {
        engines: {
          wordcloud2: {
            list: [["设计", 72], ["创意", 56], ["画布", 48], ["模板", 42], ["标签", 36]],
            colors: ["#ff4d6d", "#2ec4b6", "#ffbe0b", "#3a86ff"],
            fontFamily: "Arial",
            colorMode: "random",
            shape: "circle"
          }
        }
      }
    },
    aiExample: {
      list: [["设计", 72], ["创意", 56], ["画布", 48], ["模板", 42], ["标签", 36]],
      colors: ["#ff4d6d", "#2ec4b6", "#ffbe0b", "#3a86ff"]
    }
  },

  d3Cloud: {
    type: "d3Cloud",
    label: "D3 词云",
    aiBindingSchema: {
      words: {
        type: "array",
        description: "词云单词数组",
        example: []
      },
      colors: {
        type: "array",
        description: "颜色数组",
        example: []
      },
      fontFamily: {
        type: "string",
        description: "字体",
        example: "Arial"
      }
    },
    componentMapping: {
      words: "d3Cloud.words",
      colors: "d3Cloud.colors",
      fontFamily: "d3Cloud.fontFamily",
      fontWeight: "d3Cloud.fontWeight",
      padding: "d3Cloud.padding",
      spiral: "d3Cloud.spiral",
      rotate: "d3Cloud.rotate",
      backgroundColor: "backgroundColor.color"
    },
    defaultConfig: {
      words: [],
      colors: [],
      fontFamily: "Arial"
    },
    aiExample: {
      words: [],
      colors: []
    }
  },

  qrcode: {
    type: "qrcode",
    label: "二维码",
    aiBindingSchema: {
      qrcodeContent: {
        type: "string",
        description: "扫码内容字符串",
        example: "https://example.com"
      }
    },
    componentMapping: {},
    defaultConfig: {
      qrcodeContent: "https://example.com"
    },
    aiExample: {
      qrcodeContent: "https://example.com"
    }
  },

  barcode: {
    type: "barcode",
    label: "条形码",
    aiBindingSchema: {
      barcodeContent: {
        type: "string",
        description: "条形码内容字符串",
        example: "123456789012"
      },
      barcodeFormat: {
        type: "string",
        description: "条形码格式",
        example: "CODE128"
      }
    },
    componentMapping: {},
    defaultConfig: {
      barcodeContent: "123456789012",
      barcodeFormat: "CODE128"
    },
    aiExample: {
      barcodeContent: "123456789012"
    }
  },

  math: {
    type: "math",
    label: "数学公式",
    aiBindingSchema: {
      formula: {
        type: "string",
        description: "LaTeX 公式字符串",
        example: "\\frac{a}{b}=c"
      },
      displayMode: {
        type: "boolean",
        description: "是否为块级显示",
        example: true
      },
      fontSize: {
        type: "number",
        description: "字体大小",
        example: 24
      }
    },
    componentMapping: {},
    defaultConfig: {
      formula: "\\frac{a}{b}=c",
      displayMode: true,
      fontSize: 24
    },
    aiExample: {
      formula: "\\frac{a}{b}=c",
      displayMode: true
    }
  },

  mermaid: {
    type: "mermaid",
    label: "流程图",
    aiBindingSchema: {
      source: {
        type: "string",
        description: "Mermaid 语法字符串",
        example: "graph TD\n  A[开始] --> B{判断}\n  B -->|是| C[执行]\n  B -->|否| D[结束]"
      },
      config: {
        type: "object",
        description: "Mermaid 配置",
        example: { theme: "default" }
      }
    },
    componentMapping: {},
    defaultConfig: {
      source: "graph TD\n  A[开始] --> B{判断}\n  B -->|是| C[执行]\n  B -->|否| D[结束]",
      config: { theme: "default" }
    },
    aiExample: {
      source: "graph TD\n  A[开始] --> B{判断}\n  B -->|是| C[执行]\n  B -->|否| D[结束]",
      config: { theme: "default" }
    }
  },

  plotlyChart: {
    type: "plotlyChart",
    label: "Plotly 图表",
    aiBindingSchema: {
      data: {
        type: "array",
        description: "Plotly 数据数组",
        example: [{ x: [1, 2, 3, 4], y: [10, 15, 13, 17], type: "scatter" }]
      },
      layout: {
        type: "object",
        description: "Plotly 布局配置",
        example: {}
      }
    },
    componentMapping: {},
    defaultConfig: {
      data: [{ x: [1, 2, 3, 4], y: [10, 15, 13, 17], type: "scatter" }],
      layout: {}
    },
    aiExample: {
      data: [{ x: [1, 2, 3, 4], y: [10, 15, 13, 17], type: "scatter" }]
    }
  },

  frappeChart: {
    type: "frappeChart",
    label: "Frappe 图表",
    aiBindingSchema: {
      chartType: {
        type: "string",
        description: "图表类型：bar, line, pie, percentage, axis-mixed",
        example: "bar"
      },
      labels: {
        type: "array",
        description: "标签数组",
        example: ["Jan", "Feb", "Mar"]
      },
      datasets: {
        type: "array",
        description: "数据集数组",
        example: [{ values: [25, 40, 30] }]
      }
    },
    componentMapping: {},
    defaultConfig: {
      chartType: "bar",
      labels: ["Jan", "Feb", "Mar"],
      datasets: [{ values: [25, 40, 30] }]
    },
    aiExample: {
      chartType: "bar",
      labels: ["Jan", "Feb", "Mar"],
      datasets: [{ values: [25, 40, 30] }]
    }
  },

  chartXkcd: {
    type: "chartXkcd",
    label: "xkcd 手绘风格图表",
    aiBindingSchema: {
      chartType: {
        type: "string",
        description: "图表类型：bar, pie, line, XY",
        example: "bar"
      },
      data: {
        type: "object",
        description: "图表数据",
        example: {
          labels: ["A", "B", "C"],
          datasets: [{ label: "数据", data: [10, 20, 30] }]
        }
      }
    },
    componentMapping: {},
    defaultConfig: {
      chartType: "bar",
      data: {
        labels: ["A", "B", "C"],
        datasets: [{ label: "数据", data: [10, 20, 30] }]
      }
    },
    aiExample: {
      chartType: "bar",
      data: {
        labels: ["A", "B", "C"],
        datasets: [{ label: "数据", data: [10, 20, 30] }]
      }
    }
  },

  vueDataUi: {
    type: "vueDataUi",
    label: "Vue Data UI 图表",
    aiBindingSchema: {
      component: {
        type: "string",
        description: "组件名称：VueUiDonut, VueUiRadar, VueUiGauge 等 50+ 种",
        example: "VueUiDonut"
      },
      config: {
        type: "object",
        description: "组件配置",
        example: {}
      },
      dataset: {
        type: "array",
        description: "数据集",
        example: [
          { name: "A", values: [30] },
          { name: "B", values: [25] },
          { name: "C", values: [20] }
        ]
      }
    },
    componentMapping: {},
    defaultConfig: {
      component: "VueUiDonut",
      config: {},
      dataset: [
        { name: "A", values: [30] },
        { name: "B", values: [25] },
        { name: "C", values: [20] }
      ]
    },
    aiExample: {
      component: "VueUiDonut",
      dataset: [
        { name: "A", values: [30] },
        { name: "B", values: [25] },
        { name: "C", values: [20] }
      ]
    }
  },

  vegaLite: {
    type: "vegaLite",
    label: "Vega-Lite 规范图表",
    aiBindingSchema: {
      spec: {
        type: "object",
        description: "Vega-Lite 规范对象",
        example: {
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          data: { values: [{ x: "A", y: 10 }, { x: "B", y: 20 }] },
          mark: "bar",
          encoding: { x: { field: "x", type: "nominal" }, y: { field: "y", type: "quantitative" } }
        }
      }
    },
    componentMapping: {},
    defaultConfig: {
      spec: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: [{ x: "A", y: 10 }, { x: "B", y: 20 }] },
        mark: "bar",
        encoding: { x: { field: "x", type: "nominal" }, y: { field: "y", type: "quantitative" } }
      }
    },
    aiExample: {
      spec: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: [{ x: "A", y: 10 }, { x: "B", y: 20 }] },
        mark: "bar",
        encoding: { x: { field: "x", type: "nominal" }, y: { field: "y", type: "quantitative" } }
      }
    }
  },

  codeBlock: {
    type: "codeBlock",
    label: "代码高亮",
    aiBindingSchema: {
      source: {
        type: "string",
        description: "代码字符串",
        example: "console.log('hello')"
      },
      language: {
        type: "string",
        description: "语言：ts, js, python, go, rust, java, html, css, json 等",
        example: "js"
      },
      theme: {
        type: "string",
        description: "主题：github-dark, github-light, dracula 等",
        example: "github-dark"
      },
      showHeader: {
        type: "boolean",
        description: "是否显示头部",
        example: true
      },
      showLineNumbers: {
        type: "boolean",
        description: "是否显示行号",
        example: true
      }
    },
    componentMapping: {},
    defaultConfig: {
      source: "console.log('hello')",
      language: "js",
      theme: "github-dark",
      showHeader: true,
      showLineNumbers: true
    },
    aiExample: {
      source: "console.log('hello')",
      language: "js",
      theme: "github-dark"
    }
  },

  markmapChart: {
    type: "markmapChart",
    label: "思维导图",
    aiBindingSchema: {
      markdown: {
        type: "string",
        description: "Markdown 格式的层级结构",
        example: "# 项目计划\n## 需求分析\n### 用户调研\n### 竞品分析\n## 设计阶段\n### UI设计\n### 交互设计\n## 开发\n### 前端\n### 后端"
      }
    },
    componentMapping: {},
    defaultConfig: {
      markdown: "# 项目计划\n## 需求分析\n### 用户调研\n### 竞品分析\n## 设计阶段\n### UI设计\n### 交互设计\n## 开发\n### 前端\n### 后端"
    },
    aiExample: {
      markdown: "# 项目计划\n## 需求分析\n### 用户调研\n### 竞品分析\n## 设计阶段\n### UI设计\n### 交互设计\n## 开发\n### 前端\n### 后端"
    }
  },

  particlesEffect: {
    type: "particlesEffect",
    label: "粒子特效",
    aiBindingSchema: {
      preset: {
        type: "string",
        description: "预设：stars, bubbles, snow, fire",
        example: "stars"
      },
      particleCount: {
        type: "number",
        description: "粒子数量",
        example: 80
      }
    },
    componentMapping: {},
    defaultConfig: {
      preset: "stars",
      particleCount: 80
    },
    aiExample: {
      preset: "stars",
      particleCount: 80
    }
  },

  confetti: {
    type: "confetti",
    label: "撒花特效",
    aiBindingSchema: {
      preset: {
        type: "string",
        description: "预设：default, fireworks, snow, celebration, school",
        example: "celebration"
      },
      particleCount: {
        type: "number",
        description: "粒子数量",
        example: 100
      },
      colors: {
        type: "array",
        description: "颜色数组",
        example: ["#ff0000", "#00ff00", "#0000ff", "#ffff00"]
      }
    },
    componentMapping: {},
    defaultConfig: {
      preset: "celebration",
      particleCount: 100,
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00"]
    },
    aiExample: {
      preset: "celebration",
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00"]
    }
  },

  trianglify: {
    type: "trianglify",
    label: "三角背景",
    aiBindingSchema: {
      cellSize: {
        type: "number",
        description: "单元格大小",
        example: 40
      },
      variance: {
        type: "number",
        description: "变化率",
        example: 0.75
      },
      xColors: {
        type: "string|array",
        description: "X 轴颜色：'random' 或颜色数组",
        example: "random"
      },
      yColors: {
        type: "string|array",
        description: "Y 轴颜色：'random' 或颜色数组",
        example: "random"
      },
      palette: {
        type: "string",
        description: "调色板",
        example: "YlGn"
      },
      strokeWidth: {
        type: "number",
        description: "线条宽度",
        example: 0
      },
      fill: {
        type: "boolean",
        description: "是否填充",
        example: true
      }
    },
    componentMapping: {},
    defaultConfig: {
      cellSize: 40,
      variance: 0.75,
      xColors: "random",
      palette: "YlGn"
    },
    aiExample: {
      cellSize: 40,
      variance: 0.75,
      xColors: "random",
      palette: "YlGn"
    }
  },

  starChart: {
    type: "starChart",
    label: "星座图",
    aiBindingSchema: {
      date: {
        type: "string",
        description: "日期",
        example: ""
      },
      latitude: {
        type: "number",
        description: "纬度",
        example: 39.9
      },
      longitude: {
        type: "number",
        description: "经度",
        example: 116.4
      },
      showConstellations: {
        type: "boolean",
        description: "是否显示星座",
        example: true
      }
    },
    componentMapping: {},
    defaultConfig: {
      latitude: 39.9,
      longitude: 116.4,
      showConstellations: true
    },
    aiExample: {
      latitude: 39.9,
      longitude: 116.4,
      showConstellations: true
    }
  },

  waveform: {
    type: "waveform",
    label: "音频波形",
    aiBindingSchema: {
      audioUrl: {
        type: "string",
        description: "音频文件 URL",
        example: "https://example.com/audio.mp3"
      },
      waveColor: {
        type: "string",
        description: "波形颜色",
        example: "#4ECDC4"
      },
      progressColor: {
        type: "string",
        description: "进度颜色",
        example: "#FF6B6B"
      }
    },
    componentMapping: {},
    defaultConfig: {
      audioUrl: "",
      waveColor: "#4ECDC4",
      progressColor: "#FF6B6B"
    },
    aiExample: {
      audioUrl: "https://example.com/audio.mp3",
      waveColor: "#4ECDC4"
    }
  },

  simplexNoise: {
    type: "simplexNoise",
    label: "噪声纹理",
    aiBindingSchema: {
      scale: {
        type: "number",
        description: "缩放",
        example: 50
      },
      octaves: {
        type: "number",
        description: "八度数",
        example: 4
      },
      persistence: {
        type: "number",
        description: "持久性",
        example: 0.5
      },
      color1: {
        type: "string",
        description: "颜色 1",
        example: "#1a1a2e"
      },
      color2: {
        type: "string",
        description: "颜色 2",
        example: "#16213e"
      }
    },
    componentMapping: {},
    defaultConfig: {
      scale: 50,
      octaves: 4,
      color1: "#1a1a2e",
      color2: "#16213e"
    },
    aiExample: {
      scale: 50,
      octaves: 4,
      color1: "#1a1a2e",
      color2: "#16213e"
    }
  },

  cytoscape: {
    type: "cytoscape",
    label: "Cytoscape 关系图",
    aiBindingSchema: {
      elements: {
        type: "array",
        description: "节点和边数组",
        example: [
          { data: { id: "A", label: "开始" } },
          { data: { id: "B", label: "结束" } },
          { data: { source: "A", target: "B" } }
        ]
      },
      layout: {
        type: "object",
        description: "布局配置",
        example: {}
      },
      style: {
        type: "object",
        description: "样式配置",
        example: { nodeColor: "#4A90D9", edgeColor: "#666" }
      }
    },
    componentMapping: {},
    defaultConfig: {
      elements: [
        { data: { id: "A", label: "开始" } },
        { data: { id: "B", label: "结束" } },
        { data: { source: "A", target: "B" } }
      ],
      style: { nodeColor: "#4A90D9", edgeColor: "#666" }
    },
    aiExample: {
      elements: [
        { data: { id: "A", label: "开始" } },
        { data: { id: "B", label: "结束" } },
        { data: { source: "A", target: "B" } }
      ],
      style: { nodeColor: "#4A90D9", edgeColor: "#666" }
    }
  },

  dagreGraph: {
    type: "dagreGraph",
    label: "Dagre 拓扑图",
    aiBindingSchema: {
      nodes: {
        type: "array",
        description: "节点数组",
        example: [
          { id: "a", label: "步骤A" },
          { id: "b", label: "步骤B" }
        ]
      },
      edges: {
        type: "array",
        description: "边数组",
        example: [{ from: "a", to: "b" }]
      },
      rankdir: {
        type: "string",
        description: "布局方向：TB, LR",
        example: "TB"
      }
    },
    componentMapping: {},
    defaultConfig: {
      nodes: [
        { id: "a", label: "步骤A" },
        { id: "b", label: "步骤B" }
      ],
      edges: [{ from: "a", to: "b" }],
      rankdir: "TB"
    },
    aiExample: {
      nodes: [
        { id: "a", label: "步骤A" },
        { id: "b", label: "步骤B" }
      ],
      edges: [{ from: "a", to: "b" }]
    }
  },

  d3: {
    type: "d3",
    label: "D3 自定义绘图",
    aiBindingSchema: {
      code: {
        type: "string",
        description: "可执行的 D3.js 代码字符串",
        example: "const data=[30,86,168,281]; d3.select(container).selectAll('div').data(data).enter().append('div').style('width',d=>d+'px').style('background','#3a86ff').style('margin','2px').text(d=>d);"
      }
    },
    componentMapping: {},
    defaultConfig: {
      code: "const data=[30,86,168,281]; d3.select(container).selectAll('div').data(data).enter().append('div').style('width',d=>d+'px').style('background','#3a86ff').style('margin','2px').text(d=>d);"
    },
    aiExample: {
      code: "const data=[30,86,168,281]; d3.select(container).selectAll('div').data(data).enter().append('div').style('width',d=>d+'px').style('background','#3a86ff').style('margin','2px').text(d=>d);"
    }
  },

  roughShape: {
    type: "roughShape",
    label: "手绘形状",
    aiBindingSchema: {
      shape: {
        type: "string",
        description: "形状：rect, circle, line, ellipse",
        example: "rect"
      },
      fill: {
        type: "string",
        description: "填充颜色",
        example: "#4ECDC4"
      },
      stroke: {
        type: "string",
        description: "边框颜色",
        example: "#000"
      },
      strokeWidth: {
        type: "number",
        description: "边框宽度",
        example: 2
      },
      roughness: {
        type: "number",
        description: "粗糙程度",
        example: 1
      }
    },
    componentMapping: {},
    defaultConfig: {
      shape: "rect",
      fill: "#4ECDC4",
      stroke: "#000",
      strokeWidth: 2,
      roughness: 1
    },
    aiExample: {
      shape: "rect",
      fill: "#4ECDC4",
      stroke: "#000",
      strokeWidth: 2,
      roughness: 1
    }
  },

  figlet: {
    type: "figlet",
    label: "Figlet 艺术字",
    aiBindingSchema: {
      text: {
        type: "string",
        description: "文本内容",
        example: "Hello"
      },
      font: {
        type: "string",
        description: "字体：Standard, Ghost, Big, Banner, Slant",
        example: "Standard"
      }
    },
    componentMapping: {},
    defaultConfig: {
      text: "Hello",
      font: "Standard"
    },
    aiExample: {
      text: "Hello",
      font: "Standard"
    }
  },

  opentypeText: {
    type: "opentypeText",
    label: "OpenType 路径文字",
    aiBindingSchema: {
      text: {
        type: "string",
        description: "文本内容",
        example: "BRAND"
      },
      fontUrl: {
        type: "string",
        description: "字体文件 URL",
        example: ""
      },
      fontSize: {
        type: "number",
        description: "字体大小",
        example: 72
      },
      fillColor: {
        type: "string",
        description: "填充颜色",
        example: "#000000"
      }
    },
    componentMapping: {},
    defaultConfig: {
      text: "BRAND",
      fontSize: 72,
      fillColor: "#000000"
    },
    aiExample: {
      text: "BRAND",
      fontSize: 72,
      fillColor: "#000000"
    }
  },

  graphviz: {
    type: "graphviz",
    label: "Graphviz DOT 图",
    aiBindingSchema: {
      dot: {
        type: "string",
        description: "DOT 语法字符串",
        example: "digraph { a -> b -> c }"
      }
    },
    componentMapping: {},
    defaultConfig: {
      dot: "digraph { a -> b -> c }"
    },
    aiExample: {
      dot: "digraph { a -> b -> c }"
    }
  },

  molecule: {
    type: "molecule",
    label: "RDKit 2D 分子",
    aiBindingSchema: {
      source: {
        type: "string",
        description: "SMILES 字符串",
        example: "c1ccccc1"
      },
      inputType: {
        type: "string",
        description: "输入类型：smiles, molblock",
        example: "smiles"
      }
    },
    componentMapping: {},
    defaultConfig: {
      source: "c1ccccc1",
      inputType: "smiles"
    },
    aiExample: {
      source: "c1ccccc1",
      inputType: "smiles"
    }
  },

  threeMol: {
    type: "threeMol",
    label: "3Dmol 3D 分子",
    aiBindingSchema: {
      data: {
        type: "string",
        description: "分子数据字符串",
        example: ""
      },
      pdbId: {
        type: "string",
        description: "PDB 数据库 ID",
        example: "1CRN"
      },
      format: {
        type: "string",
        description: "格式：pdb, sdf, xyz, mol2",
        example: "pdb"
      },
      style: {
        type: "string",
        description: "样式：stick, sphere, cartoon, line, cross",
        example: "cartoon"
      }
    },
    componentMapping: {},
    defaultConfig: {
      pdbId: "1CRN",
      style: "cartoon"
    },
    aiExample: {
      pdbId: "1CRN",
      style: "cartoon"
    }
  },

  abcNotation: {
    type: "abcNotation",
    label: "ABC 简谱",
    aiBindingSchema: {
      source: {
        type: "string",
        description: "ABC 记谱法字符串",
        example: "X:1\nT:小星星\nM:4/4\nK:C\nC C G G | A A G2 | F F E E | D D C2"
      }
    },
    componentMapping: {},
    defaultConfig: {
      source: "X:1\nT:小星星\nM:4/4\nK:C\nC C G G | A A G2 | F F E E | D D C2"
    },
    aiExample: {
      source: "X:1\nT:小星星\nM:4/4\nK:C\nC C G G | A A G2 | F F E E | D D C2"
    }
  },

  vexFlow: {
    type: "vexFlow",
    label: "VexFlow 五线谱",
    aiBindingSchema: {
      notes: {
        type: "array",
        description: "音符数组",
        example: [
          { keys: ["c/4"], duration: "q" },
          { keys: ["d/4"], duration: "q" },
          { keys: ["e/4"], duration: "q" }
        ]
      },
      timeSignature: {
        type: "string",
        description: "拍号",
        example: "4/4"
      },
      clef: {
        type: "string",
        description: "谱号",
        example: "treble"
      }
    },
    componentMapping: {},
    defaultConfig: {
      notes: [
        { keys: ["c/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" }
      ],
      timeSignature: "4/4",
      clef: "treble"
    },
    aiExample: {
      notes: [
        { keys: ["c/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" }
      ],
      timeSignature: "4/4",
      clef: "treble"
    }
  },

  rawCanvas: {
    type: "rawCanvas",
    label: "原生画布",
    aiBindingSchema: {
      drawConfig: {
        type: "object",
        description: "绘制配置",
        example: { type: "empty" }
      }
    },
    componentMapping: {},
    defaultConfig: {
      drawConfig: { type: "empty" }
    },
    aiExample: {
      drawConfig: { type: "empty" }
    }
  }
};

/**
 * 标准化的 remap 函数 - 使用 COMPONENT_CONFIGS 中的映射关系
 */
export function remapBindingBySchema(componentType: string, binding: Record<string, any>): Record<string, any> {
  const remapped: Record<string, any> = { ...binding };
  const config = COMPONENT_CONFIGS[componentType];
  
  if (config && config.componentMapping) {
    for (const [simpleKey, fullPath] of Object.entries(config.componentMapping)) {
      if (remapped[simpleKey] !== undefined) {
        remapped[fullPath] = remapped[simpleKey];
        delete remapped[simpleKey];
      }
    }
  }
  
  return remapped;
}

/**
 * 生成 AI 提示词中使用的组件文档说明
 */
export function generateAiComponentDocs(): string {
  const docsLines: string[] = [];
  
  for (const [type, config] of Object.entries(COMPONENT_CONFIGS)) {
    docsLines.push(`    * **${type}** (${config.label})：`);
    
    const props = Object.entries(config.aiBindingSchema)
      .map(([key, prop]) => `${key} (${prop.type})：${prop.description}`)
      .join("；");
    
    if (props) {
      docsLines.push(`      配置项：${props}`);
    }
    
    if (config.aiExample) {
      docsLines.push(`      示例：\`\`\`json\n${JSON.stringify(config.aiExample, null, 2)}\n      \`\`\``);
    }
    
    docsLines.push("");
  }
  
  return docsLines.join("\n");
}

/**
 * 获取组件的默认配置
 */
export function getComponentDefaultConfig(type: string): Record<string, any> {
  const config = COMPONENT_CONFIGS[type];
  return config ? config.defaultConfig : {};
}

