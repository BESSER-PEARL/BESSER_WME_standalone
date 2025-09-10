/**
 * UI utility service for UML Bot Widget
 * Handles message formatting, validation, and UI state management
 */

import { ChatMessage } from './WebSocketService';

export interface MessageDisplayConfig {
  showTimestamp?: boolean;
  showAvatar?: boolean;
  enableCodeHighlighting?: boolean;
  maxMessageLength?: number;
}

/**
 * Service for handling UI-related operations
 */
export class UIService {
  private config: MessageDisplayConfig;

  constructor(config: MessageDisplayConfig = {}) {
    this.config = {
      showTimestamp: true,
      showAvatar: true,
      enableCodeHighlighting: true,
      maxMessageLength: 5000,
      ...config
    };
  }

  /**
   * Format message content for display
   */
  formatMessageContent(message: ChatMessage): string {
    let content = typeof message.message === 'string' 
      ? message.message 
      : JSON.stringify(message.message, null, 2);

    // Truncate if too long
    if (this.config.maxMessageLength && content.length > this.config.maxMessageLength) {
      content = content.substring(0, this.config.maxMessageLength) + '...';
    }

    return content;
  }

  /**
   * Extract JSON blocks from message content
   */
  extractJsonBlocks(content: string): Array<{ json: string; language: string }> {
    const jsonBlocks: Array<{ json: string; language: string }> = [];
    
    // Look for ```json blocks
    const jsonRegex = /```json\n([\s\S]*?)\n```/g;
    let match;
    
    while ((match = jsonRegex.exec(content)) !== null) {
      jsonBlocks.push({
        json: match[1],
        language: 'json'
      });
    }

    // Look for standalone JSON objects
    const standaloneJsonRegex = /(\{[\s\S]*?\})/g;
    const standaloneMatches = content.match(standaloneJsonRegex);
    
    if (standaloneMatches) {
      standaloneMatches.forEach(jsonStr => {
        try {
          JSON.parse(jsonStr); // Validate it's valid JSON
          jsonBlocks.push({
            json: jsonStr,
            language: 'json'
          });
        } catch (e) {
          // Not valid JSON, ignore
        }
      });
    }

    return jsonBlocks;
  }

  /**
   * Check if message contains importable model
   */
  containsImportableModel(content: string): boolean {
    const jsonBlocks = this.extractJsonBlocks(content);
    
    return jsonBlocks.some(block => {
      try {
        const parsed = JSON.parse(block.json);
        return this.isValidUMLModel(parsed);
      } catch (e) {
        return false;
      }
    });
  }

  /**
   * Validate if object is a valid UML model
   */
  private isValidUMLModel(obj: any): boolean {
    return obj && 
           typeof obj === 'object' &&
           (obj.elements || obj.class || obj.type === 'ClassDiagram');
  }

  /**
   * Generate message timestamp
   */
  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Format as time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Validate user input
   */
  validateUserInput(input: string): { valid: boolean; error?: string } {
    if (!input || input.trim().length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (input.length > 1000) {
      return { valid: false, error: 'Message too long (max 1000 characters)' };
    }

    // Check for potential harmful content (basic)
    const harmfulPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(input)) {
        return { valid: false, error: 'Invalid characters detected' };
      }
    }

    return { valid: true };
  }

  /**
   * Generate unique ID for UI elements
   */
  generateId(prefix: string = 'ui'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Scroll to bottom of element
   */
  scrollToBottom(element: HTMLElement | null, smooth: boolean = true): void {
    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Show toast notification (simple implementation)
   */
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    // Create toast element
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;

    // Add CSS animation
    if (!document.querySelector('#toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T, 
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T, 
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  /**
   * Format code for display
   */
  formatCode(code: string, language: string = 'json'): string {
    if (language === 'json') {
      try {
        const parsed = JSON.parse(code);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return code;
      }
    }
    
    return code;
  }

  /**
   * Check if string is valid JSON
   */
  isValidJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get friendly error message
   */
  getFriendlyErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error) {
      return error.error;
    }
    
    return 'An unexpected error occurred';
  }

  /**
   * Create loading animation element
   */
  createLoadingElement(): HTMLElement {
    const loader = document.createElement('div');
    loader.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        color: #666;
        font-style: italic;
      ">
        <div style="
          width: 16px;
          height: 16px;
          border: 2px solid #e3e3e3;
          border-top: 2px solid #666;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        Processing...
      </div>
    `;
    
    // Add spin animation if not exists
    if (!document.querySelector('#spinner-styles')) {
      const styles = document.createElement('style');
      styles.id = 'spinner-styles';
      styles.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styles);
    }
    
    return loader;
  }
}
