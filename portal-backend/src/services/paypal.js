import { config } from '../config.js';

let cachedToken = null;
let tokenExpiresAt = 0;

function getApiBase() {
  return config.paypal.env === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

// Exported pinned PayPal API base (read-only constant) for SSRF-safe URL building.
export function paypalApiBase() {
  return getApiBase();
}

export async function getPayPalAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  const clientId = config.paypal.clientId;
  const clientSecret = config.paypal.clientSecret;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID or Secret is not configured in environment variables.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${getApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to obtain PayPal access token (${res.status}): ${errText}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in * 1000);
  return cachedToken;
}

export async function createPayPalOrder({ amountCents, currency = 'USD', description = 'JDP Team Service', customId = '' }) {
  const token = await getPayPalAccessToken();
  const value = (amountCents / 100).toFixed(2);

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: 'jdp_order_' + Date.now(),
        description: description.substring(0, 127),
        custom_id: customId ? String(customId).substring(0, 127) : undefined,
        amount: {
          currency_code: currency,
          value
        }
      }
    ],
    application_context: {
      brand_name: 'JDP Team',
      landing_page: 'BILLING',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING'
    }
  };

  const res = await fetch(`${getApiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`PayPal createOrder failed (${res.status}): ${errBody}`);
  }

  return await res.json();
}

export async function capturePayPalOrder(orderId) {
  // Validate order ID to prevent URL/path injection (SSRF guard)
  const safeId = String(orderId).trim();
  if (!/^[A-Z0-9]{1,32}$/i.test(safeId)) {
    throw new Error('Invalid PayPal order ID format.');
  }
  const token = await getPayPalAccessToken();

  // Build URL from a fixed, pinned base — no user input can alter the host
  const url = new URL(`/v2/checkout/orders/${encodeURIComponent(safeId)}/capture`, getApiBase());
  const res = await fetch(url.href, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`PayPal captureOrder failed (${res.status}): ${errBody}`);
  }

  return await res.json();
}

export async function getPayPalOrderDetails(orderId) {
  // Validate order ID to prevent URL/path injection (SSRF guard)
  const safeId = String(orderId).trim();
  if (!/^[A-Z0-9]{1,32}$/i.test(safeId)) {
    throw new Error('Invalid PayPal order ID format.');
  }
  const token = await getPayPalAccessToken();

  // Build URL from a fixed, pinned base — no user input can alter the host
  const url = new URL(`/v2/checkout/orders/${encodeURIComponent(safeId)}`, getApiBase());
  const res = await fetch(url.href, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`PayPal getOrderDetails failed (${res.status}): ${errBody}`);
  }

  return await res.json();
}
