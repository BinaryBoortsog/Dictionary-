import React, { useMemo } from 'react';

interface DictionaryItem {
  word: string;
  translation: string;
  cefr?: string;
  pos?: string;
}

interface DictionarySidebarProps {
  results: DictionaryItem[];
  sort: string;
  setSort: (sort: string) => void;
  onSelect: (item: DictionaryItem) => void;
}

export default function DictionarySidebar({ results, sort, setSort, onSelect }: DictionarySidebarProps) {
  const grouped = useMemo(() => {
    const isMN = results.length > 0 && /[а-яөү]/i.test(results[0].translation.charAt(0));
    const sortFn = (a, b) => (isMN ? a.translation : a.word).localeCompare(isMN ? b.translation : b.word, isMN ? 'mn' : 'ko');

    if (sort === 'alpha') return { list: [...results].sort(sortFn) };

    const map: { [key: string]: DictionaryItem[] } = {};
    results.forEach(r => {
      const key = sort === 'cefr' ? (r.cefr || 'Unknown') : (r.pos || 'Other');
      (map[key] = map[key] || []).push(r);
    });
    Object.keys(map).forEach(k => map[k].sort(sortFn));
    return { groups: map };
  }, [results, sort]);

  return (
    <div className="card shadow--md" style={{ position: 'sticky', top: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
      <div className="card__header"><strong>Sort & Filter</strong></div>
      <div className="card__body" style={{ padding: '10px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
          {['alpha', 'cefr', 'pos'].map(m => (
            <button 
              key={m} 
              className={`button button--sm ${sort === m ? 'button--primary' : 'button--secondary'}`}
              style={{ flex: 1, padding: '12px 4px', fontSize: '0.7rem' }} 
              onClick={() => setSort(m as any)}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        
        {grouped.list?.map((r, i) => (
          <div key={i} onClick={() => onSelect(r)} style={{ cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
            {r.word}
          </div>
        ))}

        {grouped.groups && Object.entries(grouped.groups).map(([name, items]) => (
          <div key={name} style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--ifm-color-primary)' }}>{name} ({items.length})</div>
            {items.map((r, i) => (
              <div key={i} onClick={() => onSelect(r)} style={{ cursor: 'pointer', padding: '6px 0', fontSize: '0.85rem' }}>
                {r.word}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}