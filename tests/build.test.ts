/**
 * @jest-environment node
 */
import { build } from '../src/utils/build';
import fs from 'fs';

jest.mock('fs');

describe('build', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  const originalArgv = process.argv;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.argv = originalArgv;
  });

  test('writes new stylesheet to file when it does not exist in file', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('existing content');
    (fs.appendFileSync as jest.Mock).mockImplementation();

    await build('.new { color: blue; }', './test.css');

    expect(fs.appendFileSync).toHaveBeenCalledWith('./test.css', '.new { color: blue; }', 'utf-8');
  });

  test('does not write stylesheet if it already exists in file', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('.test { color: red; }');

    await build('.test { color: red; }', './test.css');

    expect(fs.appendFileSync).not.toHaveBeenCalled();
  });

  test('returns early if file does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await build('.test { color: red; }', './test.css');

    expect(fs.readFileSync).not.toHaveBeenCalled();
    expect(fs.appendFileSync).not.toHaveBeenCalled();
  });

  test('uses "defines💫" message with --global flag', async () => {
    process.argv.push('--view');

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('');
    (fs.appendFileSync as jest.Mock).mockImplementation();

    const styleSheet = '.global { color: green; }';
    await build(styleSheet, './test.css', '--global');

    expect(consoleLogSpy).toHaveBeenCalledWith(`defines💫:\n\n${styleSheet}`);
  });

  test('uses "props💫" message without --global flag', async () => {
    process.argv.push('--view');

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('');
    (fs.appendFileSync as jest.Mock).mockImplementation();

    const styleSheet = '.props { color: yellow; }';
    await build(styleSheet, './test.css');

    expect(consoleLogSpy).toHaveBeenCalledWith(`props💫:\n\n${styleSheet}`);
  });

  test('does not log when --view flag is not present', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('');
    (fs.appendFileSync as jest.Mock).mockImplementation();

    await build('.test { color: red; }', './test.css');

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  test('handles file system errors in existsSync', async () => {
    const error = new Error('File system error');
    (fs.existsSync as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await build('.test { color: red; }', './test.css');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error writing to file:', error);
  });

  test('handles file system errors in readFileSync', async () => {
    const error = new Error('Read error');
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await build('.test { color: red; }', './test.css');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error writing to file:', error);
  });

  test('handles file system errors in appendFileSync', async () => {
    const error = new Error('Write error');
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('existing');
    (fs.appendFileSync as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await build('.new { color: red; }', './test.css');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error writing to file:', error);
  });
});
