// Stub for `server-only` in vitest. The real package throws at import time
// when included in client bundles; under vitest we just want it to be a
// no-op so pure-logic exports can be unit-tested in isolation.
export {};
