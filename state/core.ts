/**
 * Core data state — Jotai atoms for Sentinels Core API data.
 */

import { atom } from 'jotai';
import type {
  CoreProject,
  CoreSite,
  CorePlacement,
  CoreCatalogItem,
  CoreDefinition
} from 'app/lib/core-api/types';

/** Currently selected project. */
export const currentProjectAtom = atom<CoreProject | null>(null);

/** Currently selected site. */
export const currentSiteAtom = atom<CoreSite | null>(null);

/** List of projects from Core API. */
export const projectsAtom = atom<CoreProject[]>([]);

/** Sites for the current project. */
export const sitesAtom = atom<CoreSite[]>([]);

/** Placements for the current site. */
export const placementsAtom = atom<CorePlacement[]>([]);

/** Catalog items from Core API. */
export const catalogItemsAtom = atom<CoreCatalogItem[]>([]);

/** Device definitions from Core API. */
export const definitionsAtom = atom<CoreDefinition[]>([]);

/** Loading state for Core data operations. */
export const coreLoadingAtom = atom<boolean>(false);

/** Catalog sidebar open/closed state. */
export const catalogSidebarOpenAtom = atom<boolean>(false);

/** Selected catalog category filter. */
export const catalogCategoryFilterAtom = atom<string | null>(null);
