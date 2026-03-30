import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import DictionarySidebar from '@site/src/components/DictionarySidebar';
import useBaseUrl from '@docusaurus/useBaseUrl';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sort, setSort] = useState<'alpha' | 'cefr' | 'pos'>('alpha');
  const [selected, setSelected] = useState<WordEntry | null>(null);

  // This hook automatically prepends '/Dictionary-/' when deployed
  const dataBaseUrl = useBaseUrl('/data/');
  const logoUrl = useBaseUrl('/img/logo.png');

  useEffect(() => {
    const fetchBucket = async () => {
      const cleanQuery = query.trim().toLowerCase();
      if (cleanQuery.length === 0) {
        setResults([]);
        setSelected(null);
        return;
      }

      setLoading(true);
      setErrorMsg(null);
      try {
        const firstChar = cleanQuery.charAt(0);
        const isMongolian = /[а-яөү]/i.test(firstChar);
        
        let fileName = isMongolian ? `mn_${firstChar}` : 
          (/[\/\?<>\\:\*\|":]/g.test(firstChar) ? 'special_symbols' : firstChar);

        // Logic to handle encoding for special characters (Korean/Cyrillic)
        const candidates: string[] = [];
        candidates.push(fileName);
        if (fileName !== encodeURIComponent(fileName)) {
          candidates.push(encodeURIComponent(fileName));
        }

        let response: Response | null = null;
        let successfulUrl = '';

        for (const cand of candidates) {
          const tryUrl = `${dataBaseUrl}${cand}.json`;
          try {
            const res = await fetch(tryUrl);
            if (res.ok) {
              const contentType = res.headers.get('content-type') || '';
              // Verify we actually got JSON and not the 404 HTML page
              if (contentType.includes('application/json')) {
                response = res;
                successfulUrl = tryUrl;
                break;
              }
            }
          } catch (e) {
            console.error('Fetch attempt failed', e);
          }
        }

        if (!response) {
          setResults([]);
          setErrorMsg(`Could not find data for "${firstChar}". Please check if shards exist in /static/data/`);
          return;
        }

        const data: WordEntry[] = await response.json();
        const filtered = data
          .filter((item) => 
            item.word.toLowerCase().includes(cleanQuery) || 
            item.translation.toLowerCase().includes(cleanQuery)
          )
          .slice(0, 60);

        setResults(filtered);
        if (filtered.length === 0) setErrorMsg('No matches in this shard.');
        
      } catch (err) {
        console.error('Search error', err);
        setErrorMsg('Error parsing dictionary data.');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBucket, 300);
    return () => clearTimeout(timeoutId);
  }, [query, dataBaseUrl]);

  return (
    <Layout title="kooOKIE Dictionary">
      <style>{`
        .hero-container { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 2rem 1rem; }
        .logo-title-row { display: flex; align-items: center; justify-content: center; gap: 15px; }
        .hero-title { font-size: 3.5rem; font-weight: 800; margin: 0; line-height: 1; }
        .custom-input { width: 100%; max-width: 600px; padding: 14px 25px; font-size: 1.1rem; border-radius: 50px; border: 2px solid var(--ifm-color-primary); outline: none; box-shadow: var(--ifm-global-shadow-md); }
        @media (max-width: 768px) {
          .logo-title-row { flex-direction: column; gap: 5px; }
          .hero-title { font-size: 2.5rem !important; }
          .sidebar-column { order: 2; margin-top: 2rem; }
          .results-column { order: 1; }
        }
      `}</style>

      <main className="container margin-vert--lg">
        <div className="hero-container">
          <div className="logo-title-row">
            <img src={logoUrl} alt="logo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'contain' }} />
            <h1 className="hero-title">
              <span style={{ color: '#004777' }}>koo</span>
              <span style={{ color: '#ef4444' }}>OKIE</span>
            </h1>
          </div>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <input
              type="text"
              placeholder="Search Korean or Mongolian..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="custom-input"
            />
            {loading && <div style={{ marginTop: 8, color: 'var(--ifm-color-primary)' }}>Searching shards...</div>}
            {errorMsg && <div style={{ marginTop: 8, color: '#b91c1c', fontSize: '0.9rem' }}>{errorMsg}</div>}
          </div>
        </div>

        <div className="row">
          <section className="col col--9 results-column">
            {selected ? (
              <div className="card shadow--md" style={{ borderLeft: '10px solid var(--ifm-color-primary)', position: 'sticky', top: '20px' }}>
                <div className="card__body">
                  <button onClick={() => setSelected(null)} style={{ float: 'right', border: 'none', background: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
                  <h2 style={{ fontSize: '2.2rem', marginBottom: '0' }}>{selected.word}</h2>
                  <p style={{ color: 'gray' }}>{selected.hanja || 'No Hanja'}</p>
                  <h3 style={{ color: 'var(--ifm-color-primary)' }}>{selected.translation}</h3>
                  <hr />
                  <div className="row">
                    <div className="col col--6"><strong>POS:</strong> {selected.pos}</div>
                    <div className="col col--6"><strong>Level:</strong> <span className="badge badge--info">{selected.cefr}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row">
                {results.map((r, i) => (
                  <div key={i} className="col col--6 col--md-4 margin-bottom--md">
                    <div className="card shadow--sm" onClick={() => { setSelected(r); window.scrollTo({ top: 150, behavior: 'smooth' }); }} style={{ cursor: 'pointer', height: '100%' }}>
                      <div className="card__body">
                        <strong>{r.word}</strong>
                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>{r.translation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="col col--3 sidebar-column">
            <DictionarySidebar results={results} sort={sort} setSort={setSort} onSelect={(w) => { setSelected(w); window.scrollTo({ top: 150, behavior: 'smooth' }); }} />
          </aside>
        </div>
      </main>
    </Layout>
  );
}