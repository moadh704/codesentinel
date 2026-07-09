import { ref } from 'vue';
import { createHighlighter } from 'shiki';

let highlighter = null;

export async function useCodeHighlight() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'python', 'php', 'go', 'java', 'ruby', 'c', 'cpp'],
    });
  }

  const highlightCode = (code, language) => {
    if (!code) return '';
    
    const langMap = {
      'JavaScript': 'javascript',
      'TypeScript': 'typescript',
      'Python': 'python',
      'PHP': 'php',
      'Go': 'go',
      'Java': 'java',
      'Ruby': 'ruby',
      'C/C++': 'c',
      'C++': 'cpp',
    };

    const shikiLang = langMap[language] || 'javascript';

    try {
      return highlighter.codeToHtml(code, {
        lang: shikiLang,
        theme: 'github-dark',
      });
    } catch (e) {
      return `<pre><code>${code}</code></pre>`;
    }
  };

  return {
    highlightCode,
  };
}