import { NextResponse } from 'next/server';
import { auditUrl } from '../../../utils/scraper';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get('url');

    if (!urlParam) {
      return NextResponse.json(
        { success: false, error: 'The "url" query parameter is missing.' },
        { status: 400 }
      );
    }

    // Call our abstracted scraper utility
    const result = await auditUrl(urlParam);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    // Return the successful parsed data
    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    // Ultimate fallback catch to guarantee the server never crashes
    return NextResponse.json(
      { success: false, error: 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
