import { webcrypto } from 'crypto';

// Polyfill for Node 18 compatibility with @nestjs/typeorm
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto as any;
}
