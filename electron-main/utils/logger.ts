// utils/logger.ts
import fs from 'fs';
import os from 'os';
import path from 'path';

let logStream: fs.WriteStream;
let logFilePath: string;

/**
 * Initializes the logger by creating a writable log stream.
 */
export function setupLogger() {
  logFilePath = path.join(os.tmpdir(), 'clipforge-log.txt');
  logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  console.log('✅ Logger initialized at', logFilePath);
}

/**
 * Logs a message to both the console and the log file.
 * @param args Messages to log
 */
export function log(...args: any[]) {
  if (!logStream) {
    console.error('Logger not initialized.');
    return;
  }
  const message = `[${new Date().toISOString()}] ` + args.join(' ');
  logStream.write(message + '\n');
  console.log('[LOG]', ...args);
}

/**
 * Returns the path of the log file.
 */
export function getLogFilePath(): string {
  if (!logFilePath) {
    throw new Error('Logger not initialized. Call setupLogger() first.');
  }
  return logFilePath;
}
