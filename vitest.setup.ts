import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
}));

vi.mock('@/lib/stores/environmentStore', () => ({
  useEnvironmentStore: () => ({
    environment: 'dev',
    setEnvironment: vi.fn(),
  }),
  getPersistedEnvironment: () => 'dev',
  getConfigForEnvironment: () => ({
    url: 'http://localhost:54321',
    anonKey: 'test-key',
  }),
}));
