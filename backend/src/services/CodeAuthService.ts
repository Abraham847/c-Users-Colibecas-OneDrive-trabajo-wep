import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

interface CodeData {
  code: string;
  userId: string;
  userName: string;
  createdAt: string;
  usedAt?: string;
}

const CODES_FILE = path.join(__dirname, '../../data/codes.json');
const CODE_PREFIX = 'CH';

async function ensureFile() {
  try {
    await fs.mkdir(path.dirname(CODES_FILE), { recursive: true });
    await fs.access(CODES_FILE);
  } catch {
    await fs.writeFile(CODES_FILE, '[]', 'utf-8');
  }
}

async function readCodes(): Promise<CodeData[]> {
  await ensureFile();
  const raw = await fs.readFile(CODES_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeCodes(codes: CodeData[]) {
  await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2), 'utf-8');
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${CODE_PREFIX}-${part()}-${part()}`;
}

export class CodeAuthService {
  static async createCode(userName?: string): Promise<string> {
    const codes = await readCodes();
    let code: string;
    do {
      code = generateCode();
    } while (codes.some(c => c.code === code));

    codes.push({
      code,
      userId: uuidv4(),
      userName: userName || `Usuario ${codes.length + 1}`,
      createdAt: new Date().toISOString(),
    });

    await writeCodes(codes);
    return code;
  }

  static async createCodeForUser(userId: string, userName?: string): Promise<string> {
    const codes = await readCodes();
    let code: string;
    do {
      code = generateCode();
    } while (codes.some(c => c.code === code));

    codes.push({
      code,
      userId,
      userName: userName || `Usuario`,
      createdAt: new Date().toISOString(),
    });

    await writeCodes(codes);
    return code;
  }

  static async useCode(code: string): Promise<CodeData | null> {
    const codes = await readCodes();
    const entry = codes.find(c => c.code === code && !c.usedAt);
    if (!entry) return null;
    entry.usedAt = new Date().toISOString();
    await writeCodes(codes);
    return entry;
  }

  static async validateCode(code: string): Promise<boolean> {
    const codes = await readCodes();
    return codes.some(c => c.code === code && !c.usedAt);
  }

  static async getCodes(): Promise<CodeData[]> {
    return readCodes();
  }

  static async deleteCode(code: string): Promise<boolean> {
    const codes = await readCodes();
    const idx = codes.findIndex(c => c.code === code);
    if (idx === -1) return false;
    codes.splice(idx, 1);
    await writeCodes(codes);
    return true;
  }
}
