// ==============================|| CLIPBOARD UTILITY ||============================== //

/**
 * Safely copy text to clipboard with fallback support
 * @param text - Text to copy
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Check if navigator.clipboard is available and we're in a secure context
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-secure contexts or older browsers
      return fallbackCopyToClipboard(text);
    }
  } catch (error) {
    console.warn('Clipboard API failed, trying fallback:', error);
    return fallbackCopyToClipboard(text);
  }
};

/**
 * Fallback method using document.execCommand for older browsers
 * @param text - Text to copy
 * @returns boolean - True if successful, false otherwise
 */
const fallbackCopyToClipboard = (text: string): boolean => {
  try {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make it invisible
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    // Execute copy command
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.warn('Fallback clipboard copy failed:', error);
    return false;
  }
};

/**
 * Check if clipboard API is supported
 * @returns boolean - True if supported, false otherwise
 */
export const isClipboardSupported = (): boolean => {
  return !!(navigator.clipboard && window.isSecureContext);
}; 