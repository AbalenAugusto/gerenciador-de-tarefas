import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 👇 IMPORTANTE: coloque aqui o nome EXATO do seu repositório no GitHub
// Exemplo: se o repo é https://github.com/seunome/gerenciador-tarefas
// então deixe: base: '/gerenciador-tarefas/'
//
// Se você usar um domínio customizado ou GitHub Pages no root, deixe: base: '/'

const REPO_NAME = 'gerenciador-de-tarefas'; // ← EDITE AQUI com o nome do seu repo

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
});
