import React from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';

export default function BottomNav() {
  const location = useLocation();
  const isDict = location.pathname === '/';
  // Note: If your page is actually named "grammar.tsx", change the word below!
  const isGrammar = location.pathname.includes('/grammer'); 

  return (
    <>
      <style>{`
        .mobile-bottom-nav {
          display: none;
        }
        
        /* Only show on mobile screens */
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(24px) saturate(150%);
            -webkit-backdrop-filter: blur(24px) saturate(150%);
            border-top: 1px solid rgba(0, 0, 0, 0.05); /* Crisp edge */
            border-top-left-radius: 28px;
            border-top-right-radius: 28px;
            box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.04);
            justify-content: space-around;
            align-items: center;
            height: 85px;
            padding-bottom: 15px; /* iOS Safe area */
          }

          .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none !important;
            color: #94a3b8; /* Premium muted gray */
            padding: 8px 16px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Apple-style bounce */
            height: 64px;
            min-width: 72px;
            position: relative;
            z-index: 1;
          }

          .nav-item:active {
            transform: scale(0.85);
          }

          /* The Icon Setup */
          .nav-icon {
            font-size: 26px;
            margin-bottom: 4px;
            /* Default to Outlined */
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            transition: all 0.3s ease;
          }

          .nav-text {
            font-size: 0.7rem;
            font-weight: 700;
            font-family: 'Manrope', sans-serif;
            letter-spacing: 0.2px;
            transition: all 0.3s ease;
          }

          /* --- ACTIVE STATE UI --- */
          .nav-item.active {
            color: var(--ifm-color-primary);
          }

          /* Fills in the icon when active */
          .nav-item.active .nav-icon {
            font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
            transform: translateY(-2px);
          }

          /* Soft background pill behind the active icon */
          .nav-item.active::before {
            content: '';
            position: absolute;
            top: 4px;
            width: 48px;
            height: 32px;
            background: var(--ifm-color-primary);
            opacity: 0.1;
            border-radius: 16px;
            z-index: -1;
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }

          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 0.15; }
          }
        }

        /* --- DARK MODE SUPPORT --- */
        [data-theme='dark'] .mobile-bottom-nav {
          background: rgba(15, 23, 42, 0.75);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
        }
        
        [data-theme='dark'] .nav-item {
          color: #64748b;
        }

        [data-theme='dark'] .nav-item.active::before {
          opacity: 0.2; /* Slightly brighter pill in dark mode */
        }
      `}</style>

      <nav className="mobile-bottom-nav">
        <Link to="/" className={`nav-item ${isDict ? 'active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">search</span>
          <span className="nav-text">Толь бичиг</span>
        </Link>
        
        <Link to="/grammer" className={`nav-item ${isGrammar ? 'active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">book</span>
          <span className="nav-text">Дүрэм</span>
        </Link>
      </nav>
    </>
  );
}