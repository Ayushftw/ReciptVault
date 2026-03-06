import { OCRResult } from '../types';

/**
 * Parse raw OCR text from a receipt image into structured data.
 * Uses regex patterns to find amounts, dates, and store/product names.
 */
export function parseOCRText(rawText: string): Partial<OCRResult> {
  const result: Partial<OCRResult> = {
    rawText,
    confidence: 0,
  };

  if (!rawText || rawText.trim().length === 0) {
    return result;
  }

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // ── Amount ──
  result.amount = extractAmount(rawText);

  // ── Date ──
  result.purchaseDate = extractDate(rawText);

  // ── Store Name (usually the first prominent line) ──
  result.storeName = extractStoreName(lines);

  // ── Product Name (largest description near a price) ──
  result.productName = extractProductName(lines);

  // ── Confidence score ──
  let score = 0;
  if (result.amount) score += 0.3;
  if (result.purchaseDate) score += 0.3;
  if (result.storeName) score += 0.2;
  if (result.productName) score += 0.2;
  result.confidence = score;

  return result;
}

function extractAmount(text: string): number | undefined {
  // Try to find "total" line first
  const totalPatterns = [
    /(?:total|grand\s*total|amount\s*due|balance\s*due|net\s*total)\s*[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
    /\$\s*(\d{1,6}[.,]\d{2})/,
    /(\d{1,6}\.\d{2})/,
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (value > 0 && value < 100000) return value;
    }
  }

  return undefined;
}

function extractDate(text: string): string | undefined {
  // MM/DD/YYYY or MM-DD-YYYY
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,
    // Month DD, YYYY
    /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s*(\d{4})/i,
    // YYYY-MM-DD
    /(\d{4})-(\d{2})-(\d{2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const dateStr = match[0];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch {
        // continue to next pattern
      }
    }
  }

  return undefined;
}

function extractStoreName(lines: string[]): string | undefined {
  // Store name is typically in the first few lines, often in larger text
  // Skip very short lines and lines that look like phone numbers or addresses
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.length >= 3 &&
      line.length <= 40 &&
      !/^\d+$/.test(line) &&
      !/^\(?\d{3}\)?[\s\-]\d{3}[\s\-]\d{4}$/.test(line) &&
      !/^\d+\s+(st|nd|rd|th|ave|blvd|rd|dr|ln|ct|way)/i.test(line) &&
      !/^(www\.|http)/i.test(line)
    ) {
      return line;
    }
  }
  return undefined;
}

function extractProductName(lines: string[]): string | undefined {
  // Look for line items — lines with text followed by a price
  const itemPattern = /^(.{3,40})\s+\$?\d{1,6}[.,]\d{2}/;

  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match) {
      const name = match[1].trim();
      if (name.length >= 3 && !/^(sub\s*total|tax|total|cash|change)/i.test(name)) {
        return name;
      }
    }
  }

  return undefined;
}
