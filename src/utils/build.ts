'use server';
import { isServer } from './helper.js';

export const build = async (styleSheet: string, filePath: string) => {
  /* istanbul ignore next */
  if (!isServer) return;
  const fs = await import('fs');
  try {
    if (fs.existsSync(filePath)) {
      const css = fs.readFileSync(filePath, 'utf-8');
      if (!css.includes(styleSheet)) {
        fs.appendFileSync(filePath, styleSheet, 'utf-8');
        if (process.argv.includes('--view')) {
          const { styleText } = await import('util');
          const line = styleText('gray', '─'.repeat(60));
          console.log('\n' + styleText(['green', 'bold'], '✓ extract...') + '\n\n' + styleText('cyan', styleSheet) + '\n' + line);
        }
      }
    }
    return;
  } catch (error) {
    console.error('Error writing to file:', error);
  }
};
