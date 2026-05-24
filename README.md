# ✅ Gerenciador de Tarefas — com Sync via GitHub

App de gerenciamento de tarefas com **sincronização automática via GitHub Gist**.  
Acesse do PC, notebook ou celular com tudo sempre sincronizado.

🔗 **Deploy:** `https://<seu-usuario>.github.io/gerenciador-de-tarefas/`

---

## 🚀 Como publicar no GitHub (passo a passo)

### 1. Crie o repositório

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `gerenciador-de-tarefas` (ou o que preferir)
3. Deixe **público** (necessário para GitHub Pages gratuito)
4. Clique em **Create repository**

### 2. Configure o nome do repositório no Vite

Abra o arquivo `vite.config.js` e edite a linha:

```js
const REPO_NAME = 'gerenciador-de-tarefas'; // ← coloque o nome exato do seu repo
```

### 3. Suba o código

```bash
git init
git add .
git commit -m "feat: gerenciador de tarefas com sync GitHub"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/gerenciador-de-tarefas.git
git push -u origin main
```

### 4. Ative o GitHub Pages

1. No repositório, vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Clique em **Save**

O deploy acontece automaticamente a cada push na branch `main`.  
Em ~1 minuto o site estará em: `https://<usuario>.github.io/gerenciador-de-tarefas/`

---

## 🔄 Configurar Sincronização de Tarefas

Na primeira vez que abrir o app, um assistente de configuração aparecerá.

### Criar o Personal Access Token (PAT)

1. Acesse: [github.com/settings/tokens](https://github.com/settings/tokens)
2. Clique em **Tokens (classic)** → **Generate new token (classic)**
3. Dê um nome: `Gerenciador de Tarefas`
4. Marque **apenas** a permissão: ✅ `gist`
5. Clique em **Generate token** e copie o token

> ⚠️ O token só aparece uma vez. Salve-o em local seguro.

Ou use este link direto:  
[Criar token com permissão gist](https://github.com/settings/tokens/new?scopes=gist&description=Gerenciador%20de%20Tarefas)

### No app

1. Cole o token no campo indicado
2. Clique em **Validar token**
3. Clique em **Criar Gist e ativar sync**

Pronto! Um arquivo `tarefas.json` será criado como Gist privado na sua conta.

---

## 📱 Usar em outros dispositivos

Acesse a mesma URL (`https://<usuario>.github.io/gerenciador-de-tarefas/`) e configure o token novamente. As tarefas são carregadas do GitHub automaticamente.

---

## 🛠️ Rodar localmente

```bash
npm install
npm run dev
```

---

## 🏗️ Tecnologias

- **React 19** + **Vite**
- **Tailwind CSS v4**
- **Framer Motion** (animações)
- **GitHub Gist API** (sincronização)
- **GitHub Actions** (deploy automático)
- **GitHub Pages** (hospedagem gratuita)

---

## 🔐 Segurança

- O token PAT é salvo apenas no `localStorage` do seu navegador
- O Gist é criado como **privado**
- O token nunca é enviado para nenhum servidor além da API do GitHub
- Recomendado: crie um token com **data de expiração** e renove periodicamente
