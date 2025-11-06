import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Metric names
export const WEB_VITALS = ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'];

// Function to report performance metrics
export async function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: string;
}) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance metric:', metric);
    return;
  }

  // In production, you might want to send this to your analytics service
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Failed to report web vital:', error);
  }
}

// Middleware to add Server-Timing header
export function middleware(request: NextRequest) {
  // request is currently unused but kept for future use; mark as used to satisfy linters
  void request;
  const response = NextResponse.next();
  
  // Add Server-Timing header
  const startTime = process.hrtime();
  response.headers.set('Server-Timing', `total;dur=${process.hrtime(startTime)[1] / 1000000}`);
  
  return response;
}