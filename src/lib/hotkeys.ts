export type HotkeyAction = 
  | 'search-commander'
  | 'search-cards'
  | 'random-deck'
  | 'random-commander'
  | 'export'
  | 'save-deck'
  | 'toggle-dark-mode'
  | 'reset-deck';

export interface HotkeyHandler {
  action: HotkeyAction;
  handler: () => void;
  description: string;
}

const HOTKEY_MAP: Record<string, HotkeyAction> = {
  '/': 'search-commander',
  'f': 'search-cards',
  'r': 'random-deck',
  'q': 'random-commander',
  'e': 'export',
  's': 'save-deck',
  'd': 'toggle-dark-mode',
  'x': 'reset-deck',
};

export function setupHotkeys(handlers: HotkeyHandler[]): () => void {
  const handlerMap = new Map<HotkeyAction, () => void>();
  handlers.forEach(h => handlerMap.set(h.action, h.handler));

  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if typing in input/textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow '/' for search when not already focused
      if (e.key === '/' && target !== document.activeElement) {
        e.preventDefault();
        const handler = handlerMap.get('search-commander');
        if (handler) handler();
      }
      return;
    }

    const action = HOTKEY_MAP[e.key.toLowerCase()];
    if (action) {
      const handler = handlerMap.get(action);
      if (handler) {
        e.preventDefault();
        handler();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

export function getHotkeyHelp(handlers: HotkeyHandler[]): string {
  const help: string[] = [];
  handlers.forEach(h => {
    // skip the first tuple element in the predicate to avoid introducing an unused variable
    const key = Object.entries(HOTKEY_MAP).find(([, action]) => action === h.action)?.[0];
    if (key) {
      help.push(`${key.toUpperCase()}: ${h.description}`);
    }
  });
  return help.join(' • ');
}

