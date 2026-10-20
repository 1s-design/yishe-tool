/**
 * 画布尺寸锁：批量/复刻任务锁定画布尺寸期间，
 * 所有 setCanvasSize 调用（canvas.setSize / smartSize / setSizeByPreset / agent 直调）
 * 一律钳制到锁定值——模型在回改时「改画布尺寸来迁就文字」是实测顽疾，不信模型。
 */
let locked: { width: number; height: number; unit: string } | null = null;

export function lockCanvasSize(width: number, height: number, unit = "px") {
  locked = {
    width: Math.round(Number(width)),
    height: Math.round(Number(height)),
    unit,
  };
}

export function unlockCanvasSize() {
  locked = null;
}

export function getCanvasSizeLock() {
  return locked;
}
