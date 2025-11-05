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

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

