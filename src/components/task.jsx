import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Edit2, Calendar, Layout, ListFilter, AlertCircle } from 'lucide-react';
import { useGitHubTasks } from '../hooks/useGitHubTasks';
import { GitHubSetupModal } from './GitHubSetupModal';
import { SyncStatusBar } from './SyncStatusBar';

const Tasks = () => {
    const {
        tasks,
        setTasks,
        syncStatus,
        syncError,
        isConfigured,
        forceSync,
        configureSync,
        disconnectSync,
    } = useGitHubTasks();

    const [newTask, setNewTask] = useState({ title: '', description: '', importance: 'media' });
    const [isEditing, setIsEditing] = useState(null);
    const [filter, setFilter] = useState('all');
    const [importanceFilter, setImportanceFilter] = useState('all');
    const [error, setError] = useState('');
    const [showSetup, setShowSetup] = useState(!isConfigured);

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) {
            setError('O título da tarefa é obrigatório.');
            return;
        }
        if (isEditing) {
            setTasks(tasks.map(t => t.id === isEditing ? { ...t, ...newTask } : t));
            setIsEditing(null);
        } else {
            const task = {
                id: crypto.randomUUID(),
                ...newTask,
                completed: false,
                createdAt: new Date().toISOString(),
            };
            setTasks([task, ...tasks]);
        }
        setNewTask({ title: '', description: '', importance: 'media' });
        setError('');
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    const toggleStatus = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const startEdit = (task) => {
        setNewTask({ title: task.title, description: task.description, importance: task.importance || 'media' });
        setIsEditing(task.id);
        setError('');
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setNewTask({ title: '', description: '', importance: 'media' });
        setError('');
    };

    // ─── Filter & Sort ────────────────────────────────────────────────────────

    const filteredTasks = tasks
        .filter(task => {
            if (filter === 'active' && task.completed) return false;
            if (filter === 'completed' && !task.completed) return false;
            if (importanceFilter !== 'all' && task.importance !== importanceFilter) return false;
            return true;
        })
        .sort((a, b) => {
            const order = { alta: 3, media: 2, baixa: 1 };
            return (order[b.importance] ?? 2) - (order[a.importance] ?? 2);
        });

    const stats = {
        total: tasks.length,
        active: tasks.filter(t => !t.completed).length,
        completed: tasks.filter(t => t.completed).length,
        alta: tasks.filter(t => t.importance === 'alta').length,
        media: tasks.filter(t => t.importance === 'media').length,
        baixa: tasks.filter(t => t.importance === 'baixa').length,
    };

    return (
        <div className="min-h-screen bg-darker text-white p-4 md:p-8 font-sans selection:bg-primary selection:text-white">

            {/* GitHub Setup Modal */}
            <AnimatePresence>
                {showSetup && !isConfigured && (
                    <GitHubSetupModal
                        onComplete={(token, gistId, username) => {
                            configureSync(token, gistId, username);
                            setShowSetup(false);
                        }}
                        onSkip={() => setShowSetup(false)}
                    />
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-between gap-4">
                    <div className="text-center flex-1 space-y-1">
                        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                            Gerenciador de Tarefas
                        </h1>
                        <p className="text-gray-400">Organize sua vida com estilo e eficiência.</p>
                    </div>
                    <div className="pt-1">
                        <SyncStatusBar
                            syncStatus={syncStatus}
                            syncError={syncError}
                            isConfigured={isConfigured}
                            onForceSync={forceSync}
                            onOpenSetup={() => setShowSetup(true)}
                            onDisconnect={disconnectSync}
                        />
                    </div>
                </motion.header>

                {/* Sync error banner */}
                <AnimatePresence>
                    {syncError && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-sm text-red-300">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{syncError}</span>
                            <button onClick={forceSync} className="ml-auto text-red-400 hover:text-red-200 underline text-xs">
                                Tentar novamente
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Total" value={stats.total} color="bg-blue-500/10 text-blue-400 border-blue-500/20" delay={0.1} />
                    <StatCard title="Pendentes" value={stats.active} color="bg-yellow-500/10 text-yellow-400 border-yellow-500/20" delay={0.2} />
                    <StatCard title="Concluídas" value={stats.completed} color="bg-green-500/10 text-green-400 border-green-500/20" delay={0.3} />
                </div>

                {/* Input Form */}
                <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleAddTask}
                    className="glass-strong p-6 rounded-2xl shadow-2xl space-y-4 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Layout className="w-5 h-5 text-primary" />
                            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="text" placeholder="Título da tarefa..."
                                value={newTask.title}
                                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600" />
                            <input type="text" placeholder="Descrição (opcional)"
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-gray-600" />
                            <select value={newTask.importance}
                                onChange={e => setNewTask({ ...newTask, importance: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-white cursor-pointer">
                                <option value="baixa" className="bg-gray-900">🟢 Baixa</option>
                                <option value="media" className="bg-gray-900">🟡 Média</option>
                                <option value="alta" className="bg-gray-900">🔴 Alta</option>
                            </select>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }} className="text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 pt-2">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                type="submit"
                                className={`flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                  ${isEditing ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-primary to-secondary hover:shadow-primary/25'}`}>
                                {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {isEditing ? 'Atualizar' : 'Adicionar'}
                            </motion.button>
                            {isEditing && (
                                <motion.button type="button" onClick={cancelEdit}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className="px-6 rounded-xl font-semibold text-gray-400 border border-white/10 hover:text-white">
                                    Cancelar
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.form>

                {/* Filters */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Status</h3>
                        <div className="flex gap-4 border-b border-white/10 pb-4">
                            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Todas" count={stats.total} />
                            <FilterButton active={filter === 'active'} onClick={() => setFilter('active')} label="Pendentes" count={stats.active} />
                            <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')} label="Concluídas" count={stats.completed} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Nível de Importância</h3>
                        <div className="flex gap-4 border-b border-white/10 pb-4">
                            <FilterButton active={importanceFilter === 'all'} onClick={() => setImportanceFilter('all')} label="Todas" count={stats.total} />
                            <FilterButton active={importanceFilter === 'alta'} onClick={() => setImportanceFilter('alta')} label="🔴 Alta" count={stats.alta} />
                            <FilterButton active={importanceFilter === 'media'} onClick={() => setImportanceFilter('media')} label="🟡 Média" count={stats.media} />
                            <FilterButton active={importanceFilter === 'baixa'} onClick={() => setImportanceFilter('baixa')} label="🟢 Baixa" count={stats.baixa} />
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <motion.ul layout className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-12 text-gray-500">
                                <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                                    <ListFilter className="w-8 h-8 opacity-50" />
                                </div>
                                <p>Nenhuma tarefa encontrada.</p>
                            </motion.div>
                        ) : (
                            filteredTasks.map(task => (
                                <TaskItem key={task.id} task={task}
                                    onToggle={() => toggleStatus(task.id)}
                                    onDelete={() => handleDelete(task.id)}
                                    onEdit={() => startEdit(task)} />
                            ))
                        )}
                    </AnimatePresence>
                </motion.ul>
            </div>
        </div>
    );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ title, value, color, delay }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className={`p-4 rounded-2xl border ${color} bg-opacity-10 backdrop-blur-sm flex flex-col items-center justify-center gap-1`}>
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-xs uppercase tracking-wider opacity-80">{title}</span>
    </motion.div>
);

const FilterButton = ({ active, onClick, label, count }) => (
    <button onClick={onClick}
        className={`pb-2 text-sm font-medium transition-colors relative ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
        {label} <span className="text-xs opacity-50 ml-1">({count})</span>
        {active && (
            <motion.div layoutId="activeFilter"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(139,92,246,0.5)]" />
        )}
    </button>
);

const TaskItem = ({ task, onToggle, onDelete, onEdit }) => (
    <motion.li layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }} whileHover={{ scale: 1.01 }}
        className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300
      ${task.completed ? 'bg-black/20 border-white/5 opacity-60' : 'glass border-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'}`}>
        <div className="flex items-center gap-4 flex-1">
            <button onClick={onToggle}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
          ${task.completed ? 'bg-green-500 border-green-500 text-black' : 'border-white/30 hover:border-primary group-hover:scale-110'}`}>
                {task.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
            </button>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className={`font-medium text-lg transition-all ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                    </h3>
                    <ImportanceBadge importance={task.importance || 'media'} />
                </div>
                {task.description && (
                    <p className={`text-sm ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>{task.description}</p>
                )}
                <span className="text-[10px] text-gray-600 uppercase tracking-widest flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(task.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={onEdit} disabled={task.completed}
                className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 ${task.completed ? 'cursor-not-allowed hidden' : ''}`}>
                <Edit2 className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1, color: '#ef4444' }} whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
            </motion.button>
        </div>
    </motion.li>
);

const ImportanceBadge = ({ importance }) => {
    const config = {
        alta: { label: 'Alta', emoji: '🔴', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
        media: { label: 'Média', emoji: '🟡', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        baixa: { label: 'Baixa', emoji: '🟢', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    };
    const { label, emoji, color } = config[importance] ?? config.media;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${color} uppercase tracking-wider`}>
            {emoji} {label}
        </span>
    );
};

export default Tasks;
