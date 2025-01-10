const styleSheets: Record<string, string> = {};

export function injectServerCSS(hash: string, sheet: string) {
  styleSheets[hash] = sheet;
}

export function getServerCSS(): string {
  return Object.values(styleSheets).join('\n');
}
