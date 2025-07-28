/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

// Declare global Vitest functions since globals: true is enabled
declare global {
  const describe: (typeof import('vitest'))['describe'];
  const it: (typeof import('vitest'))['it'];
  const expect: (typeof import('vitest'))['expect'];
  const vi: (typeof import('vitest'))['vi'];
  const beforeEach: (typeof import('vitest'))['beforeEach'];
  const afterEach: (typeof import('vitest'))['afterEach'];
  const beforeAll: (typeof import('vitest'))['beforeAll'];
  const afterAll: (typeof import('vitest'))['afterAll'];
}

// Extend the vi namespace to include Mock type
declare namespace vi {
  interface Mock<T = any, Y extends any[] = any> {
    (...args: Y): T;
    mock: {
      calls: Y[];
      instances: T[];
      contexts: any[];
      results: Array<{ type: 'return' | 'throw'; value: any }>;
    };
    mockClear(): Mock<T, Y>;
    mockReset(): Mock<T, Y>;
    mockRestore(): Mock<T, Y>;
    mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
    mockImplementationOnce(fn: (...args: Y) => T): Mock<T, Y>;
    mockReturnValue(value: T): Mock<T, Y>;
    mockReturnValueOnce(value: T): Mock<T, Y>;
    mockResolvedValue(value: Awaited<T>): Mock<T, Y>;
    mockResolvedValueOnce(value: Awaited<T>): Mock<T, Y>;
    mockRejectedValue(value: any): Mock<T, Y>;
    mockRejectedValueOnce(value: any): Mock<T, Y>;
  }
}

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveValue(value: string | number | string[]): R;
  toHaveAttribute(attr: string, value?: string): R;
  toHaveClass(className: string): R;
  toHaveTextContent(text: string | RegExp): R;
  toBeVisible(): R;
  toBeDisabled(): R;
  toBeEnabled(): R;
  toBeChecked(): R;
  toBePartiallyChecked(): R;
  toHaveFocus(): R;
  toHaveFormValues(expectedValues: Record<string, any>): R;
  toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
  toBeEmpty(): R;
  toBeEmptyDOMElement(): R;
  toHaveStyle(css: string | Record<string, any>): R;
  toHaveAccessibleName(name: string | RegExp): R;
  toHaveAccessibleDescription(description: string | RegExp): R;
  toHaveErrorMessage(text: string | RegExp): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends CustomMatchers<T> {}
  }
}
