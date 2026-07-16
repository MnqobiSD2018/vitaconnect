// lib/utils/qr.ts — Signed QR codes
import { SignJWT, jwtVerify } from 'jose';

const QR_SECRET = new TextEncoder().encode(process.env.QR_SIGNING_SECRET!);

export async function generateQRPayload(ticketId: string, secret: string) {
  // Sign a JWT containing the ticket ID — cannot be forged without the secret
  const token = await new SignJWT({ tid: ticketId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('vitaconnect')
    .sign(QR_SECRET);
    
  return token;
}

export async function verifyQRScan(qrPayload: string) {
  try {
    const { payload } = await jwtVerify(qrPayload, QR_SECRET, {
      issuer: 'vitaconnect'
    });
    return payload.tid as string;
  } catch {
    throw new Error('Invalid or tampered QR code');
  }
}