/**
 * Simple analytics implementation for tracking editor events
 * This can be replaced with a more full-featured analytics provider
 * like Segment, Mixpanel, or Google Analytics
 */

type EventData = Record<string, any>;

class Analytics {
  private enabled: boolean;
  private buffer: Array<{name: string, data: EventData, timestamp: number}> = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    
    // Initialize buffer flushing
    if (typeof window !== 'undefined') {
      this.flushInterval = setInterval(() => this.flush(), 30000); // Flush every 30s
    }
  }

  /**
   * Track an analytics event
   */
  track(name: string, data: EventData = {}) {
    if (!this.enabled) return;
    
    // Add event to buffer
    this.buffer.push({
      name,
      data,
      timestamp: Date.now()
    });
    
    // If buffer gets large, flush immediately
    if (this.buffer.length >= 10) {
      this.flush();
    }
    
    // Log events in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${name}:`, data);
    }
  }

  /**
   * Send buffered events to analytics backend
   */
  private async flush() {
    if (!this.enabled || this.buffer.length === 0) return;
    
    const events = [...this.buffer];
    this.buffer = [];
    
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      
      // Return events to buffer to try again later
      this.buffer = [...events, ...this.buffer];
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Flush remaining events
    if (this.buffer.length > 0) {
      this.flush();
    }
  }
}

// Singleton instance
const analytics = new Analytics();

// In case we need to add window cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analytics.dispose();
  });
}

export default analytics;