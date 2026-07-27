# SEO URL Auditor

It scrap information from website.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

A fast, lightweight, and robust tool for auditing URLs for basic SEO metrics. Built with Next.js App Router and Cheerio.

## Setup Instructions

1. **Install Dependencies**: 
   Ensure you have Node.js (v18+) installed. Then run:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to interact with the frontend.

3. **Run Tests**:
   This project uses native Node.js test runners. Run the test suite with:
   ```bash
   npm test
   ```

## API Contract

The core of the application is a single `GET` API route at `/api/audit`.

### Request
**Endpoint:** `/api/audit`
**Method:** `GET`
**Query Parameters:**
- `url` (string, required): The fully qualified URL to audit (e.g., `url=https://example.com`)

### Response
All responses, including errors, strictly follow a predictable JSON format.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "httpStatus": 200,
    "responseTime": 124,
    "title": "Example Domain",
    "metaDescription": "Description text...",
    "h1Count": 1,
    "imagesMissingAlt": 0,
    "wordCount": 35
  }
}
```

**Error Responses (400, 404, 415, 500, 504):**
```json
{
  "success": false,
  "error": "Detailed error message explaining what failed."
}
```

## Design Decisions

Here are three key architectural decisions made while building this tool:

1. **Using `cheerio` over headless browsers (Puppeteer/Selenium)**
   *Reasoning:* Headless browsers require massive overhead in memory and execution time just to spin up an instance, often taking 2-3 seconds per request. Since this audit focuses purely on static DOM metrics (meta tags, H1s, alt text), making a single HTTP `fetch` and parsing it with `cheerio` drops the execution time down to mere milliseconds, guaranteeing Vercel free-tier viability.

2. **Strict JSON Response Contracts (`{ success, data, error }`)**
   *Reasoning:* In modern full-stack development, the frontend needs absolute predictability. By ensuring *every* response (even internal 500s or timeouts) returns the exact same object structure, the frontend logic stays incredibly clean (no unexpected crashes parsing error texts) and error states are trivially mapped to the UI.

3. **Native `fetch` API & Native `node:test`**
   *Reasoning:* Relying on the native `fetch` (with `AbortController` for timeouts) rather than pulling in `axios` reduces bundle size and dependency bloat. Similarly, using the built-in Node 20+ `node:test` framework means zero setup overhead. The fewer dependencies an app has, the less maintenance (and potential security vulnerabilities) it incurs over time.
