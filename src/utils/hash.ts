import { TextEncoder } from 'util';
const { asUintN } = BigInt;

function deepNormalize(obj: unknown): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj !== 'object') return String(obj);

  if (Array.isArray(obj)) {
    return '[' + obj.map(deepNormalize).join(',') + ']';
  }

  const recordObj = obj as Record<string, unknown>;
  const keys = Object.keys(recordObj).sort();
  const pairs = keys.map(key => `"${key}":${deepNormalize(recordObj[key])}`);
  return '{' + pairs.join(',') + '}';
}

// 64-bit unsigned rotate left
function rotl64(x: bigint, r: number): bigint {
  const shift = BigInt(r);
  return asUintN(64, (x << shift) | (x >> (64n - shift)));
}

// 64-bit finalization mix
function fmix64(k: bigint): bigint {
  k ^= k >> 33n;
  k = asUintN(64, k * 0xff51afd7ed558ccdn);
  k ^= k >> 33n;
  k = asUintN(64, k * 0xc4ceb9fe1a85ec53n);
  k ^= k >> 33n;
  return k;
}

/**
 * MurmurHash3 x64-128 (x64 variant).
 * Ported from Austin Appleby's original C++ implementation.
 * https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
 */
function murmurhash3_x64_128(str: string, seed: number): bigint {
  let h1 = asUintN(64, BigInt(seed));
  let h2 = asUintN(64, BigInt(seed));

  const c1 = 0x87c37b91114253d5n;
  const c2 = 0x4cf5ad432745937fn;

  const encoder = new TextEncoder();
  const key = encoder.encode(str);
  const len = key.length;
  const nblocks = Math.floor(len / 16);
  const view = new DataView(key.buffer, key.byteOffset, key.byteLength);

  for (let i = 0; i < nblocks; i++) {
    const i16 = i * 16;
    let k1 = view.getBigUint64(i16, true);
    let k2 = view.getBigUint64(i16 + 8, true);

    k1 = asUintN(64, k1 * c1);
    k1 = rotl64(k1, 31);
    k1 = asUintN(64, k1 * c2);
    h1 ^= k1;

    h1 = rotl64(h1, 27);
    h1 = asUintN(64, h1 + h2);
    h1 = asUintN(64, h1 * 5n + 0x52dce729n);

    k2 = asUintN(64, k2 * c2);
    k2 = rotl64(k2, 33);
    k2 = asUintN(64, k2 * c1);
    h2 ^= k2;

    h2 = rotl64(h2, 31);
    h2 = asUintN(64, h2 + h1);
    h2 = asUintN(64, h2 * 5n + 0x38495ab5n);
  }

  // tail
  const tailIndex = nblocks * 16;
  let k1 = 0n;
  let k2 = 0n;

  switch (len & 15) {
    case 15:
      k2 ^= BigInt(key[tailIndex + 14]) << 48n;
    case 14:
      k2 ^= BigInt(key[tailIndex + 13]) << 40n;
    case 13:
      k2 ^= BigInt(key[tailIndex + 12]) << 32n;
    case 12:
      k2 ^= BigInt(key[tailIndex + 11]) << 24n;
    case 11:
      k2 ^= BigInt(key[tailIndex + 10]) << 16n;
    case 10:
      k2 ^= BigInt(key[tailIndex + 9]) << 8n;
    case 9:
      k2 ^= BigInt(key[tailIndex + 8]);
      k2 = asUintN(64, k2 * c2);
      k2 = rotl64(k2, 33);
      k2 = asUintN(64, k2 * c1);
      h2 ^= k2;
    // fallthrough
    case 8:
      k1 ^= BigInt(key[tailIndex + 7]) << 56n;
    case 7:
      k1 ^= BigInt(key[tailIndex + 6]) << 48n;
    case 6:
      k1 ^= BigInt(key[tailIndex + 5]) << 40n;
    case 5:
      k1 ^= BigInt(key[tailIndex + 4]) << 32n;
    case 4:
      k1 ^= BigInt(key[tailIndex + 3]) << 24n;
    case 3:
      k1 ^= BigInt(key[tailIndex + 2]) << 16n;
    case 2:
      k1 ^= BigInt(key[tailIndex + 1]) << 8n;
    case 1:
      k1 ^= BigInt(key[tailIndex + 0]);
      k1 = asUintN(64, k1 * c1);
      k1 = rotl64(k1, 31);
      k1 = asUintN(64, k1 * c2);
      h1 ^= k1;
  }

  // finalization
  h1 ^= BigInt(len);
  h2 ^= BigInt(len);

  h1 = asUintN(64, h1 + h2);
  h2 = asUintN(64, h2 + h1);

  h1 = fmix64(h1);
  h2 = fmix64(h2);

  h1 = asUintN(64, h1 + h2);
  h2 = asUintN(64, h2 + h1);

  // Combine the two 64-bit hashes into one. XOR is a standard way to do this.
  return asUintN(64, h1 ^ h2);
}

// MurmurHash3 + toString36 object hash
export function genBase36Hash(obj: {}, seed: number, length: number): string {
  const normalized = deepNormalize(obj);
  const hashValue = murmurhash3_x64_128(normalized, seed);

  // A 64-bit hash can be up to approx. 13 chars in base36.
  // This avoids the need for loops or padding for typical lengths.
  const hash = hashValue.toString(36);

  return 'x' + hash.slice(-(length - 1));
}
