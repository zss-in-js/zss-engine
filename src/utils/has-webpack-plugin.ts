import fs from 'fs';
import path from 'path';

function findPnpmPath(arg1: string, arg2: string): string {
  const pnpmPath = path.join(process.cwd(), 'node_modules/.pnpm');
  const pnpmDir = fs.readdirSync(pnpmPath).find(dir => dir.startsWith(arg1));

  if (!pnpmDir) {
    throw new Error(`Could not find ${arg1} package in pnpm directory`);
  }

  return path.join(pnpmPath, pnpmDir, arg2);
}

export function hasWebpackPlugin(): boolean {
  try {
    const isPnpm = fs.existsSync(path.join(process.cwd(), 'node_modules/.pnpm'));

    if (isPnpm) {
      // pnpm
      try {
        const webpackPluginPath = findPnpmPath('@plumeria+webpack-plugin@', 'node_modules/@plumeria/webpack-plugin');
        return fs.existsSync(webpackPluginPath);
      } catch {
        return false;
      }
    } else {
      // npm or yarn
      const webpackPluginPath = path.join(process.cwd(), 'node_modules/@plumeria/webpack-plugin');
      return fs.existsSync(webpackPluginPath);
    }
  } catch {
    return false;
  }
}
