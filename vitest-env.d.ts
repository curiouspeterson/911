/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

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
