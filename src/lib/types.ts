export interface Card {
  id: string;
  name: string;
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  color_identity?: string[];
  legalities?: {
    commander?: string;
  };
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
  };
  card_faces?: Array<{
    name?: string;
    mana_cost?: string;
    type_line?: string;
    image_uris?: {
      small?: string;
      normal?: string;
      large?: string;
      png?: string;
    };
    produced_mana?: string[];
  }>;
  produced_mana?: string[];
  _tag?: 'Ramp' | 'Draw' | 'Removal';
}

export interface SavedDeck {
  commanderId: string | null;
  deckIds: string[];
}

export interface DeckState {
  commander: Card | null;
  deck: Card[];
  maybeboard?: Card[];
}

export interface QuickFilter {
  ramp: string;
  draw: string;
  removal: string;
  boardwipe: string;
  tutor: string;
}

