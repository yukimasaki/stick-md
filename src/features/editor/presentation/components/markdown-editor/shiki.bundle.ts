/* Generate by @shikijs/codegen */
import type {
  DynamicImportLanguageRegistration,
  DynamicImportThemeRegistration,
  HighlighterGeneric,
} from '@shikijs/types'
import {
  createBundledHighlighter,
  createSingletonShorthands,
} from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'

type BundledLanguage =
  | 'typescript'
  | 'ts'
  | 'cts'
  | 'mts'
  | 'javascript'
  | 'js'
  | 'cjs'
  | 'mjs'
  | 'python'
  | 'py'
  | 'markdown'
  | 'md'
  | 'json'
  | 'css'
  | 'html'
  | 'shellscript'
  | 'bash'
  | 'sh'
  | 'shell'
  | 'zsh'
type BundledTheme = 'light-plus' | 'dark-plus'
type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>

const bundledLanguages = {
  typescript: () => import('@shikijs/langs-precompiled/typescript'),
  ts: () => import('@shikijs/langs-precompiled/typescript'),
  cts: () => import('@shikijs/langs-precompiled/typescript'),
  mts: () => import('@shikijs/langs-precompiled/typescript'),
  javascript: () => import('@shikijs/langs-precompiled/javascript'),
  js: () => import('@shikijs/langs-precompiled/javascript'),
  cjs: () => import('@shikijs/langs-precompiled/javascript'),
  mjs: () => import('@shikijs/langs-precompiled/javascript'),
  python: () => import('@shikijs/langs-precompiled/python'),
  py: () => import('@shikijs/langs-precompiled/python'),
  markdown: () => import('@shikijs/langs-precompiled/markdown'),
  md: () => import('@shikijs/langs-precompiled/markdown'),
  json: () => import('@shikijs/langs-precompiled/json'),
  css: () => import('@shikijs/langs-precompiled/css'),
  html: () => import('@shikijs/langs-precompiled/html'),
  shellscript: () => import('@shikijs/langs-precompiled/shellscript'),
  bash: () => import('@shikijs/langs-precompiled/shellscript'),
  sh: () => import('@shikijs/langs-precompiled/shellscript'),
  shell: () => import('@shikijs/langs-precompiled/shellscript'),
  zsh: () => import('@shikijs/langs-precompiled/shellscript'),
} as Record<BundledLanguage, DynamicImportLanguageRegistration>

const bundledThemes = {
  'light-plus': () => import('@shikijs/themes/light-plus'),
  'dark-plus': () => import('@shikijs/themes/dark-plus'),
} as Record<BundledTheme, DynamicImportThemeRegistration>

const createHighlighter = /* @__PURE__ */ createBundledHighlighter<
  BundledLanguage,
  BundledTheme
>({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRegexEngine(),
})

const {
  codeToHtml,
  codeToHast,
  codeToTokensBase,
  codeToTokens,
  codeToTokensWithThemes,
  getSingletonHighlighter,
  getLastGrammarState,
} = /* @__PURE__ */ createSingletonShorthands<BundledLanguage, BundledTheme>(
  createHighlighter,
)

export {
  bundledLanguages,
  bundledThemes,
  codeToHast,
  codeToHtml,
  codeToTokens,
  codeToTokensBase,
  codeToTokensWithThemes,
  createHighlighter,
  getLastGrammarState,
  getSingletonHighlighter,
}
export type { BundledLanguage, BundledTheme, Highlighter }
