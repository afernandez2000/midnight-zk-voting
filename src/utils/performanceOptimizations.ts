// Competition-Grade Performance Optimizations

export class CryptoPerformanceCache {
  private static hashCache = new Map<string, string>();
  private static proofCache = new Map<string, any>();
  private static maxCacheSize = 10000;

  static getHashCached(input: string): string {
    if (this.hashCache.has(input)) {
      return this.hashCache.get(input)!;
    }

    // Compute hash (implementation would use actual crypto library)
    const hash = this.computeHash(input);
    
    // Manage cache size
    if (this.hashCache.size >= this.maxCacheSize) {
      const firstKey = this.hashCache.keys().next().value;
      this.hashCache.delete(firstKey);
    }
    
    this.hashCache.set(input, hash);
    return hash;
  }

  static getProofCached(key: string, generator: () => any): any {
    if (this.proofCache.has(key)) {
      return this.proofCache.get(key);
    }

    const proof = generator();
    
    if (this.proofCache.size >= this.maxCacheSize) {
      const firstKey = this.proofCache.keys().next().value;
      this.proofCache.delete(firstKey);
    }
    
    this.proofCache.set(key, proof);
    return proof;
  }

  private static computeHash(input: string): string {
    // Placeholder for actual hash computation
    return input.split('').reverse().join('');
  }

  static clearCache(): void {
    this.hashCache.clear();
    this.proofCache.clear();
  }

  static getCacheStats(): { hashCacheSize: number; proofCacheSize: number } {
    return {
      hashCacheSize: this.hashCache.size,
      proofCacheSize: this.proofCache.size
    };
  }
}

export class BatchProcessor {
  private static batchQueue: Array<{
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private static batchSize = 10;
  private static processingBatch = false;

  static async addToBatch<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ operation, resolve, reject });
      
      if (!this.processingBatch) {
        this.processBatch();
      }
    });
  }

  private static async processBatch(): Promise<void> {
    this.processingBatch = true;

    while (this.batchQueue.length > 0) {
      const batch = this.batchQueue.splice(0, this.batchSize);
      
      try {
        // Process batch operations in parallel
        const results = await Promise.allSettled(
          batch.map(item => item.operation())
        );

        // Resolve/reject based on results
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            batch[index].resolve(result.value);
          } else {
            batch[index].reject(result.reason);
          }
        });
      } catch (error) {
        // Reject all operations in this batch
        batch.forEach(item => item.reject(error));
      }

      // Small delay between batches to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.processingBatch = false;
  }
}

export class MemoryPool {
  private static pool: Array<ArrayBuffer> = [];
  private static readonly POOL_SIZE = 100;
  private static readonly BUFFER_SIZE = 1024 * 1024; // 1MB

  static getBuffer(): ArrayBuffer {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return new ArrayBuffer(this.BUFFER_SIZE);
  }

  static returnBuffer(buffer: ArrayBuffer): void {
    if (this.pool.length < this.POOL_SIZE) {
      // Zero out the buffer before returning to pool
      new Uint8Array(buffer).fill(0);
      this.pool.push(buffer);
    }
  }

  static getPoolStats(): { available: number; totalSize: number } {
    return {
      available: this.pool.length,
      totalSize: this.POOL_SIZE
    };
  }
}

interface WorkerWithBusy extends Worker {
  busy?: boolean;
}

