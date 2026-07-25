import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Header from './Header.svelte';
import { syncStore } from '$lib/stores/sync';

let mockSettings: any = {};

vi.mock('$lib/stores/settings', () => ({
  settingsStore: {
    subscribe: (run: any) => {
      run(mockSettings);
      return () => {};
    },
    update: (fn: any) => { mockSettings = fn(mockSettings); },
  },
}));

vi.mock('$lib/services/sync', () => ({
  syncUnsyncedItems: vi.fn(),
}));

vi.mock('$lib/components/dialogs/SettingsDialog.svelte', () => ({
  default: () => null,
}));

vi.mock('$lib/components/dialogs/StatsDialog.svelte', () => ({
  default: () => null,
}));

vi.mock('$lib/assets/logo.svg?url', () => ({ default: '/logo.svg' }));

vi.mock('$lib/utils', () => ({
  getRelativeTime: vi.fn(() => '2m ago'),
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

function setSettings(overrides: Partial<any> = {}) {
  mockSettings = {
    id: 'settings',
    syncEnabled: true,
    syncToken: 'test-token',
    autoSyncOnStart: false,
    retentionDays: null,
    syncRetentionDays: 7,
    ...overrides,
  };
}

beforeEach(() => {
  setSettings();
  syncStore.set({ syncing: false, lastSyncAt: null, error: null, successCount: 0, failCount: 0 });
});

describe('Header', () => {
  it('renders the logo', () => {
    render(Header);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });

  it('shows online indicator', () => {
    render(Header);
    expect(document.querySelector('.bg-green-500')).toBeInTheDocument();
  });

  it('shows offline indicator when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    render(Header);
    expect(document.querySelector('.bg-red-500')).toBeInTheDocument();
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  it('shows last sync time', () => {
    syncStore.set({ syncing: false, lastSyncAt: new Date().toISOString(), error: null, successCount: 0, failCount: 0 });
    render(Header);
    expect(screen.getByText(/Last sync/)).toBeInTheDocument();
  });

  it('shows sync error', () => {
    syncStore.set({ syncing: false, lastSyncAt: null, error: 'Sync failed', successCount: 0, failCount: 0 });
    render(Header);
    expect(screen.getByText('Sync failed')).toBeInTheDocument();
  });

  it('disables sync button when sync is disabled', () => {
    setSettings({ syncEnabled: false, syncToken: '' });
    render(Header);
    const syncBtn = screen.getByLabelText('Sync disabled');
    expect(syncBtn).toBeDisabled();
  });

  it('shows stats and settings buttons', () => {
    render(Header);
    expect(screen.getByLabelText('Statistics')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });
});
