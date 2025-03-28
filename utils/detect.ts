/**
 * Word detection utility for Tooltip Dictionary
 * Detects the word under the mouse cursor
 */

interface Position {
  x: number;
  y: number;
}

/**
 * Checks if a character should be considered a word boundary
 */
function isWordBoundary(char: string): boolean {
  return /[^a-zA-ZÀ-ÖØ-öø-ÿ]/.test(char);
}

/**
 * Extracts a word from a click position
 */
export default function detectWord(position: Position): string {
  // Get text node at position using modern API
  const range = document.caretRangeFromPoint(position.x, position.y);
  if (!range) return "";
  
  const node = range.startContainer;
  const offset = range.startOffset;
  
  // Ensure we have a valid text node
  if (!node || node.nodeType !== Node.TEXT_NODE || !node.textContent) return "";
  
  const text = node.textContent;
  
  // Check if the offset is valid
  if (offset < 0 || offset >= text.length || isWordBoundary(text[offset])) return "";
  
  // Find word boundaries using a more efficient approach
  let start = offset;
  let end = offset;
  
  // Find start of word
  while (start > 0 && !isWordBoundary(text[start - 1])) {
    start--;
  }
  
  // Find end of word
  while (end < text.length - 1 && !isWordBoundary(text[end + 1])) {
    end++;
  }
  
  // Extract the word
  return text.substring(start, end + 1);
}
