import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import DictionarySidebar from '@site/src/components/DictionarySidebar';

interface WordEntry {
  word: string;
  translation: string;
  hanja?: string | null;
  pos?: string;
  cefr?: string;
}

export default function DictionaryPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<'alpha' | 'cefr' | 'pos'>('alpha');
  const [selected, setSelected] = useState<WordEntry | null>(null);

  useEffect(() => {
    const fetchBucket = async () => {
      const cleanQuery = query.trim().toLowerCase();
      if (cleanQuery.length === 0) {
        setResults([]);
        setSelected(null);
        return;
      }

      setLoading(true);
      try {
        const firstChar = cleanQuery.charAt(0);
        const isMongolian = /[а-яөү]/i.test(firstChar);
        
        // 1. Determine the exact shard name
        let fileName = '';
        if (isMongolian) {
          fileName = `mn_${firstChar}`;
        } else {
          const illegalRe = /[\/\?<>\\:\*\|":]/g;
          fileName = illegalRe.test(firstChar) ? 'special_symbols' : firstChar;
        }

        // 2. Fetch from /static/data/ (sharded storage)
        const response = await fetch(`/data/${fileName}.json`);
        if (!response.ok) {
          setResults([]);
          return;
        }

        const data: WordEntry[] = await response.json();

        // 3. Filter bucket (includes both directions for better UX)
        const filtered = data
          .filter((item) => {
            const kMatch = item.word.toLowerCase().includes(cleanQuery);
            const mMatch = item.translation.toLowerCase().includes(cleanQuery);
            return kMatch || mMatch;
          })
          .slice(0, 80); // Higher limit for sidebar scrolling

        setResults(filtered);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBucket, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <Layout title="kooOKIE Dictionary">
      <main className="container margin-vert--xl">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>
            <span style={{ color: '#004777' }}>koo</span>
            <span style={{ color: '#ef4444' }}>OKIE</span>
          </h1>
          <input
            type="text"
            placeholder="Type Korean or Mongolian..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', maxWidth: '600px', padding: '15px 25px',
              fontSize: '1.2rem', borderRadius: '50px',
              border: '2px solid var(--ifm-color-primary)', outline: 'none'
            }}
          />
        </div>

        <div className="row" style={{ alignItems: 'flex-start' }}>
          <aside className="col col--3">
            <DictionarySidebar 
              results={results} 
              sort={sort} 
              setSort={setSort} 
              onSelect={(w) => {
                setSelected(w);
                window.scrollTo({ top: 150, behavior: 'smooth' });
              }} 
            />
          </aside>

          <section className="col col--9">
            {selected ? (
              <div className="card shadow--md" style={{ borderLeft: '8px solid var(--ifm-color-primary)' }}>
                <div className="card__body">
                  <button onClick={() => setSelected(null)} style={{ float: 'right', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                  <h2 style={{ fontSize: '2.5rem' }}>{selected.word} <small>({selected.hanja || 'N/A'})</small></h2>
                  <h3 style={{ color: 'var(--ifm-color-primary)' }}>{selected.translation}</h3>
                  <hr />
                  <div className="row">
                    <div className="col col--6">
                      <p><strong>POS:</strong> {selected.pos}</p>
                    </div>
                    <div className="col col--6">
                      <p><strong>Level:</strong> <span className="badge badge--info">{selected.cefr}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row">
                {results.length > 0 ? (
                  results.map((r, i) => (
                    <div key={i} className="col col--4 margin-bottom--md">
                      <div className="card shadow--sm" onClick={() => setSelected(r)} style={{ cursor: 'pointer', height: '100%' }}>
                        <div className="card__body">
                          <strong>{r.word}</strong>
                          <p style={{ fontSize: '0.9rem', margin: 0 }}>{r.translation}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : query && !loading && (
                  <div className="col text--center">No results found in shards.</div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}