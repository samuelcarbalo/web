import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');

const SKIP_FILES = new Set([
  'MainLayout.tsx',
  'Home.tsx',
  'Modal.tsx',
  'ThemeToggle.tsx',
  'Login.tsx',
  'index.css',
]);

const replacements = [
  [/rounded-2xl/g, 'rounded-3xl'],
  [/rounded-xl/g, 'rounded-3xl'],
  [/rounded-lg/g, 'rounded-3xl'],
  [/hover:-translate-y-0\.5/g, 'hover:scale-[1.02]'],
  [/hover:-translate-y-1/g, 'hover:scale-[1.02]'],
  [/hover:scale-105/g, 'hover:scale-[1.02]'],
  [/hover:scale-110/g, 'hover:scale-[1.02]'],
  [/hover:shadow-md/g, 'hover:shadow-2xl'],
  [/hover:shadow-xl/g, 'hover:shadow-2xl'],
  [/hover:shadow-lg/g, 'hover:shadow-2xl'],
  [/focus:ring-blue-500/g, 'focus:ring-violet-500'],
  [/focus:ring-primary-500/g, 'focus:ring-violet-500'],
  [/text-primary-600/g, 'text-violet-600 dark:text-violet-400'],
  [/text-primary-500/g, 'text-violet-500 dark:text-violet-400'],
  [/text-primary-700/g, 'text-violet-700 dark:text-violet-300'],
  [/text-primary-100/g, 'text-violet-100'],
  [/hover:text-primary-600/g, 'hover:text-violet-600 dark:hover:text-violet-400'],
  [/hover:text-primary-500/g, 'hover:text-violet-500 dark:hover:text-violet-400'],
  [/hover:text-primary-700/g, 'hover:text-violet-700 dark:hover:text-violet-300'],
  [/hover:text-blue-600/g, 'hover:text-violet-600 dark:hover:text-violet-400'],
  [/hover:text-blue-700/g, 'hover:text-violet-700 dark:hover:text-violet-300'],
  [/group-hover:text-blue-600/g, 'group-hover:text-violet-600 dark:group-hover:text-violet-400'],
  [/group-hover:text-primary-600/g, 'group-hover:text-violet-600 dark:group-hover:text-violet-400'],
  [/bg-primary-600/g, 'bg-gradient-to-r from-violet-600 to-indigo-600'],
  [/bg-primary-100/g, 'bg-violet-100 dark:bg-violet-950/50'],
  [/bg-primary-50/g, 'bg-violet-50 dark:bg-violet-950/30'],
  [/bg-primary-500/g, 'bg-violet-500'],
  [/hover:bg-primary-700/g, 'hover:from-violet-500 hover:to-indigo-500'],
  [/hover:bg-primary-600/g, 'hover:from-violet-500 hover:to-indigo-500'],
  [/border-primary-200/g, 'border-violet-200 dark:border-violet-800'],
  [/hover:border-blue-300/g, 'hover:border-violet-400 dark:hover:border-violet-600'],
  [/hover:border-primary-200/g, 'hover:border-violet-300 dark:hover:border-violet-700'],
  [/from-blue-600/g, 'from-violet-600'],
  [/from-blue-700/g, 'from-violet-700'],
  [/from-blue-800/g, 'from-violet-800'],
  [/from-blue-900/g, 'from-violet-900'],
  [/via-blue-/g, 'via-indigo-'],
  [/to-blue-600/g, 'to-indigo-600'],
  [/to-blue-700/g, 'to-indigo-700'],
  [/to-sky-600/g, 'to-indigo-600'],
  [/text-blue-600/g, 'text-violet-600 dark:text-violet-400'],
  [/text-blue-500/g, 'text-violet-500 dark:text-violet-400'],
  [/text-blue-100/g, 'text-violet-100'],
  [/text-blue-400/g, 'text-violet-400'],
  [/bg-blue-600/g, 'bg-gradient-to-r from-violet-600 to-indigo-600'],
  [/bg-blue-50/g, 'bg-violet-50 dark:bg-violet-950/30'],
  [/bg-blue-100/g, 'bg-violet-100 dark:bg-violet-950/40'],
  [/border-blue-100/g, 'border-violet-100 dark:border-violet-900'],
  [/border-blue-200/g, 'border-violet-200 dark:border-violet-800'],
  [/hover:bg-blue-50/g, 'hover:bg-violet-50 dark:hover:bg-violet-950/40'],
  [/hover:bg-blue-700/g, 'hover:from-violet-500 hover:to-indigo-500'],
  [/border-blue-600/g, 'border-violet-600'],
  [/shadow-primary-600/g, 'shadow-violet-600'],
  [/shadow-blue-600/g, 'shadow-violet-600'],
  [/min-h-screen bg-gray-50(?!\s+dark:)/g, 'min-h-screen bg-gray-50 dark:bg-gray-950'],
  [/min-h-screen bg-slate-50(?!\s+dark:)/g, 'min-h-screen bg-slate-50 dark:bg-gray-950'],
  [/min-h-screen bg-white(?!\s+dark:)/g, 'min-h-screen bg-white dark:bg-gray-950'],
  [/text-gray-900(?!\s+dark:)/g, 'text-gray-900 dark:text-white'],
  [/text-gray-800(?!\s+dark:)/g, 'text-gray-800 dark:text-gray-100'],
  [/text-gray-700(?!\s+dark:)/g, 'text-gray-700 dark:text-gray-200'],
  [/text-gray-600(?!\s+dark:)/g, 'text-gray-600 dark:text-gray-400'],
  [/text-slate-900(?!\s+dark:)/g, 'text-slate-900 dark:text-white'],
  [/text-slate-800(?!\s+dark:)/g, 'text-slate-800 dark:text-gray-100'],
  [/text-slate-700(?!\s+dark:)/g, 'text-slate-700 dark:text-gray-200'],
  [/text-slate-600(?!\s+dark:)/g, 'text-slate-600 dark:text-gray-400'],
  [/text-slate-500(?!\s+dark:)/g, 'text-slate-500 dark:text-gray-400'],
  [/border-gray-200(?!\s+dark:|\/)/g, 'border-gray-200 dark:border-gray-800'],
  [/border-slate-200(?!\s+dark:|\/)/g, 'border-slate-200 dark:border-gray-800'],
  [/border-gray-300(?!\s+dark:)/g, 'border-gray-300 dark:border-gray-700'],
  [/bg-gray-50(?!\s+dark:|\/)/g, 'bg-gray-50 dark:bg-gray-900/50'],
  [/bg-slate-50(?!\s+dark:|\/)/g, 'bg-slate-50 dark:bg-gray-900/50'],
  [/bg-gray-100(?!\s+dark:)/g, 'bg-gray-100 dark:bg-gray-800'],
  [/hover:bg-gray-50(?!\s+dark:)/g, 'hover:bg-gray-50 dark:hover:bg-gray-800/50'],
  [/hover:bg-gray-100(?!\s+dark:)/g, 'hover:bg-gray-100 dark:hover:bg-gray-800'],
  [/hover:bg-slate-50(?!\s+dark:)/g, 'hover:bg-slate-50 dark:hover:bg-gray-800/50'],
  [/max-w-7xl mx-auto px-4 sm:px-6 lg:px-8/g, 'page-container'],
];

function walkDir(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, files);
    else if (entry.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walkDir(srcDir)) {
  if (SKIP_FILES.has(path.basename(file))) continue;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updated++;
    console.log('Updated:', path.relative(srcDir, file));
  }
}
console.log(`\nDone. ${updated} files updated.`);
