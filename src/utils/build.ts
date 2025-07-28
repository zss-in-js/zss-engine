'use server';
import { isServer } from './helper.js';

export const build = async (styleSheet: string, filePath: string, global?: string) => {
  if (!isServer) return;
  const fs = await import('fs');
  const message = global === '--global' ? `💫 css.global(...):\n\n` : `💫 css.props(...):\n\n`;
  try {
    if (fs.existsSync(filePath)) {
      const cssData = fs.readFileSync(filePath, 'utf-8');
      if (!cssData.includes(styleSheet)) {
        fs.appendFileSync(filePath, styleSheet, 'utf-8');
        if (process.argv.includes('--view')) console.log(message + styleSheet);
      }
    }
    return;
  } catch (error) {
    console.error('Error writing to file:', error);
  }
};
