import React, { useMemo } from 'react';

interface WordEntry {
  word: string;
  translation: string;
  hanja?: string | null;
  pos?: string;
  cefr?: string;
}

type SortMode = 'alpha' | 'cefr' | 'pos';

interface Props {
  results: WordEntry[];
  sort: SortMode;
  setSort: (s: SortMode) => void;
  onSelect: (w: WordEntry) => void;
}

export default function DictionarySidebar({ results, sort, setSort, onSelect }: Props) {
  const grouped = useMemo(() => {
    // Determine sort language: check if results start with Mongolian Cyrillic
    const isMN = results.length > 0 && /[а-яөү]/i.test(results[0].translation.charAt(0));

    const sortFn = (a: WordEntry, b: WordEntry) => {
      const fieldA = isMN ? a.translation : a.word;
      const fieldB = isMN ? b.translation : b.word;
      return fieldA.localeCompare(fieldB, isMN ? 'mn' : 'ko');
    };

    if (sort === 'alpha') {
      return { list: [...results].sort(sortFn) };
    }

    const map: Record<string, WordEntry[]> = {};
    results.forEach((r) => {
      const key = sort === 'cefr' ? (r.cefr || 'Other') : (r.pos || 'Other');
      (map[key] = map[key] || []).push(r);
    });

    Object.keys(map).forEach(k => map[k].sort(sortFn));
    return { groups: map };
  }, [results, sort]);

  return (
    <div className="card shadow--md" style={{ position: 'sticky', top: '100px' }}>
      <div className="card__header">
        <strong>Filter & Sort</strong>
        <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
          {(['alpha', 'cefr', 'pos'] as SortMode[]).map(mode => (
            <button 
              key={mode}
              onClick={() => setSort(mode)}
              className={`button button--sm ${sort === mode ? 'button--primary' : 'button--secondary'}`}
              style={{ flex: 1, padding: '4px' }}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="card__body" style={{ maxHeight: '450px', overflowY: 'auto', padding: '10px' }}>
        {grouped.list && grouped.list.map((r, i) => (
          <div key={i} onClick={() => onSelect(r)} style={{ cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
            <strong>{r.word}</strong> <br/> <small>{r.translation}</small>
          </div>
        ))}
        {grouped.groups && Object.entries(grouped.groups).map(([name, items]) => (
          <div key={name} style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', borderBottom: '2px solid var(--ifm-color-primary)', marginBottom: '4px' }}>{name}</div>
            {items.map((r, i) => (
              <div key={i} onClick={() => onSelect(r)} style={{ cursor: 'pointer', padding: '4px 0', fontSize: '0.8rem' }}>
                {r.word}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}