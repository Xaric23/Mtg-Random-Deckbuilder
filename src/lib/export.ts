import type { Card } from './types';
import { isLand } from './deck';

export function makeStandardExport(commander: Card | null, deck: Card[], mdfcAsLand: boolean): string {
  const nonlands = deck.filter(c => !isLand(c, mdfcAsLand));
  const lands = deck.filter(c => isLand(c, mdfcAsLand));
  let exportStr = `Commander\n1 ${commander ? commander.name : ''}\n\nNonlands\n`;
  exportStr += nonlands.map(c => `1 ${c.name}`).join('\n');
  exportStr += `\n\nLands\n` + lands.map(c => `1 ${c.name}`).join('\n');
  return exportStr;
}

export function makeMTGO(deck: Card[], mdfcAsLand: boolean): string {
  const nonlands = deck.filter(c => !isLand(c, mdfcAsLand));
  const lands = deck.filter(c => isLand(c, mdfcAsLand));
  return [...nonlands, ...lands].map(c => `1 ${c.name}`).join('\n');
}

export function makeArena(commander: Card | null, deck: Card[], mdfcAsLand: boolean): string {
  const nonlands = deck.filter(c => !isLand(c, mdfcAsLand));
  const lands = deck.filter(c => isLand(c, mdfcAsLand));
  const all = [...nonlands, ...lands];
  return `Deck\n${all.map(c => `1 ${c.name}`).join('\n')}\n\nCommander\n1 ${commander ? commander.name : ''}`;
}

export function makeMoxfield(commander: Card | null, deck: Card[], mdfcAsLand: boolean): string {
  const nonlands = deck.filter(c => !isLand(c, mdfcAsLand));
  const lands = deck.filter(c => isLand(c, mdfcAsLand));
  return `Commander\n1 ${commander ? commander.name : ''}\n\n${[...nonlands, ...lands].map(c => `1 ${c.name}`).join('\n')}`;
}

export function makeArchidekt(commander: Card | null, deck: Card[], mdfcAsLand: boolean): string {
  // Archidekt format: Commander in separate section, then deck
  const nonlands = deck.filter(c => !isLand(c, mdfcAsLand));
  const lands = deck.filter(c => isLand(c, mdfcAsLand));
  let result = '';
  if (commander) {
    result += `// Commander\n1 ${commander.name}\n\n`;
  }
  result += `// Deck\n`;
  result += [...nonlands, ...lands].map(c => {
    const tags = c._tag ? ` # ${c._tag}` : '';
    return `1 ${c.name}${tags}`;
  }).join('\n');
  return result;
}

export function makeMoxfieldWithTags(commander: Card | null, deck: Card[], mdfcAsLand: boolean): string {
  // Enhanced Moxfield format with tags
  const nonlands = deck.filter(c => !isLand(c, mdfcAsLand));
  const lands = deck.filter(c => isLand(c, mdfcAsLand));
  let result = '';
  if (commander) {
    result += `Commander\n1 ${commander.name}\n\n`;
  }
  result += [...nonlands, ...lands].map(c => {
    const tags = c._tag ? ` # ${c._tag}` : '';
    return `1 ${c.name}${tags}`;
  }).join('\n');
  return result;
}

export async function copyToClipboard(text: string): Promise<void> {
  // Try using the modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn('Clipboard API failed:', error);
    }
  }

  // Fallback for older browsers or non-secure contexts
  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    const success = document.execCommand('copy');
    if (!success) {
      throw new Error('Copy command failed');
    }
  } catch (error) {
    console.error('Clipboard fallback failed:', error);
    throw new Error('Failed to copy text to clipboard');
  } finally {
    if (textarea && textarea.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }
  }
}

