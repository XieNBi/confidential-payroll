/**
 * Gateway 健康检查工具
 * 基于文档最佳实践
 */

import { GATEWAY_URL } from '../constants/contracts';

/**
 * 检查 Gateway 健康状况
 * @returns Promise<boolean> - Gateway 是否可用
 */
export async function checkGatewayHealth(): Promise<boolean> {
  const url = `${GATEWAY_URL}/public_key`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    const resp = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!resp.ok) {
      console.warn("⚠️ Gateway 响应非 200:", resp.status);
      return false;
    }
    
    const text = await resp.text();
    
    // 验证公钥格式
    const isValid = text.startsWith("0x04") && text.length >= 66;
    
    if (!isValid) {
      console.warn("⚠️ Gateway 公钥格式无效:", text.substring(0, 20));
    }
    
    return isValid;
  } catch (error) {
    if (error instanceof Error) {
      console.warn("⚠️ Gateway 不可用:", error.message);
    }
    return false;
  }
}

/**
 * 启动 Gateway 健康监控（定时轮询）
 * @param onStatusChange - 状态变化回调函数
 * @param intervalMs - 轮询间隔（默认 60 秒）
 * @returns 清理函数
 */
export function startGatewayMonitor(
  onStatusChange: (isUp: boolean) => void,
  intervalMs: number = 60000
): () => void {
  let currentStatus: boolean | null = null;
  
  const check = async () => {
    const isUp = await checkGatewayHealth();
    
    if (currentStatus !== isUp) {
      currentStatus = isUp;
      onStatusChange(isUp);
      console.log(`🔄 Gateway 状态变化: ${isUp ? "✅ 在线" : "❌ 离线"}`);
    }
  };
  
  // 立即检查一次
  check();
  
  // 启动定时轮询
  const intervalId = setInterval(check, intervalMs);
  
  // 返回清理函数
  return () => {
    clearInterval(intervalId);
  };
}

