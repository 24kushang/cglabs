function base64UrlEncode(buffer: Uint8Array): string {
  let str = '';
  for (let i = 0; i < buffer.length; i++) {
    str += String.fromCharCode(buffer[i]);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function signJwt(payload: Record<string, any>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoder = new TextEncoder();

  const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));

  const message = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret || 'cglabs_fallback_jwt_secret_v1'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const encodedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${message}.${encodedSignature}`;
}

export async function verifyJwt(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const message = `${encodedHeader}.${encodedPayload}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret || 'cglabs_fallback_jwt_secret_v1'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlDecode(encodedSignature);
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(message));

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadJson);

    // Verify expiration if present
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}
