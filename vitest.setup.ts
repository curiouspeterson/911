import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the scrollIntoView function for Radix UI components in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();
