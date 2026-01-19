/**
 * Create FPS stats display
 */

export function createStats() {
    const stats = {
        dom: null,
        update: function() {
            // Stats are updated in main.js
        }
    };

    // Create stats container
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats';
    statsContainer.innerHTML = 'FPS: <span id="fps">60</span>';
    stats.dom = statsContainer;

    return stats;
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.frameTimes = [];
        this.maxFrameTimes = 100;
    }

    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        // Track frame times for more detailed analysis
        const frameTime = currentTime - this.lastTime;
        this.frameTimes.push(frameTime);
        if (this.frameTimes.length > this.maxFrameTimes) {
            this.frameTimes.shift();
        }

        return this.fps;
    }

    getAverageFrameTime() {
        if (this.frameTimes.length === 0) return 0;
        return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    }

    getMinFrameTime() {
        if (this.frameTimes.length === 0) return 0;
        return Math.min(...this.frameTimes);
    }

    getMaxFrameTime() {
        if (this.frameTimes.length === 0) return 0;
        return Math.max(...this.frameTimes);
    }

    isPerformanceGood() {
        return this.fps >= 30; // Good performance if above 30 FPS
    }

    getPerformanceRating() {
        if (this.fps >= 60) return 'Excellent';
        if (this.fps >= 45) return 'Good';
        if (this.fps >= 30) return 'Acceptable';
        if (this.fps >= 20) return 'Poor';
        return 'Very Poor';
    }
}

/**
 * Memory usage monitoring
 */
export class MemoryMonitor {
    constructor() {
        this.initialMemory = 0;
        this.peakMemory = 0;
        this.samples = [];
    }

    update() {
        if (performance.memory) {
            const usedJSHeapSize = performance.memory.usedJSHeapSize;
            const totalJSHeapSize = performance.memory.totalJSHeapSize;
            
            if (this.initialMemory === 0) {
                this.initialMemory = usedJSHeapSize;
            }

            this.peakMemory = Math.max(this.peakMemory, usedJSHeapSize);
            this.samples.push({
                timestamp: performance.now(),
                used: usedJSHeapSize,
                total: totalJSHeapSize
            });

            // Keep only last 100 samples
            if (this.samples.length > 100) {
                this.samples.shift();
            }

            return {
                used: this.formatBytes(usedJSHeapSize),
                total: this.formatBytes(totalJSHeapSize),
                peak: this.formatBytes(this.peakMemory),
                growth: this.formatBytes(usedJSHeapSize - this.initialMemory)
            };
        }
        return null;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    isMemoryLeaking() {
        if (this.samples.length < 20) return false;
        
        const recent = this.samples.slice(-20);
        const first = recent[0].used;
        const last = recent[recent.length - 1].used;
        
        // If memory grew by more than 50% in recent samples, likely leaking
        return (last - first) / first > 0.5;
    }
}