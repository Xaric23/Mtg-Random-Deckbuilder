import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();
    
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metric:', metric);
      return NextResponse.json({ success: true });
    }

    // In production, you could send this to your analytics service
    // Example with Google Analytics:
    // await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     client_id: 'STATIC_CLIENT_ID',
    //     events: [{
    //       name: 'web_vitals',
    //       params: metric
    //     }]
    //   })
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing metric:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}