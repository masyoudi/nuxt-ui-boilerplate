import type { AuthSessionData } from './session';

export * from 'h3';

declare module 'h3' {
  export interface H3EventContext {
    session?: AuthSessionData;
  }
}

export {};
