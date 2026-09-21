// Prerenders the public marketing routes to static HTML after `vite build`,
// so crawlers that don't execute JavaScript (many AI web-fetch tools included)
// see real page content instead of the empty SPA shell.
//
// Client JS still boots normally afterward and fully replaces this content
// (main.jsx uses ReactDOM.createRoot, not hydrateRoot), so this is purely
// additive for SEO/crawlability and changes nothing about the app's runtime
// behavior for real users.
//
// Run manually with `npm run prerender` AFTER `npm run build`. Not wired into
// the default build command, so a failure here can never break the actual
// site deploy.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');

// A couple of pages (Login) import the auth store, which touches
// localStorage/sessionStorage. Stub both so nothing crashes under plain Node.
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };

const ROUTES = [
  { path: '/', modulePath: '/src/pages/Landing.jsx', outFile: join(distDir, 'index.html') },
  { path: '/faq', modulePath: '/src/pages/FAQ.jsx', outFile: join(distDir, 'faq/index.html') },
  { path: '/register', modulePath: '/src/pages/Register.jsx', outFile: join(distDir, 'register/index.html') },
  { path: '/login', modulePath: '/src/pages/Login.jsx', outFile: join(distDir, 'login/index.html') },
];

const template = readFileSync(join(distDir, 'index.html'), 'utf8');
// Split the built shell purely on the root div's own boundaries, not on the
// entry script tag: Vite's build hoists that script into <head>, so it can't
// be used to find where the body content ends.
const rootOpenTag = '<div id="root">';
const rootOpenIndex = template.indexOf(rootOpenTag);
if (rootOpenIndex === -1) {
  throw new Error('dist/index.html does not look like the expected build output. Run `npm run build` first.');
}
const rootCloseIndex = template.indexOf('</div>', rootOpenIndex);
if (rootCloseIndex === -1) {
  throw new Error('Could not find the closing </div> for #root in dist/index.html.');
}
const head = template.slice(0, rootOpenIndex + rootOpenTag.length);
const tail = template.slice(rootCloseIndex + '</div>'.length);

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });

let failures = 0;
try {
  const { default: PublicPageShell } = await vite.ssrLoadModule('/src/components/layout/PublicPageShell.jsx');

  for (const route of ROUTES) {
    try {
      const { default: Page } = await vite.ssrLoadModule(route.modulePath);
      const markup = renderToStaticMarkup(
        React.createElement(
          MemoryRouter,
          { initialEntries: [route.path] },
          React.createElement(
            Routes,
            null,
            React.createElement(
              Route,
              { element: React.createElement(PublicPageShell) },
              React.createElement(Route, { path: route.path, element: React.createElement(Page) })
            )
          )
        )
      );

      const html = `${head}${markup}</div>\n    ${tail}`;
      mkdirSync(dirname(route.outFile), { recursive: true });
      writeFileSync(route.outFile, html);
      console.log(`prerendered ${route.path} -> ${route.outFile.replace(root + '/', '')}`);
    } catch (err) {
      failures += 1;
      console.error(`FAILED to prerender ${route.path}:`, err.message);
    }
  }
} finally {
  await vite.close();
}

if (failures > 0) {
  console.error(`${failures} route(s) failed to prerender. dist/ still has the working SPA shell for those routes.`);
  process.exit(1);
}
