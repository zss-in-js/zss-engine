import { CreateStyle, CreateKeyframes } from '../index.js';

const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return Math.abs(hash);
}

function encodeBase36(num: number): string {
  let result = '';
  do {
    result = chars[num % 36] + result;
    num = Math.floor(num / 36);
  } while (num > 0);
  return result;
}

function getStartingChar(hash: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return chars[hash % chars.length];
}

export function genBase36Hash(object: CreateStyle | CreateKeyframes, n: number): string {
  const serialized = JSON.stringify(object);
  const hash = simpleHash(serialized);
  let base36Hash = encodeBase36(hash);
  const startingChar = getStartingChar(hash);

  while (base36Hash.length < n - 1) {
    base36Hash = chars[hash % chars.length] + base36Hash;
  }

  return startingChar + base36Hash.slice(0, n - 1);
}