export class WorkerPool {
  private static workers: WorkerWithBusy[] = [];
  private static workerQueue: Array<{
    task: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private static maxWorkers = 4; // Remove navigator dependency for Node.js

  static async processInWorker<T>(task: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.workerQueue.push({ task, resolve, reject });
      this.assignWork();
    });
  }

  private static assignWork(): void {
    if (this.workerQueue.length === 0) return;

    // Find available worker or create new one
    let worker = this.workers.find(w => !w.busy);
    
    if (!worker && this.workers.length < this.maxWorkers) {
      worker = this.createWorker();
      this.workers.push(worker);
    }

    if (worker) {
      const workItem = this.workerQueue.shift()!;
      worker.busy = true;

      worker.postMessage(workItem.task);
      
      worker.onmessage = (e) => {
        worker!.busy = false;
        workItem.resolve(e.data);
        this.assignWork(); // Process next item
      };

      worker.onerror = (error) => {
        worker!.busy = false;
        workItem.reject(error);
        this.assignWork(); // Process next item
      };
    }
  }

  private static createWorker(): WorkerWithBusy {
    // For Node.js environment, simulate worker behavior
    if (typeof Worker === 'undefined') {
      // Mock worker for Node.js environment
      const mockWorker = {
        busy: false,
        postMessage: (data: any) => {
          setTimeout(() => {
            if (mockWorker.onmessage) {
              mockWorker.onmessage({ data: { result: 'mock_result' } } as any);
            }
          }, 10);
        },
        onmessage: null as any,
        onerror: null as any,
        terminate: () => {}
      } as WorkerWithBusy;
      return mockWorker;
    }

    // Browser environment - create actual worker
    const workerCode = `
      self.onmessage = function(e) {
        const { type, data } = e.data;
        
        switch (type) {
          case 'hash':
            const result = { hash: 'computed_hash_' + (data?.length || 0) };
            self.postMessage(result);
            break;
          case 'proof':
            const proof = { proof: 'generated_proof_' + Date.now() };
            self.postMessage(proof);
            break;
          default:
            self.postMessage({ error: 'Unknown task type' });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob)) as WorkerWithBusy;
  }

  static terminateWorkers(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.workerQueue = [];
  }
}

export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();
  private static readonly MAX_SAMPLES = 1000;

  static startTiming(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(operation, duration);
    };
  }

  static async measureAsync<T>(
    operation: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const stopTiming = this.startTiming(operation);
    try {
      const result = await fn();
      stopTiming();
      return result;
    } catch (error) {
      stopTiming();
      throw error;
    }
  }

  private static recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const samples = this.metrics.get(operation)!;
    samples.push(duration);

    // Keep only recent samples
    if (samples.length > this.MAX_SAMPLES) {
      samples.shift();
    }
  }

  static getMetrics(operation: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const samples = this.metrics.get(operation);
    if (!samples || samples.length === 0) return null;

    const sorted = [...samples].sort((a, b) => a - b);
    const count = samples.length;
    const avg = samples.reduce((sum, val) => sum + val, 0) / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index];

    return { count, avg, min, max, p95 };
  }

  static getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [operation, _] of this.metrics) {
      result[operation] = this.getMetrics(operation);
    }
    return result;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

// Optimized cryptographic operations
export class OptimizedCrypto {
  static async batchHashOperations(inputs: string[]): Promise<string[]> {
    return BatchProcessor.addToBatch(async () => {
      return Promise.all(inputs.map(input => 
        CryptoPerformanceCache.getHashCached(input)
      ));
    });
  }

  static async parallelProofGeneration(proofRequests: any[]): Promise<any[]> {
    const chunks = this.chunkArray(proofRequests, WorkerPool['maxWorkers']);
    
    const chunkPromises = chunks.map(chunk =>
      WorkerPool.processInWorker({
        type: 'proof',
        data: chunk
      })
    );

    const results = await Promise.all(chunkPromises);
    return results.flat();
  }

  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  static precomputeCommonValues(): void {
    // Precompute frequently used cryptographic values
    const commonInputs = [
      'generator_point',
      'curve_order',
      'field_modulus',
      'hash_salt_2024'
    ];

    commonInputs.forEach(input => {
      CryptoPerformanceCache.getHashCached(input);
    });
  }
}

export default {
  CryptoPerformanceCache,
  BatchProcessor,
  MemoryPool,
  WorkerPool,
  PerformanceMonitor,
  OptimizedCrypto
};