import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Key, CheckCircle2, AlertCircle, Loader2, ExternalLink, ChevronRight, Shield, RefreshCw } from 'lucide-react';
import { githubStorage } from '../services/githubStorage';

const STEPS = {
  WELCOME: 0,
  TOKEN: 1,
  GIST: 2,
  SUCCESS: 3,
};

export function GitHubSetupModal({ onComplete, onSkip }) {
  const [step, setStep] = useState(STEPS.WELCOME);
  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [validating, setValidating] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [creating, setCreating] = useState(false);
  const [gistError, setGistError] = useState('');

  const handleValidateToken = async () => {
    if (!token.trim()) {
      setTokenError('Cole seu token aqui.');
      return;
    }
    setValidating(true);
    setTokenError('');
    try {
      const user = await githubStorage.validateToken(token.trim());
      setUserInfo(user);
      setStep(STEPS.GIST);
    } catch (err) {
      setTokenError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleCreateGist = async () => {
    setCreating(true);
    setGistError('');
    try {
      const gistId = await githubStorage.createGist(token.trim());
      onComplete(token.trim(), gistId, userInfo?.login);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setGistError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1f2937] to-[#111827] p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sincronização com GitHub</h2>
              <p className="text-xs text-gray-400">Suas tarefas em todos os dispositivos</p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2 mt-4">
            {['Bem-vindo', 'Token', 'Armazenamento', 'Pronto'].map((label, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors
                  ${i <= step ? 'text-violet-400' : 'text-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${i < step ? 'bg-violet-500 text-white' : i === step ? 'bg-violet-500/20 border border-violet-500 text-violet-400' : 'bg-white/5 text-gray-600'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px transition-colors ${i < step ? 'bg-violet-500/50' : 'bg-white/5'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === STEPS.WELCOME && (
              <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white">Como funciona?</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Suas tarefas são salvas num <strong className="text-white">GitHub Gist privado</strong> usando sua conta do GitHub.
                    Assim, todos os seus dispositivos ficam sincronizados automaticamente.
                  </p>
                </div>

                <div className="grid gap-3">
                  {[
                    { icon: Shield, title: 'Privado & seguro', desc: 'O Gist é privado. Só você acessa.' },
                    { icon: RefreshCw, title: 'Sync automático', desc: 'Salva no GitHub a cada mudança.' },
                    { icon: Github, title: 'Sem backend', desc: 'Zero servidores. Apenas o GitHub.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                      <Icon className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(STEPS.TOKEN)}
                    className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-violet-400 transition-all">
                    Configurar agora <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={onSkip}
                    className="px-5 py-3 rounded-xl text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    Usar offline
                  </button>
                </div>
              </motion.div>
            )}

            {step === STEPS.TOKEN && (
              <motion.div key="token" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Personal Access Token</h3>
                  <p className="text-gray-400 text-sm">Crie um token com permissão de <code className="bg-white/10 px-1 rounded text-violet-300">gist</code> no GitHub.</p>
                </div>

                <div className="bg-[#161b22] border border-white/10 rounded-xl p-4 space-y-2 text-sm">
                  <p className="text-gray-300 font-medium text-xs uppercase tracking-wider">Como criar o token</p>
                  <ol className="text-gray-400 space-y-1 text-xs list-decimal list-inside">
                    <li>Acesse: <strong className="text-gray-200">GitHub → Settings → Developer Settings</strong></li>
                    <li>Clique em <strong className="text-gray-200">Personal access tokens → Tokens (classic)</strong></li>
                    <li>Clique em <strong className="text-gray-200">Generate new token (classic)</strong></li>
                    <li>Marque apenas a permissão <strong className="text-violet-300">gist</strong></li>
                    <li>Gere e copie o token</li>
                  </ol>
                  <a href="https://github.com/settings/tokens/new?scopes=gist&description=Gerenciador%20de%20Tarefas" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors">
                    Abrir página de criação do token <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Cole seu token aqui</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      value={token}
                      onChange={e => { setToken(e.target.value); setTokenError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleValidateToken()}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all placeholder:text-gray-700"
                    />
                  </div>
                  {tokenError && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {tokenError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(STEPS.WELCOME)} className="px-4 py-3 rounded-xl text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    Voltar
                  </button>
                  <button onClick={handleValidateToken} disabled={validating}
                    className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-violet-400 transition-all disabled:opacity-60">
                    {validating ? <><Loader2 className="w-4 h-4 animate-spin" /> Validando...</> : <>Validar token <ChevronRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {step === STEPS.GIST && (
              <motion.div key="gist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-300">Token válido!</p>
                    <p className="text-xs text-green-400/70">Conectado como <strong>{userInfo?.login}</strong></p>
                  </div>
                  {userInfo?.avatar_url && (
                    <img src={userInfo.avatar_url} alt="" className="w-8 h-8 rounded-full border border-white/10 ml-auto" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Criar Gist de armazenamento</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Vamos criar um <strong className="text-white">Gist privado</strong> chamado <code className="bg-white/10 px-1 rounded text-violet-300">tarefas.json</code> na sua conta do GitHub.
                    Ele vai armazenar todas as suas tarefas.
                  </p>
                </div>

                {gistError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{gistError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(STEPS.TOKEN)} className="px-4 py-3 rounded-xl text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    Voltar
                  </button>
                  <button onClick={handleCreateGist} disabled={creating}
                    className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-violet-400 transition-all disabled:opacity-60">
                    {creating
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando Gist...</>
                      : <><Github className="w-4 h-4" /> Criar Gist e ativar sync</>}
                  </button>
                </div>
              </motion.div>
            )}

            {step === STEPS.SUCCESS && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-white">Tudo configurado!</h3>
                  <p className="text-gray-400 text-sm mt-1">Suas tarefas agora sincronizam automaticamente com o GitHub.</p>
                </div>
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-sm text-gray-400 text-left space-y-1">
                  <p>✅ Token válido e salvo</p>
                  <p>✅ Gist privado criado</p>
                  <p>✅ Sync automático ativado</p>
                </div>
                <button onClick={() => {}}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-violet-400 transition-all">
                  Começar a usar 🚀
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
