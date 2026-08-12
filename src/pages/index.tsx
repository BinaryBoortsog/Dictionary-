import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Direction = 'ko-mn' | 'mn-ko';

const clinicalExamples = [
  {
    korean: '오늘 복용한 약이 있습니까?',
    mongolian: 'Та өнөөдөр ямар нэгэн эм уусан уу?',
    risk: 'Medication',
  },
  {
    korean: '알레르기가 있습니까?',
    mongolian: 'Танд харшил байдаг уу?',
    risk: 'Allergy',
  },
  {
    korean: '통증이 있으면 바로 알려 주세요.',
    mongolian: 'Өвдөж байвал нэн даруй мэдэгдээрэй.',
    risk: 'General',
  },
];

const highRiskTerms = ['약', '복용', '알레르기', '수술', '동의', '응급', '용량', 'medication', 'allergy', 'surgery', 'emergency'];

export default function ClinicalTranslatorPage() {
  const [direction, setDirection] = useState<Direction>('ko-mn');
  const [input, setInput] = useState('오늘 복용한 약이 있습니까?');
  const [translated, setTranslated] = useState(clinicalExamples[0].mongolian);
  const [isDemo, setIsDemo] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const dataBaseUrl = useBaseUrl('/data/');

  const highRisk = useMemo(
    () => highRiskTerms.some((term) => input.toLowerCase().includes(term.toLowerCase())),
    [input],
  );

  const translate = async () => {
    if (!input.trim()) return;
    setIsTranslating(true);
    setTranslationError(null);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text: input, direction}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Translation failed.');
      setTranslated(result.translation);
      setIsDemo(false);
    } catch (error) {
      setTranslationError(error instanceof Error ? error.message : 'Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  const swapDirection = () => {
    setDirection((current) => (current === 'ko-mn' ? 'mn-ko' : 'ko-mn'));
    setInput(translated);
    setTranslated(input);
    setCopied(false);
  };

  const copyTranslation = async () => {
    await navigator.clipboard?.writeText(translated);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Layout title="Clinical Translator | kooOKIE">
      <main className="clinical-page">
        <section className="clinical-hero container">
          <p className="eyebrow">KOREAN ↔ MONGOLIAN · CLINICAL COMMUNICATION</p>
          <h1>Clearer conversations. Safer care.</h1>
          <p className="hero-copy">
            A real-time communication prototype for Korean hospitals and Mongolian-speaking patients.
          </p>
          <div className="prototype-chip"><span aria-hidden="true">●</span> Prototype mode — no patient data is stored</div>
        </section>

        <section className="container translator-shell" aria-label="Clinical translation workspace">
          <div className="direction-bar">
            <span>{direction === 'ko-mn' ? '한국어 · Korean' : 'Монгол · Mongolian'}</span>
            <button className="swap-button" onClick={swapDirection} aria-label="Swap translation languages">⇄</button>
            <span>{direction === 'ko-mn' ? 'Монгол · Mongolian' : '한국어 · Korean'}</span>
          </div>

          <div className="translation-grid">
            <label className="translation-panel input-panel">
              <span className="panel-label">Clinician / patient message</span>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={direction === 'ko-mn' ? '한국어로 입력하세요...' : 'Монголоор бичнэ үү...'}
                aria-label="Text to translate"
              />
              <div className="panel-footer"><span>{input.length} characters</span><button onClick={() => setInput('')}>Clear</button></div>
            </label>

            <div className="translation-panel output-panel" aria-live="polite">
              <span className="panel-label">Translation</span>
              <p>{translated || 'Your translation will appear here.'}</p>
              <div className="panel-footer"><span>{isDemo ? 'Demo response' : 'AI response'}</span><button onClick={copyTranslation}>{copied ? 'Copied' : 'Copy'}</button></div>
            </div>
          </div>

          <div className="action-row">
            <button className="translate-button" onClick={translate} disabled={!input.trim() || isTranslating}>{isTranslating ? 'Translating…' : <>Translate message <span>→</span></>}</button>
            <button className="interpreter-button" type="button">Request human interpreter</button>
          </div>

          {highRisk && (
            <div className="safety-notice" role="alert">
              <strong>Verification recommended.</strong> This message contains a high-risk clinical term. Confirm medication, allergy, consent, procedure, and emergency information with a qualified interpreter or clinician.
            </div>
          )}
          {translationError && <div className="translation-error" role="alert">{translationError}</div>}
        </section>

        <section className="container feature-grid">
          <article><span>01</span><h2>Real-time translation</h2><p>The production version will stream translations through a secure server-side AI connection.</p></article>
          <article><span>02</span><h2>Clinical safeguards</h2><p>High-risk content is visibly flagged and escalated to qualified human interpretation.</p></article>
          <article><span>03</span><h2>Glossary foundation</h2><p>Prepared word data can become a hospital-reviewed Korean–Mongolian terminology layer.</p></article>
        </section>

        <section className="container glossary-note">
          <h2>Dictionary data foundation</h2>
          <p>This prototype will use the existing <code>{dataBaseUrl}</code> word dataset as a controlled glossary—not as a substitute for sentence-level medical translation.</p>
        </section>
      </main>
    </Layout>
  );
}
