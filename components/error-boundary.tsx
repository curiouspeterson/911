'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a real app, you'd log this to a service like Sentry or LogRocket
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, render it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render a default, styled fallback UI
      return (
        <Card className="w-full max-w-md text-left">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Oops! A Client-Side Error Occurred.
            </CardTitle>
            <CardDescription>
              Something went wrong while rendering this part of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {this.state.error && (
              <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-xs text-white">
                <code>{this.state.error.message}</code>
              </pre>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={this.handleReset} className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
