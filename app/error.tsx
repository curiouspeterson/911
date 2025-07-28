'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in a real app
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            An Error Occurred
          </CardTitle>
          <CardDescription>
            We're sorry, but something went wrong.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">
            {error.message ||
              'An unexpected error has occurred. Please try again in a moment.'}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 mt-4">
              Error Digest: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => reset()} className="w-full">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
