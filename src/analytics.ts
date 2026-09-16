/**
 * Makers 数据分析（平台注入式 SDK）的手动调用封装。
 *
 * 这个站点的 SDK 由 EdgeOne Makers 在边缘**自动注入**（loader → standalone），
 * 注入成功后会在页面上挂一个全局实例 `window.eoAnalytics`，业务代码直接调它即可：
 *
 *   window.eoAnalytics.track(name, data)        自定义事件（属性按后台配置的字段映射到 ext1~3）
 *   window.eoAnalytics.reportTiming(name, ms)   自定义测速
 *
 * 注意：本地 `vite dev`（没走 Makers 边缘）时这个全局不存在，
 * 所以下面所有调用都做存在性判断、失败静默 —— 不能因为埋点把业务搞挂。
 */

export interface EoAnalytics {
  track?: (name: string, data?: Record<string, unknown>) => void;
  reportTiming?: (name: string, duration: number) => void;
  isReady?: () => boolean;
}

declare global {
  interface Window {
    /** 平台注入的全局实例 */
    eoAnalytics?: EoAnalytics;
    /** 平台注入标记（如 injected@0.2.0），未注入时为 undefined */
    __MAKERS_ANALYTICS_SDK__?: string;
  }
}

/** SDK 是否已就绪（调试用，可在控制台执行 __analyticsReady()） */
export function analyticsReady(): boolean {
  return !!window.eoAnalytics?.isReady?.();
}

/** 自定义事件上报；SDK 未注入时静默跳过 */
export function track(name: string, data?: Record<string, unknown>): void {
  try {
    window.eoAnalytics?.track?.(name, data);
  } catch {
    /* 上报失败不影响业务 */
  }
}

/** 自定义测速上报；同上 */
export function reportTiming(name: string, duration: number): void {
  try {
    window.eoAnalytics?.reportTiming?.(name, duration);
  } catch {
    /* 上报失败不影响业务 */
  }
}

// 方便在浏览器控制台里手动发数据（手机端也能通过页面按钮触发）
window.__makersTrack = (name: string, data?: Record<string, unknown>) => {
  track(name, data);
  return `已上报 ${name} ${data ? JSON.stringify(data) : ''}`;
};
declare global {
  interface Window {
    __makersTrack?: (name: string, data?: Record<string, unknown>) => string;
  }
}
