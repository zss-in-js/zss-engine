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

/**
 * This code includes a modified implementation of MurmurHash3,
 * based on the original public domain source by Austin Appleby.
 * Original repository: http://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
 */

// MurmurHash3 32-bit implementation
function murmurhash3_32(str: string, seed: number): number {
  let h = seed;
  const len = str.length;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const r1 = 15;
  const r2 = 13;
  const m = 5;
  const n = 0xe6546b64;

  let i = 0;
  while (i < len - 3) {
    let k =
      (str.charCodeAt(i) & 0xff) | ((str.charCodeAt(i + 1) & 0xff) << 8) | ((str.charCodeAt(i + 2) & 0xff) << 16) | ((str.charCodeAt(i + 3) & 0xff) << 24);

    k = Math.imul(k, c1);
    k = (k << r1) | (k >>> (32 - r1));
    k = Math.imul(k, c2);

    h ^= k;
    h = (h << r2) | (h >>> (32 - r2));
    h = Math.imul(h, m) + n;

    i += 4;
  }

  let k = 0;
  switch (len % 4) {
    case 3:
      k ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      k ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      k ^= str.charCodeAt(i) & 0xff;
      k = Math.imul(k, c1);
      k = (k << r1) | (k >>> (32 - r1));
      k = Math.imul(k, c2);
      h ^= k;
  }

  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  return h >>> 0;
}

// MurmurHash3 + toString36 object hash
export function genBase36Hash(obj: {}, seed: number, length: number): string {
  const normalized = deepNormalize(obj);
  const hashValue = murmurhash3_32(normalized, seed);
  const hashStr = hashValue.toString(36);
  const firstChar = 'x';

  let result = firstChar + hashStr;

  if (result.length > length) {
    // Truncate if too long
    result = result.slice(0, length);
  } else if (result.length < length) {
    // Padding if too short
    const paddingNeeded = length - result.length;
    const paddingChars = '0123456789abcdefghijklmnopqrstuvwxyz';

    // Deterministically generate padding characters using hash values
    let paddingHash = hashValue;
    for (let i = 0; i < paddingNeeded; i++) {
      // Linear congruence method
      paddingHash = paddingHash * 1103515245 + 12345;
      const paddingChar = paddingChars[Math.abs(paddingHash) % 36];
      result += paddingChar;
    }
  }

  return result;
}
