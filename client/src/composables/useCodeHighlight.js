import { createHighlighter } from 'shiki';

let highlighterPromise = null;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plainFallback(code) {
  return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
}

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'python', 'php', 'go', 'java', 'ruby', 'c', 'cpp'],
    }).catch((err) => {
      console.error('[shiki] failed to init highlighter', err);
      highlighterPromise = null;
      throw err;
    });
  }
  return highlighterPromise;
}

const langMap = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  PHP: 'php',
  Go: 'go',
  Java: 'java',
  Ruby: 'ruby',
  'C/C++': 'c',
  'C++': 'cpp',
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
};

/**
 * Safe highlighter — never throws. Falls back to escaped plain text.
 */
export async function highlightCode(code, language = 'JavaScript') {
  if (!code) return '';

  try {
    const highlighter = await getHighlighter();
    const shikiLang = langMap[language] || langMap[String(language).toLowerCase()] || 'javascript';
    return highlighter.codeToHtml(String(code), {
      lang: shikiLang,
      theme: 'github-dark',
    });
  } catch (e) {
    console.warn('[shiki] highlight failed, using plain text', e?.message || e);
    return plainFallback(code);
  }
}

/** Sync-style API kept for older callers; returns a Promise. */
export async function useCodeHighlight() {
  return { highlightCode };
}
