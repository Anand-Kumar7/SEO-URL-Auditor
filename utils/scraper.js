import * as cheerio from 'cheerio';

/**
 * Audits a given URL and extracts SEO/performance metrics.
 * Wrapped entirely in try/catch blocks to ensure server stability.
 * 
 * @param {string} targetUrl - The URL to audit.
 * @returns {object} Object containing status code and either data or an error message.
 */
export async function auditUrl(targetUrl) {
  let parsedUrl;
  
  // 1. Validate the URL structure (400 Bad Request)
  try {
    parsedUrl = new URL(targetUrl);
  } catch (error) {
    return { status: 400, error: 'Invalid URL provided. Must include http:// or https://' };
  }

  // 2. Setup the AbortController for an 8-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const startTime = Date.now();
  let response;

  // 3. Fetch the URL (Handles DNS failures and Timeouts)
  try {
    response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-AuditorBot/1.0)',
      }
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { status: 504, error: 'Request timed out after 8 seconds.' };
    }
    return { status: 404, error: 'Failed to reach the URL (DNS or Network error).' };
  }
  
  // Clear timeout since the request succeeded
  clearTimeout(timeoutId);
  const responseTime = Date.now() - startTime;
  const httpStatus = response.status;
  
  // 4. Validate Content-Type (Ensure it's HTML, not PDF/Image)
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return { status: 415, error: `Unsupported Media Type: expected text/html, received ${contentType}` };
  }

  let html;
  try {
    html = await response.text();
  } catch (error) {
    return { status: 500, error: 'Failed to read the response body.' };
  }

  // 5. Parse the DOM using Cheerio for instant, low-memory traversal
  try {
    const $ = cheerio.load(html);

    // Extract metrics
    const title = $('title').text() || null;
    const metaDescription = $('meta[name="description"]').attr('content') || null;
    const h1Count = $('h1').length;
    
    // Count images missing an alt attribute or having an empty alt
    let imagesMissingAlt = 0;
    $('img').each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt === undefined || alt.trim() === '') {
        imagesMissingAlt++;
      }
    });

    // Approximate word count in the body text
    const bodyText = $('body').text() || '';
    const normalizedText = bodyText.replace(/\s+/g, ' ').trim();
    const wordCount = normalizedText === '' ? 0 : normalizedText.split(' ').length;

    return {
      status: 200,
      data: {
        httpStatus,
        responseTime,
        title,
        metaDescription,
        h1Count,
        imagesMissingAlt,
        wordCount
      }
    };
  } catch (error) {
    return { status: 500, error: 'An error occurred while parsing the HTML.' };
  }
}
