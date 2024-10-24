import type { H3Event, HTTPMethod } from 'h3';
import type { RouterContext } from 'rou3';

export type WAFName = 'bad-bots'
  | 'clrf-injection'
  | 'directory-traversal'
  | 'nosql-injection'
  | 'prototype-pollution'
  | 'sql-injection'
  | 'xml-injection'
  | 'xss';

export type WAFInput = 'body' | 'url' | 'headers' | 'ua';

export interface WAFModule {
  name: WAFName;
  inputs: WAFInput[];
  regex: RegExp;
};

export type WAFRouteRules = {
  ignoreModules?: WAFName | WAFName[];
  method?: HTTPMethod | HTTPMethod[];
};

export type WAFIgnoreRoutes = {
  [key: string]: false | WAFRouteRules;
};

export interface WAFOptions {
  ignoreModules?: WAFName[];
  ignoreRoutes?: WAFIgnoreRoutes;
}

export interface WAFCheckOptions {
  event: H3Event;
  modules: WAFModule[];
  router: RouterContext<{ payload: false | WAFRouteRules }>;
  inputs: Record<WAFInput, string | string[]>;
}
