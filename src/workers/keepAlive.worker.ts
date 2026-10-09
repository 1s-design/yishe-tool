// Web Worker 保活机制 - 不受标签页节流影响
let intervalId: number | null = null;

self.onmessage = (e) => {
  const { type, interval } = e.data;
  
  if (type === 'start') {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      self.postMessage({ type: 'heartbeat' });
    }, interval || 15000);
  } else if (type === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};
