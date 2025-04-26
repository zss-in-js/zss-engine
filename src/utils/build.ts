'use server';
import { isServer } from './helper.js';

export const build = async (styleSheet: string, filePath: string, global?: string) => {
  if (!isServer) return;
  const fs = await import('fs');
  const { styleText } = await import('util');
  const message = global === '--global' ? styleText('underline', `✅Generated global CSS\n\n`) : styleText('underline', `✅Generated create CSS\n\n`);
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
