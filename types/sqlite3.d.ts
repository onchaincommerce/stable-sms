declare module 'sqlite3' {
  export interface Database {
    all(sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): void;
    close(callback?: (err: Error | null) => void): void;
  }

  export const OPEN_READONLY: number;

  export interface DatabaseConstructor {
    new(filename: string, mode?: number, callback?: (err: Error | null) => void): Database;
  }

  export const Database: DatabaseConstructor;
} 