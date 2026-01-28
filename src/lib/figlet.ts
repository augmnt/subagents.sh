import figlet from 'figlet';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load ANSI Shadow font
const fontPath = join(process.cwd(), 'src/lib/fonts/ansi-shadow.flf');
const fontData = readFileSync(fontPath, 'utf8');
figlet.parseFont('ANSI Shadow', fontData);

export function generateAsciiText(text: string): string {
  return figlet.textSync(text, { font: 'ANSI Shadow' });
}
