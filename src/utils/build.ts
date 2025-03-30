'use server';
import fs from 'fs';
import { styleText } from 'util';
import { isServer } from './helper.js';

export const build = async (styleSheet: string, filePath: string, global?: string) => {
  if (!isServer) return;

  const message = global === '--global' ? styleText('underline', `✅Generated global CSS\n\n`) : styleText('underline', `✅Generated create CSS\n\n`);
  try {
    if (fs.existsSync(filePath)) {
      const cssData = fs.readFileSync(filePath, 'utf-8');
      if (!cssData.includes(styleSheet)) {
        fs.appendFileSync(filePath, styleSheet, 'utf-8');
        if (process.argv.includes('--log')) console.log(message + styleSheet);
      }
    }
    return;
  } catch (error) {
    console.error('Error writing to file:', error);
  }
};
