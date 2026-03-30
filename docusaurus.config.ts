import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'kooOKIE',
  tagline: 'KO-MGL words',
  favicon: 'img/logo.png',
  url: 'https://BinaryBoortsog.github.io',
  baseUrl: '/Dictionary-/',
  organizationName: 'BinaryBoortsog',
  projectName: 'Dictionary-',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  deploymentBranch: 'gh-pages',
  trailingSlash: false, // Remove trailing slash from URLs

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },
  plugins: [
    [
      '@docusaurus/plugin-pwa',
      {
        debug: true,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: '/img/logo.png',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/manifest.json', // We will create this next
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: '#004777', // kooOKIE blue
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-capable',
            content: 'yes',
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-status-bar-style',
            content: '#004777',
          },
        ],
      },
    ],
  ],

  // Include third-party scripts (GitHub Buttons)
  scripts: [
    {
      src: 'https://buttons.github.io/buttons.js',
      async: true,
      defer: true,
    },
  ],



  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'My Site',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tutorial',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/facebook/docusaurus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Repository',
          items: [
            {
              // enhanced footer profile block (avatar, username, actions)
              html: `
                <div class="footer-profile">
                  <a href="https://github.com/BinaryBoortsog" target="_blank" rel="noopener noreferrer" class="footer-profile-link">
                    <img src="https://github.com/BinaryBoortsog.png" alt="BinaryBoortsog" class="footer-avatar" />
                    <div class="footer-username-wrap">
                      <div class="footer-username">BinaryBoortsog</div>
                      <div class="footer-sub">Creator · Maintainer</div>
                      <p class="footer-desc">Энэхүү толь нь Солонгос–Монгол хэлний үгсийн хайлт хийхэд зориулагдсан. Үг эсвэл орчуулгыг оруулан хайхад холбогдох тайлбар, ангилал, CEFR түвшинг харна.</p>
                    </div>
                  </a>
                  <div class="footer-actions">
                    <a href="https://github.com/BinaryBoortsog/Dictionary-" class="footer-btn" target="_blank" rel="noopener noreferrer">View Repo</a>
                    <a href="https://github.com/BinaryBoortsog/Dictionary-/stargazers" class="footer-btn footer-btn--ghost" target="_blank" rel="noopener noreferrer">Star</a>
                  </div>
                </div>
              `,
            },
            {
              label: 'Repository: BinaryBoortsog/Dictionary-',
              href: 'https://github.com/BinaryBoortsog/Dictionary-',
            },
            {
              label: 'Stargazers',
              href: 'https://github.com/BinaryBoortsog/Dictionary-/stargazers',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} BinaryBoortsog.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
