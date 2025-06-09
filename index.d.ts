export interface TempWriteOptions {
  dir?: string;
  prefix?: string;
  cleanup?: boolean;
  mode?: number;
}

export interface TempCsvOptions extends TempWriteOptions {
  delimiter?: string;
}

export interface TempDirOptions {
  dir?: string;
  prefix?: string;
  cleanup?: boolean;
}

declare function tempWriteSync(
  content: string | Buffer,
  extension?: string,
  options?: TempWriteOptions
): string;

export declare function tempWriteJsonSync(
  obj: any,
  options?: TempWriteOptions
): string;

export declare function tempWriteCsvSync(
  data: any[][] | Record<string, any>[],
  options?: TempCsvOptions
): string;

export declare function tempDirSync(options?: TempDirOptions): string;

export declare function tempCopySync(
  sourcePath: string,
  extension?: string,
  options?: TempWriteOptions
): string;

export declare function tempWritePatternSync(
  content: string | Buffer,
  pattern: string,
  options?: TempWriteOptions
): string;

export declare function cleanupSync(filePath: string): boolean;

export declare function cleanupAllSync(): number;

export declare function getTempFiles(): string[];

export declare function excludeFromCleanup(filePath: string): void;

export declare function isTempFile(filePath: string): boolean;

export default tempWriteSync;