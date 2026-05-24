import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, RefreshCw, CheckCircle2, AlertCircle, WifiOff, Loader2, Settings, LogOut, ExternalLink } from 'lucide-react';
import { SYNC_STATUS } from '../hooks/useGitHubTasks';
import { githubStorage } from '../services/githubStorage';

export function SyncStatusBar({ syncStatus, syncError, onForceSync, onOpenSetup, onDisconnect, isConfigured }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const config = githubStorage.getConfig();

  const statusConfig = {
    [SYNC_STATUS.IDLE]: { color: 'text-gray-500', icon: Github, label: 'GitHub Sync' },
    [SYNC_STATUS.LOADING]: { color: 'text-blue-400', icon: Loader2, label: 'Carregando...', spin: true },
    [SYNC_STATUS.SYNCING]: { color: 'text-yellow-400', icon: RefreshCw, label: 'Salvando...', spin: true },
    [SYNC_STATUS.SYNCED]: { color: 'text-green-400', icon: CheckCircle2, label: 'Sincronizado' },
    [SYNC_STATUS.ERROR]: { color: 'text-red-400', icon: AlertCircle, label: 'Erro ao sincronizar' },
    [SYNC_STATUS.OFFLINE]: { color: 'text-gray-500', icon: WifiOff, label: 'Modo offline' },
  };

  const current = statusConfig[syncStatus] ?? statusConfig[SYNC_STATUS.IDLE];
  const Icon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(v => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 hover:border-white/15 text-xs font-medium transition-all ${current.color}`}
      >
        <Icon className={`w-3.5 h-3.5 ${current.spin ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{current.label}</span>
        {syncStatus === SYNC_STATUS.ERROR && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-64 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden"
            >
              {/* Status section */}
              <div className="p-3 border-b border-white/5">
                <div className={`flex items-center gap-2 text-sm font-medium ${current.color}`}>
                  <Icon className={`w-4 h-4 ${current.spin ? 'animate-spin' : ''}`} />
                  {current.label}
                </div>
                {syncError && (
                  <p className="text-red-300/70 text-xs mt-1 line-clamp-2">{syncError}</p>
                )}
                {isConfigured && config.username && (
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                    <Github className="w-3 h-3" /> {config.username}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="p-1">
                {isConfigured ? (
                  <>
                    <button
                      onClick={() => { onForceSync(); setShowDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Recarregar do GitHub
                    </button>
                    <a
                      href={`https://gist.github.com/${config.username}`}
                      target="_blank" rel="noopener noreferrer"
                      onClick={() => setShowDropdown(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver Gist no GitHub
                    </a>
                    <button
                      onClick={() => { onDisconnect(); setShowDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Desconectar GitHub
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { onOpenSetup(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-500/5 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configurar sincronização
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
