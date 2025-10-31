/**
 * Relayer Client - Gateway 解密轮询工具
 * 参考：FHEVM 开发标准手册第 3.3 节
 */

const RELAYER_CONFIG = {
  sepolia: {
    url: 'https://gateway.sepolia.zama.ai/v1/public-decrypt',
    chainId: 11155111
  }
};

export interface PollProgress {
  current: number;
  total: number;
  percentage: number;
}

export interface PollOptions {
  maxAttempts?: number;      // 最大尝试次数
  interval?: number;          // 轮询间隔（毫秒）
  onProgress?: (progress: PollProgress) => void;
}

export class RelayerClient {
  private config: typeof RELAYER_CONFIG.sepolia;

  constructor(network: keyof typeof RELAYER_CONFIG = 'sepolia') {
    this.config = RELAYER_CONFIG[network];
  }

  /**
   * 核心功能：轮询 Gateway 解密结果
   */
  async pollDecryption(
    requestId: bigint,
    contractAddress: string,
    options: PollOptions = {}
  ): Promise<{ success: boolean; data?: any; attempts: number }> {
    const {
      maxAttempts = 60,      // 5分钟（60次 * 5秒）
      interval = 5000,       // 5秒一次
      onProgress = null
    } = options;

    console.log('🔐 Starting Gateway decryption polling...', {
      requestId: requestId.toString(),
      contractAddress,
      estimatedTime: `${(maxAttempts * interval) / 1000} seconds`
    });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // 调用进度回调
        if (onProgress) {
          onProgress({
            current: attempt,
            total: maxAttempts,
            percentage: Math.round((attempt / maxAttempts) * 100)
          });
        }

        // 请求 Gateway
        const requestIdHex = requestId.toString(16).padStart(64, '0');
        const response = await fetch(this.config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            handle: `0x${requestIdHex}`,
            contractAddress: contractAddress,
            chainId: this.config.chainId
          })
        });

        // 成功
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Gateway decryption completed (attempt ${attempt})`);
          return { success: true, data, attempts: attempt };
        }

        // 404 表示还未准备好
        if (response.status === 404) {
          console.log(`⏳ Attempt ${attempt}/${maxAttempts}... (not ready yet)`);
        } else {
          console.warn(`⚠️ Gateway returned error: ${response.status}`);
        }

      } catch (error: any) {
        console.warn(`⚠️ Polling attempt ${attempt} failed:`, error.message);
      }

      // 等待下一次尝试
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error(
      `Gateway decryption timeout (${maxAttempts} attempts, ${(maxAttempts * interval) / 1000} seconds)`
    );
  }

  /**
   * 检查 Gateway 健康状态
   */
  async checkHealth(): Promise<boolean> {
    try {
      const baseUrl = this.config.url.replace('/v1/public-decrypt', '');
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Gateway health check failed:', error);
      return false;
    }
  }
}

export default RelayerClient;

