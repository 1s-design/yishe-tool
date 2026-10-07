/**
 * Panzoom 实例共享 store
 * 用于在画布和子元素之间共享 panzoom 实例，以便控制画布的拖动和缩放
 */

let panzoomInstance: any = null

export function setPanzoomInstance(instance: any) {
  panzoomInstance = instance
}

export function getPanzoomInstance() {
  return panzoomInstance
}

/**
 * 临时暂停画布拖动（用于子元素交互时）
 */
export function pauseCanvasDrag() {
  if (panzoomInstance && typeof panzoomInstance.pause === 'function') {
    panzoomInstance.pause()
  }
}

/**
 * 恢复画布拖动
 */
export function resumeCanvasDrag() {
  if (panzoomInstance && typeof panzoomInstance.resume === 'function') {
    panzoomInstance.resume()
  }
}

/**
 * 画布视图控制（供底部工具栏调用）
 */
export function resetCanvasView() {
  const instance = getPanzoomInstance()
  const container = document.getElementById('basic-canvas-canvas-container')
  const target = document.querySelector<HTMLElement>(
    '#basic-canvas-canvas-container [data-panzoom-target], #basic-canvas-canvas-container .panzoom-wrapper',
  )

  if (!instance || !container || !target) {
    return
  }

  instance.zoomAbs(0, 0, 1)
  const x = (container.clientWidth - target.offsetWidth) / 2
  const y = (container.clientHeight - target.offsetHeight) / 2
  instance.moveTo(x, y)
}

export function zoomCanvas(scale: number) {
  const instance = getPanzoomInstance()
  const container = document.getElementById('basic-canvas-canvas-container')

  if (!instance || !container) {
    return
  }

  instance.smoothZoom(
    container.clientWidth / 2,
    container.clientHeight / 2,
    scale,
  )
}
