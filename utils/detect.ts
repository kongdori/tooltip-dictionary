/**
 * Word detection utility for Tooltip Dictionary
 * Detects the word under the mouse cursor
 */

interface Position {
  x: number;
  y: number;
}

interface RangeInfo {
  node: Node;
  offset: number;
}

/**
 * Checks if a character is a whitespace character
 */
function isWhitespace(char: string): boolean {
  return /[ \f\n\r\t\v\u00A0\u2028\u2029]/.test(char);
}

/**
 * Checks if a character is a special character
 */
function isSpecialCharacter(char: string): boolean {
  return /[\^\$\!\@\#\%\&\*\-\_\=\+\,\.\:\/\;\"\'\(\)\[\]\{\<\>}]/.test(char);
}

/**
 * Checks if an element is a block-level element
 */
function isBlockElement(element: Element | null): boolean {
  return !element || /^(BR|DIV|P|PRE|TD|TR|TABLE)$/i.test(element.nodeName);
}

/**
 * Gets the next sibling of an element, considering parent relationships
 */
function getNextSibling(element: Node): Node | null {
  let nextSibling: Node | null = null;

  if (element.nextSibling) {
    nextSibling = element.nextSibling;
  } else if (element.parentNode && element.parentNode.nextSibling) {
    nextSibling = element.parentNode.nextSibling;
  }

  return isBlockElement(nextSibling as Element) ? null : nextSibling;
}

/**
 * Gets the previous sibling of an element, considering parent relationships
 */
function getPreviousSibling(element: Node): Node | null {
  let previousSibling: Node | null = null;

  if (element.previousSibling) {
    previousSibling = element.previousSibling;
  } else if (element.parentNode && element.parentNode.previousSibling) {
    previousSibling = element.parentNode.previousSibling;
  }

  return isBlockElement(previousSibling as Element) ? null : previousSibling;
}

/**
 * Gets the index of an element among its siblings
 */
function getElementIndex(element: Node): number {
  let index = 0;
  let currentElement: Node | null = element;
  
  while ((currentElement = currentElement.previousSibling)) {
    index++;
  }
  return index;
}

/**
 * Gets the position information from a text range (IE-specific)
 */
function getTextRangePosition(textRange: any, isStart: boolean): RangeInfo {
  const duplicatedRange = textRange.duplicate();
  duplicatedRange.collapse(isStart);

  let compareResult: number;
  let container = duplicatedRange.parentElement();
  const span = document.createElement("span");
  const compareMethod = isStart ? "StartToStart" : "StartToEnd";

  do {
    container.insertBefore(span, span.previousSibling);
    duplicatedRange.moveToElementText(span);
  } while ((compareResult = duplicatedRange.compareEndPoints(compareMethod, textRange)) > 0 && span.previousSibling);

  let result: RangeInfo;
  if (compareResult === -1 && span.nextSibling) {
    duplicatedRange.setEndPoint(isStart ? "EndToStart" : "EndToEnd", textRange);
    result = {
      node: span.nextSibling,
      offset: duplicatedRange.text.length
    };
  } else {
    result = {
      node: container,
      offset: getElementIndex(span)
    };
  }

  span.parentNode?.removeChild(span);
  return result;
}

/**
 * Extracts a word from a click position
 */
export default function detectWord(position: Position): string {
  let node: Node | null = null;
  let offset = 0;
  let caretPosition: any;

  // Handle different browser implementations for getting text node at point
  if ((document.body as any).createTextRange) {
    try {
      caretPosition = (document.body as any).createTextRange();
      caretPosition.moveToPoint(position.x, position.y);
      caretPosition.select();

      const rangeInfo = getTextRangePosition(caretPosition, true);
      node = rangeInfo.node;
      offset = rangeInfo.offset;
    } catch (e) {
      return "";
    }
  } else if ((document as any).caretPositionFromPoint) {
    caretPosition = (document as any).caretPositionFromPoint(position.x, position.y);
    if (!caretPosition) {
      return "";
    }
    node = caretPosition.offsetNode;
    offset = caretPosition.offset;
  } else if (document.caretRangeFromPoint) {
    caretPosition = document.caretRangeFromPoint(position.x, position.y) || new Range();
    node = caretPosition.startContainer;
    offset = caretPosition.startOffset;
  }

  // Ensure we have a valid text node
  if (!node || node.nodeType !== Node.TEXT_NODE) {
    return "";
  }

  const text = node.textContent || "";

  // Check if the offset is valid
  if (offset <= 0 || offset >= text.length) {
    return "";
  }

  // Check if the character at offset is valid for word detection
  if (isWhitespace(text[offset]) || isSpecialCharacter(text[offset])) {
    return "";
  }

  // Find word boundaries
  let wordStart = offset;
  let wordEnd = offset;
  let wordPosition = offset;

  // Find word start
  while (wordStart > 0 && !isWhitespace(text[wordStart - 1]) && !isSpecialCharacter(text[wordStart - 1])) {
    wordStart--;
  }

  // Store the start of the word
  wordPosition = wordStart;

  // Find word end
  while (wordEnd < text.length - 1 && !isWhitespace(text[wordEnd + 1]) && !isSpecialCharacter(text[wordEnd + 1])) {
    wordEnd++;
  }

  // Extract the word
  let word = text.substring(wordPosition, wordEnd + 1);

  // Handle words at text node boundaries
  if (wordEnd === text.length - 1 || wordStart === 0) {
    const nextSibling = getNextSibling(node);
    const prevSibling = getPreviousSibling(node);

    // Check next node for continuation of the word
    if (wordEnd == text.length - 1 && nextSibling) {
      const nextText = nextSibling.textContent || "";
      let nextWordEnd = 0;
      while (nextWordEnd < nextText.length && !isWhitespace(nextText[nextWordEnd]) && !isSpecialCharacter(nextText[nextWordEnd])) {
        word += nextText[nextWordEnd];
        nextWordEnd++;
      }
    }
    // Check previous node for start of the word
    else if (wordStart === 0 && prevSibling) {
      const prevText = prevSibling.textContent || "";
      let prevWordStart = prevText.length - 1;
      while (prevWordStart >= 0 && !isWhitespace(prevText[prevWordStart]) && !isSpecialCharacter(prevText[prevWordStart])) {
        word = prevText[prevWordStart] + word;
        prevWordStart--;
      }
    }
  }

  return word;
}
