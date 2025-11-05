import type { Card } from './types';
import { fetchNamedCard } from './scryfall';

// Commander ban list (as of 2024)
export const COMMANDER_BANLIST = [
  'Ancestral Recall',
  'Balance',
  'Biorhythm',
  'Black Lotus',
  'Braids, Cabal Minion',
  'Chaos Orb',
  'Coalition Victory',
  'Channel',
  'Emrakul, the Aeons Torn',
  'Erayo, Soratami Ascendant',
  'Falling Star',
  'Fastbond',
  'Gifts Ungiven',
  'Griselbrand',
  'Iona, Shield of Emeria',
  'Karakas',
  'Leovold, Emissary of Trest',
  'Library of Alexandria',
  'Limited Resources',
  'Lutri, the Spellchaser',
  'Mox Emerald',
  'Mox Jet',
  'Mox Pearl',
  'Mox Ruby',
  'Mox Sapphire',
  'Panoptic Mirror',
  'Paradox Engine',
  'Primeval Titan',
  'Prophet of Kruphix',
  'Recurring Nightmare',
  'Rofellos, Llanowar Emissary',
  'Shahrazad',
  'Sundering Titan',
  'Sway of the Stars',
  'Sylvan Primordial',
  'Time Vault',
  'Time Walk',
  'Tinker',
  'Tolarian Academy',
  'Trade Secrets',
  'Upheaval',
  'Worldfire',
];

export interface ParsedDecklist {
  commander: string | null;
  deck: Array<{ quantity: number; name: string }>;
  maybeboard?: Array<{ quantity: number; name: string }>;
}

export function parseDecklist(text: string): ParsedDecklist {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const result: ParsedDecklist = { commander: null, deck: [], maybeboard: [] };
  let section = 'deck';
  
  for (const line of lines) {
    // Skip comments
    if (line.startsWith('//') || line.startsWith('#') || line.startsWith(';')) continue;
    
    // Detect sections
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('commander') || lowerLine.includes('general')) {
      section = 'commander';
      continue;
    } else if (lowerLine.includes('maybeboard') || lowerLine.includes('sideboard') || lowerLine.includes('maybe')) {
      section = 'maybeboard';
      continue;
    } else if (lowerLine.includes('deck') || lowerLine.includes('main')) {
      section = 'deck';
      continue;
    }
    
    // Parse card line: "1 Card Name" or "Card Name"
    const match = line.match(/^(\d+)\s*(?:x\s*)?(.+)$/i);
    if (match) {
      const quantity = parseInt(match[1], 10);
      const name = match[2].trim();
      
      // Remove tags/comments from card name
      const cleanName = name.split(' #')[0].split('//')[0].trim();
      
      if (section === 'commander') {
        result.commander = cleanName;
      } else if (section === 'maybeboard') {
        if (!result.maybeboard) result.maybeboard = [];
        result.maybeboard.push({ quantity, name: cleanName });
      } else {
        result.deck.push({ quantity, name: cleanName });
      }
    } else if (line.trim() && section === 'commander') {
      // Commander might be just the name without quantity
      result.commander = line.trim();
    }
  }
  
  return result;
}

export async function importDeckFromText(
  text: string,
  onProgress?: (status: string) => void
): Promise<{ commander: Card | null; deck: Card[]; maybeboard: Card[] }> {
  const parsed = parseDecklist(text);
  const commander: Card | null = parsed.commander
    ? await fetchNamedCard(parsed.commander)
    : null;
  
  const deck: Card[] = [];
  const maybeboard: Card[] = [];
  
  // Import deck cards
  for (let i = 0; i < parsed.deck.length; i++) {
    const item = parsed.deck[i];
    onProgress?.(`Loading deck cards... ${i + 1}/${parsed.deck.length}`);
    const card = await fetchNamedCard(item.name);
    if (card) {
      // Add multiple copies if quantity > 1 (for basic lands)
      for (let q = 0; q < item.quantity; q++) {
        deck.push(card);
      }
    }
    // Rate limiting
    if (i % 10 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Import maybeboard cards
  if (parsed.maybeboard) {
    for (let i = 0; i < parsed.maybeboard.length; i++) {
      const item = parsed.maybeboard[i];
      onProgress?.(`Loading maybeboard... ${i + 1}/${parsed.maybeboard.length}`);
      const card = await fetchNamedCard(item.name);
      if (card) {
        for (let q = 0; q < item.quantity; q++) {
          maybeboard.push(card);
        }
      }
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  return { commander, deck, maybeboard };
}

export function isBanned(cardName: string): boolean {
  return COMMANDER_BANLIST.some(banned => 
    cardName.toLowerCase() === banned.toLowerCase()
  );
}

