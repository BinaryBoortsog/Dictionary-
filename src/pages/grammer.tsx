
import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface GrammarItem {
  grammar_point: string;
  meaning_mn?: string;
  usage_mn?: string;
  example_ko?: string;
  example_mn?: string;
  number?: number;
}

export default function GrammarPage(): JSX.Element {
  const [items, setItems] = useState<GrammarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const dataUrl = useBaseUrl('/data/grammer/topik1.json');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(dataUrl);
        const json = await res.json();
        if (mounted) setItems(json || []);
      } catch (e) {
        console.error('Failed to load grammar data', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [dataUrl]);

  const filtered = items.filter((it) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (it.grammar_point || '').toLowerCase().includes(s) || (it.meaning_mn || '').toLowerCase().includes(s) || (it.example_ko || '').toLowerCase().includes(s);
  });

  return (
    <Layout title="TOPIK 1 Grammar | kooOKIE">
      <main className="container margin-vert--lg">
        <style>{`
          .grammar-wrap { max-width: 980px; margin: 0 auto; }
          .grammar-search { margin-bottom: 18px; }
          .grammar-grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 14px }
          .grammar-card { background: var(--ifm-color-emphasis-0); border-radius: 10px; padding: 16px; box-shadow: 0 8px 24px rgba(2,6,23,0.06); border: 1px solid rgba(0,0,0,0.04) }
          .grammar-point { font-weight:800; color: var(--ifm-color-primary); font-size:1.05rem }
          .grammar-meaning { color: rgba(2,6,23,0.75); margin-top:6px }
          .example { margin-top:12px; color:#374151 }
          @media (max-width:768px){ .grammar-wrap{padding:0 12px} }
        `}</style>

        <div className="grammar-wrap">
          <h1 style={{marginBottom:6}}>📚 TOPIK 1 Дүрэм</h1>
          <div className="grammar-search">
            <input className="custom-input" placeholder="Хайх (예: 이/가)" value={q} onChange={(e)=>setQ(e.target.value)} style={{maxWidth:420}} />
          </div>

          {loading ? (
            <p>Loading grammar...</p>
          ) : (
            <div className="grammar-grid">
              {filtered.map((it, i) => (
                <div key={i} className="grammar-card">
                  <div className="grammar-point">{it.grammar_point}{it.number ? <span style={{fontWeight:600, fontSize:'.8rem', marginLeft:8}}>#{it.number}</span> : null}</div>
                  <div className="grammar-meaning">{it.meaning_mn}</div>
                  {it.usage_mn && <div style={{marginTop:8}}><strong>Тайлбар:</strong> {it.usage_mn}</div>}
                  <div className="example"><strong>🇰🇷</strong> {it.example_ko}<br/><small style={{color:'#6b7280'}}>{it.example_mn}</small></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}