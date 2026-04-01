/**
 * Catalog sidebar — browse device catalog from Sentinels Core API.
 * Shows CatalogItems grouped by category with definitions.
 */

import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { listCatalogItems, listDefinitions, CATEGORY_CONFIG } from 'app/lib/core-api';
import type { CoreCatalogItem, CoreDefinition } from 'app/lib/core-api/types';
import {
  catalogSidebarOpenAtom,
  catalogCategoryFilterAtom
} from 'state/core';

export function CatalogSidebar() {
  const [isOpen, setIsOpen] = useAtom(catalogSidebarOpenAtom);
  const [categoryFilter, setCategoryFilter] = useAtom(catalogCategoryFilterAtom);
  const [items, setItems] = useState<CoreCatalogItem[]>([]);
  const [definitions, setDefinitions] = useState<CoreDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      listCatalogItems(categoryFilter || undefined),
      listDefinitions()
    ])
      .then(([catalogItems, defs]) => {
        setItems(catalogItems);
        setDefinitions(defs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, categoryFilter]);

  if (!isOpen) return null;

  const categories = [...new Set(items.map((item) => item.category))].sort();

  const filteredItems = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const defsMap = new Map<string, CoreDefinition[]>();
  for (const def of definitions) {
    const list = defsMap.get(def.catalog_item) || [];
    list.push(def);
    defsMap.set(def.catalog_item, list);
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-gray-900">Device Catalog</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm
                     focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Category filter */}
      <div className="px-4 py-2 border-b border-gray-100 flex gap-1 flex-wrap">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`text-xs px-2 py-1 rounded-full transition-colors ${
            !categoryFilter
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const config = CATEGORY_CONFIG[cat] || {
            label: cat,
            color: '#6B7280'
          };
          return (
            <button
              key={cat}
              onClick={() =>
                setCategoryFilter(categoryFilter === cat ? null : cat)
              }
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                categoryFilter === cat
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Loading catalog...
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No devices found
          </div>
        )}

        {!loading &&
          filteredItems.map((item) => {
            const config = CATEGORY_CONFIG[item.category] || {
              label: item.category,
              color: '#6B7280',
              icon: '?'
            };
            const itemDefs = defsMap.get(item.id) || [];

            return (
              <div
                key={item.id}
                className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.manufacturer} · {item.sku}
                    </p>
                    {itemDefs.length > 0 && (
                      <div className="mt-1 flex gap-1 flex-wrap">
                        {itemDefs.map((def) => (
                          <span
                            key={def.id}
                            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                          >
                            {def.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
