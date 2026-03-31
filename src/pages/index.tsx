import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import DictionarySidebar from '@site/src/components/DictionarySidebar';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BottomNav from '@site/src/components/BottomNav';

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
        :root { --card-bg: var(--ifm-color-emphasis-0); }
        .hero-container { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 3rem 1rem; }
        .logo-title-row { display: flex; align-items: center; justify-content: center; gap: 18px; }
        .hero-title { font-size: 3.2rem; font-weight: 900; margin: 0; line-height: 1; letter-spacing: -1px }
        .custom-input { width: 100%; max-width: 680px; padding: 14px 20px 14px 48px; font-size: 1.05rem; border-radius: 999px; border: 1px solid rgba(0,0,0,0.08); outline: none; box-shadow: 0 6px 20px rgba(2,6,23,0.08); transition: box-shadow .18s ease, transform .08s ease; background: #fff; }
        .search-wrap { position: relative; }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 20px }
        .custom-input:focus { box-shadow: 0 10px 30px rgba(2,6,23,0.12); transform: translateY(-1px) }

        /* Desktop minimum height */
        .dictionary-main { min-height: calc(100vh - 200px); }

        .card.shadow--sm { border-radius: 12px; overflow: hidden; }
        .card__body { padding: 14px 16px; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .result-card { background: var(--card-bg); border: 1px solid rgba(0,0,0,0.04); border-radius: 12px; transition: transform .12s ease, box-shadow .12s ease; height:100%; display:flex; align-items:flex-start }
        .result-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(2,6,23,0.08) }
        .result-body { padding: 14px; }
        .result-word { font-weight: 800; font-size: 1.05rem; display:block }
        .result-translation { margin-top:6px; color: rgba(2,6,23,0.7); font-size:0.9rem }
        .badge-small { display:inline-block; padding:4px 8px; border-radius:999px; font-size:0.7rem; background: rgba(2,6,23,0.06); color: var(--ifm-color-primary); margin-left:8px }

        @media (max-width: 768px) {
          .logo-title-row { flex-direction: column; gap: 5px; }
          .hero-title { font-size: 2.4rem !important; }
          .sidebar-column { order: 2; margin-top: 1.25rem; }
          .results-column { order: 1; }

          /* Prevent results from hiding under the bottom navbar */
          .dictionary-main { padding-bottom: 120px !important; }
        }
      `}</style>

      <main className="container margin-vert--lg dictionary-main">
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
                <div className="results-grid">
                  {results.map((r, i) => (
                    <div key={i} className="result-card" role="button" onClick={() => { setSelected(r); window.scrollTo({ top: 150, behavior: 'smooth' }); }}>
                      <div className="result-body">
                        <span className="result-word">{r.word} <span className="badge-small">{r.pos || ''}</span></span>
                        <span className="result-translation">{r.translation} {r.cefr ? <span className="badge-small">{r.cefr}</span> : null}</span>
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

      {/* Renders the App-like Navbar at the bottom on Mobile devices */}
      <BottomNav />
    </Layout>
  );
}