import { useState, useEffect, useCallback, useRef } from 'react';
import { githubStorage } from '../services/githubStorage';

// Sync states
export const SYNC_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  ERROR: 'error',
  OFFLINE: 'offline',
};

const DEBOUNCE_MS = 1500; // Wait 1.5s after last change before saving

export function useGitHubTasks() {
  const [tasks, setTasksState] = useState([]);
  const [syncStatus, setSyncStatus] = useState(SYNC_STATUS.IDLE);
  const [syncError, setSyncError] = useState(null);
  const [isConfigured, setIsConfigured] = useState(githubStorage.isConfigured());
  const debounceTimer = useRef(null);
  const isInitialLoad = useRef(true);

  // Load tasks from GitHub on mount
  useEffect(() => {
    async function init() {
      if (!githubStorage.isConfigured()) {
        // Not configured: load from local cache
        setTasksState(githubStorage.getLocalCache());
        setSyncStatus(SYNC_STATUS.OFFLINE);
        return;
      }

      setSyncStatus(SYNC_STATUS.LOADING);
      try {
        const remoteTasks = await githubStorage.loadTasks();
        setTasksState(remoteTasks ?? []);
        githubStorage.cacheLocally(remoteTasks ?? []);
        setSyncStatus(SYNC_STATUS.SYNCED);
      } catch (err) {
        setSyncError(err.message);
        setSyncStatus(SYNC_STATUS.ERROR);
        // Fallback to local cache
        setTasksState(githubStorage.getLocalCache());
      }
    }
    init();
  }, [isConfigured]);

  // Debounced save to GitHub whenever tasks change
  useEffect(() => {
    // Skip the very first render (initial load from GitHub)
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (syncStatus === SYNC_STATUS.LOADING) return;

    // Always update local cache immediately
    githubStorage.cacheLocally(tasks);

    if (!githubStorage.isConfigured()) return;

    // Debounce the GitHub save
    clearTimeout(debounceTimer.current);
    setSyncStatus(SYNC_STATUS.SYNCING);
    debounceTimer.current = setTimeout(async () => {
      try {
        await githubStorage.saveTasks(tasks);
        setSyncStatus(SYNC_STATUS.SYNCED);
        setSyncError(null);
      } catch (err) {
        setSyncError(err.message);
        setSyncStatus(SYNC_STATUS.ERROR);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer.current);
  }, [tasks]);

  const setTasks = useCallback((updater) => {
    isInitialLoad.current = false;
    setTasksState(updater);
  }, []);

  const forceSync = useCallback(async () => {
    if (!githubStorage.isConfigured()) return;
    setSyncStatus(SYNC_STATUS.LOADING);
    try {
      const remoteTasks = await githubStorage.loadTasks();
      setTasksState(remoteTasks ?? []);
      githubStorage.cacheLocally(remoteTasks ?? []);
      setSyncStatus(SYNC_STATUS.SYNCED);
      setSyncError(null);
    } catch (err) {
      setSyncError(err.message);
      setSyncStatus(SYNC_STATUS.ERROR);
    }
  }, []);

  const configureSync = useCallback((token, gistId, username) => {
    githubStorage.saveConfig(token, gistId, username);
    isInitialLoad.current = true;
    setIsConfigured(true);
  }, []);

  const disconnectSync = useCallback(() => {
    githubStorage.clearConfig();
    setIsConfigured(false);
    setSyncStatus(SYNC_STATUS.OFFLINE);
  }, []);

  return {
    tasks,
    setTasks,
    syncStatus,
    syncError,
    isConfigured,
    forceSync,
    configureSync,
    disconnectSync,
  };
}
