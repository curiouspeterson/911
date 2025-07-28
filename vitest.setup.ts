import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the scrollIntoView function for Radix UI components in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Make vitest globals available
globalThis.describe = describe;
globalThis.it = it;
globalThis.expect = expect;
globalThis.beforeEach = beforeEach;
globalThis.vi = vi;
