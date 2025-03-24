import fs from 'fs/promises';
import { globSync } from 'fs';

(async () => {
  const files = globSync('dist/**/*.js');

  await Promise.all(
    files.map(async file => {
      const newPath = file.replace(/\.js$/, '.mjs');
      await fs.rename(file, newPath);
    })
  );
  const buildFile = './dist/utils/build.mjs';
  try {
    let content = await fs.readFile(buildFile, 'utf-8');
    const lines = content.split('\n');

    // A first line delete
    lines.shift();
    const updatedContent = lines.join('\n');
    await fs.writeFile(buildFile, updatedContent);

    console.log('Removed the first line in build.mjs');
  } catch (error) {
    console.error('Error processing build.mjs:', error);
  } finally {
    console.log('ESM build process completed successfully');
  }
})();
