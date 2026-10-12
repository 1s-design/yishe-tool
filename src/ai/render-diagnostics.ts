/**
 * 渲染链路临时诊断埋点（用于定位渲染超时 / 字体回退问题）。
 * 通过 snapshot 命令的 message 回传，便于 MCP 侧读取。
 */
export const renderDiagnostics: Record<string, unknown> = {
  visibility: "",
  fontCssMs: 0,
  fontCssLen: 0,
  usedFamilies: 0,
  fontFaceRules: 0,
  subsetOk: 0,
  subsetFail: 0,
  totalMs: 0,
  firstTryMs: 0,
  firstTryOk: false,
  firstTryErr: "",
  fallbackMs: 0,
  fallbackOk: false,
};
