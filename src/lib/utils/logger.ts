// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,           // 10% of transactions
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Strip PII before sending to Sentry
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});