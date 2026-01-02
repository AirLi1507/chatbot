import markedKatex from "marked-katex-extension";
import { marked } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';
import DOMPurify from "dompurify";

let highlighter: Highlighter

const highlighterPromise = createHighlighter({
  themes: ['catppuccin-mocha'],
  langs: [
    "html",
    "css",
    "scss",
    "sass",
    "javascript",
    "js",
    "jsx",
    "typescript",
    "ts",
    "tsx",
    "vue",
    "vue-html",
    "svelte",
    "astro",
    "angular-html",
    "angular-ts",
    "python",
    "py",
    "java",
    "c",
    "c++",
    "c#",
    "rust",
    "r",
    "bash",
    "sh",
    "shell",
    "nushell",
    "nu",
    "batch",
    "bat",
    "json",
    "jsonc",
    "json5",
    "csv",
    "apache",
    "nginx",
    "regex"
  ]
});

async function parseMarkdown(content: string) {
  if (highlighter == undefined) {
    highlighter = await highlighterPromise
  }

  marked.use(markedKatex({
    throwOnError: false,
    displayMode: true,
    output: "mathml"
  }));

  marked.use({
    async: true,
    renderer: {
      code({ text, lang }) {
        return highlighter.codeToHtml(text, {
          lang: lang || 'text',
          theme: 'catppuccin-mocha'
        });
      }
    }
  });

  const htmlString: string = await marked.parse(content);
  return DOMPurify.sanitize(htmlString);
}

export {
  parseMarkdown
}
