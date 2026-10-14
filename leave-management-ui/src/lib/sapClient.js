// src/lib/sapClient.js

export async function callSapApi(endpoint, options = {}) {
  const baseUrl = (process.env.SAP_ODATA_BASE_URL || '').replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;
  const cookie = process.env.SAP_COOKIE || '';

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cookie': cookie,
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store', // Always fetch fresh data from SAP
    });
  } catch (netErr) {
    console.error(`SAP Network Error connecting to ${url}:`, netErr.message);
    throw new Error(
      `Cannot connect to SAP endpoint at ${baseUrl}. Ensure Eclipse ADT test client is running and .env.local has the current active port and cookie.`
    );
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || 'SAP API Error';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  return data;
}