import fs from 'fs/promises';

(async () => {
  const buildFile = './dist/esm/utils/build.js';
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
