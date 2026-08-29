export type Stack = 'html-css' | 'html-css-js' | 'bootstrap';

export interface BlockVariant { html: string; css: string; }
export interface Block {
  id: string; category: string; label: string; tags: string[]; weight: number;
  slots: Record<string, { type: string; required?: boolean; default?: string; min?: number; max?: number }>;
  stacks: Record<string, { available: boolean; js?: string | null; nojs_fallback?: string }>;
  assets: string[]; insertable: boolean; conflicts: string[];
  a11y: Record<string, any>;
  provenance: { origin: string; license: string; author: string; attribution: string | null };
  variants: Record<string, BlockVariant>;
  hash: string;
}
export interface TokenPreset {
  id: string; label: string;
  color: Record<string, string>; colorDark: Record<string, string>;
  font: Record<string, string>; radius: Record<string, string>;
  space: Record<string, string>; shadow: Record<string, string>; target: Record<string, string>;
}
export interface RecipePage { slug: string; title: string; default?: boolean; sections: string[]; }
export interface Recipe {
  id: string; label: string; defaultTokens: string; copyBank: string;
  shared: string[]; pages: RecipePage[];
}
export interface CorpusIndex {
  version: string; corpusHash: string;
  blocks: Record<string, Block>;
  tokens: Record<string, TokenPreset>;
  recipes: Record<string, Recipe>;
  copy: Record<string, Record<string, any>>;
  baseCss: string;
  icons: { _viewBox: string; icons: Record<string, string> };
  lexicon: {
    siteTypes: Record<string, { label: string; terms: Record<string, number>; negative?: Record<string, number> }>;
    stacks: Record<Stack, string[]>;
    sections: Record<string, string[]>;
    pages: Record<string, string[]>;
    stopwords: string[];
  };
}

export type ClaimKind = 'type' | 'section' | 'stack' | 'brand' | 'pages' | 'unknown';
export interface Claim { start: number; end: number; kind: ClaimKind; value: string; weight: number; text: string; }

export interface Intent {
  prompt: string;
  siteType: string;
  siteTypeConfidence: number;
  ambiguous: boolean;
  stack: Stack;
  brand: string | null;
  sections: string[];
  claims: Claim[];
  unknown: string[];
}

export interface ResolvedPage { slug: string; title: string; sections: string[]; variants: Record<string, string>; }
export interface Plan {
  intent: Intent;
  recipe: Recipe;
  tokens: TokenPreset;
  pages: ResolvedPage[];
  blocks: string[];
  seed: number;
}
