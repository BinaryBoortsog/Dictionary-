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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
      setErrorMsg(null);
      try {
        const firstChar = cleanQuery.charAt(0);
        const isMongolian = /[а-яөү]/i.test(firstChar);
        
        let fileName = isMongolian ? `mn_${firstChar}` : 
          (/[\/\?<>\\:\*\|":]/g.test(firstChar) ? 'special_symbols' : firstChar);

        // Try multiple candidate shard filenames (handle encoding and mn_ prefix)
        const tried: string[] = [];
        const candidates = [] as string[];
        if (isMongolian) {
          candidates.push(`mn_${firstChar}`);
          candidates.push(`mn_${encodeURIComponent(firstChar)}`);
        } else {
          candidates.push(fileName);
          candidates.push(encodeURIComponent(fileName));
          candidates.push('special_symbols');
        }

        let response: Response | null = null;
        let usedCandidate = '';
        for (const cand of candidates) {
          const tryUrl = `/data/${cand}.json`;
          tried.push(tryUrl);
          try {
            console.debug('Attempting fetch', tryUrl);
            const res = await fetch(tryUrl);
            if (res.ok) {
              response = res;
              usedCandidate = cand;
              break;
            } else {
              console.debug('Fetch not ok for', tryUrl, res.status);
            }
          } catch (e) {
            console.debug('Fetch error for', tryUrl, e);
          }
        }

        if (!response) {
          console.warn('All shard fetch attempts failed', tried);
          setResults([]);
          setErrorMsg(`No shard available for "${firstChar}". Tried: ${tried.join(', ')}`);
          return;
        }

        console.debug('Using shard candidate', usedCandidate);
        const data: WordEntry[] = await response.json();
        console.debug('Shard loaded:', Array.isArray(data) ? data.length : typeof data);
        const filtered = data
          .filter((item) => 
            item.word.toLowerCase().includes(cleanQuery) || 
            item.translation.toLowerCase().includes(cleanQuery)
          )
          .slice(0, 60);

        setResults(filtered);
        if (filtered.length === 0) {
          setErrorMsg('No matching entries found in shard.');
        }
      } catch (err) {
        console.error('Search error', err);
        setResults([]);
        setErrorMsg(String(err));
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBucket, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

 return (
    <Layout title="kooOKIE Dictionary">
      <style>{`
        /* 1. Header Layout */
        .hero-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 2rem 1rem;
        }

        .logo-title-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0;
          line-height: 1;
        }

        /* 2. Search Input */
        .search-wrapper {
          width: 100%;
          max-width: 600px;
        }

        .custom-input {
          width: 100%;
          padding: 14px 25px;
          font-size: 1.1rem;
          border-radius: 50px;
          border: 2px solid var(--ifm-color-primary);
          outline: none;
          box-shadow: var(--ifm-global-shadow-md);
        }

        /* 3. Mobile Specific Fixes */
        @media (max-width: 768px) {
          .hero-container { padding: 1rem 0.5rem; gap: 15px; }
          
          .logo-title-row { 
            flex-direction: column; /* Stack logo on top of text */
            gap: 5px; 
          }

          .hero-title { font-size: 2.5rem !important; }
          .hero-logo { width: 50px !important; height: 50px !important; }

          .sidebar-column { order: 2; margin-top: 2rem; }
          .results-column { order: 1; }
        }
      `}</style>

      <main className="container margin-vert--lg">
        {/* NEW CLEAN HEADER STRUCTURE */}
        <div className="hero-container">
          <div className="logo-title-row">
            <img 
              src="img/logo.png" 
              alt="logo" 
              className="hero-logo" 
              style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'contain' }} 
            />
            <h1 className="hero-title">
              <span style={{ color: '#004777' }}>koo</span>
              <span style={{ color: '#ef4444' }}>OKIE</span>
            </h1>
          </div>

          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Type Korean or Mongolian..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="custom-input"
            />
            {loading && <div style={{ marginTop: 8, color: 'var(--ifm-color-primary)' }}>Searching…</div>}
            {errorMsg && <div style={{ marginTop: 8, color: '#b91c1c' }}>{errorMsg}</div>}
          </div>
        </div>

        <div className="row">
          {/* Results column */}
          <section className="col col--9 results-column">
            {selected ? (
              <div className="card shadow--md" style={{ borderLeft: '10px solid var(--ifm-color-primary)', position: 'sticky', top: '20px' }}>
                <div className="card__body">
                  <button onClick={() => setSelected(null)} style={{ float: 'right', border: 'none', background: 'none', fontSize: '2rem', cursor: 'pointer', padding: '0 10px' }}>×</button>
                  <h2 style={{ fontSize: '2.2rem', marginBottom: '0' }}>{selected.word}</h2>
                  <p style={{ fontSize: '1rem', color: 'gray' }}>{selected.hanja || 'No Hanja'}</p>
                  <h3 style={{ color: 'var(--ifm-color-primary)', fontSize: '1.8rem' }}>{selected.translation}</h3>
                  <hr />
                  <div className="row">
                    <div className="col col--6"><strong>Part of Speech:</strong> {selected.pos}</div>
                    <div className="col col--6"><strong>Level:</strong> <span className="badge badge--info">{selected.cefr}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row">
                {results.length > 0 ? (
                  results.map((r, i) => (
                    <div key={i} className="col col--6 col--md-4 margin-bottom--md">
                      <div className="card shadow--sm word-card" 
                           onClick={() => { setSelected(r); window.scrollTo({ top: 150, behavior: 'smooth' }); }}
                           style={{ cursor: 'pointer', height: '100%', padding: '4px' }}>
                        <div className="card__body" style={{ padding: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                            <strong style={{ fontSize: '1.1rem' }}>{r.word}</strong>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {r.pos && <span className="badge badge--info">{r.pos}</span>}
                              {r.cefr && <span className="badge badge--secondary">{r.cefr}</span>}
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>{r.translation}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  query && !loading && (
                    <div className="col text--center">No results found for "{query}".</div>
                  )
                )}
              </div>
            )}
          </section>

          {/* Sidebar column */}
          <aside className="col col--3 sidebar-column">
            <DictionarySidebar 
              results={results} 
              sort={sort} 
              setSort={setSort} 
              onSelect={(w) => { setSelected(w); window.scrollTo({ top: 150, behavior: 'smooth' }); }} 
            />
          </aside>
        </div>
      </main>
    </Layout>
  );
}