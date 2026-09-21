import type { H3Event, HTTPMethod } from 'h3';
import type { RouterContext } from 'rou3';

export type WAFName = 'clrf-injection'
  | 'directory-traversal'
  | 'nosql-injection'
  | 'prototype-pollution'
  | 'sql-injection'
  | 'xml-injection'
  | 'xss';

export type WAFInput = 'bodyKey' | 'bodyValue' | 'url' | 'headers' | 'ua';

export type WAFSeverity = 'critical' | 'warning' | 'notice';

export type WAFAction = 'block' | 'score';

export interface WAFInputValue {
  value: string;
  bodyPath?: string;
}

export type WAFInputs = Record<WAFInput, WAFInputValue[]>;

export interface WAFModule {
  name: WAFName;
  inputs: WAFInput[];
  regex: RegExp;
  severity: WAFSeverity;
  score: number;
  action: WAFAction;
};

export interface WAFAffectedInput {
  input: WAFInput;
  affected: WAFInputValue[];
}

export interface WAFBodyValue {
  path: string;
  value: string;
}

export interface WAFBodyInputs {
  keys: string[];
  values: WAFBodyValue[];
}

export interface WAFBodyFieldExclusions {
  'sql-injection'?: string[];
  'xss'?: string[];
}

export interface WAFResult {
  module: WAFName;
  severity: WAFSeverity;
  score: number;
  action: WAFAction;
  data: WAFAffectedInput[];
}

export interface WAFEvaluation {
  success: boolean;
  totalScore: number;
  anomalyThreshold: number;
  results: WAFResult[];
}

export type WAFRouteRules = {
  ignoreModules?: WAFName | WAFName[];
  method?: HTTPMethod | HTTPMethod[];
  anomalyThreshold?: number;
  /** Exact body paths or wildcard patterns, for example `description` or `items[*].description`. */
  excludeBodyFields?: WAFBodyFieldExclusions;
};

export type WAFIgnoreRoutes = {
  [key: string]: false | WAFRouteRules;
};

export interface WAFOptions {
  ignoreModules?: WAFName[];
  ignoreRoutes?: WAFIgnoreRoutes;
  anomalyThreshold?: number;
  /** Maximum accepted request body in bytes. */
  maxBodySize?: number;
}

export interface WAFCheckOptions {
  event: H3Event;
  modules: WAFModule[];
  router: RouterContext<{ payload: false | WAFRouteRules }>;
  inputs: WAFInputs;
  anomalyThreshold: number;
}
