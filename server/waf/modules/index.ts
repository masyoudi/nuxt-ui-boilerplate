import type { WAFModule } from '../types';
import clrfInjection from './clrf-injection';
import directoryTraversal from './directory-traversal';
import nosqlInjection from './nosql-injection';
import prototypePollution from './prototype-pollution';
import sqlInjection from './sql-injection';
import xmlInjection from './xml-injection';
import xss from './xss';

const modules: WAFModule[] = [
  {
    name: 'clrf-injection',
    regex: clrfInjection,
    inputs: ['url', 'bodyValue'],
    severity: 'critical',
    score: 5,
    action: 'block'
  },
  {
    name: 'directory-traversal',
    regex: directoryTraversal,
    inputs: ['url', 'bodyValue'],
    severity: 'warning',
    score: 3,
    action: 'score'
  },
  {
    name: 'nosql-injection',
    regex: nosqlInjection,
    inputs: ['url', 'bodyKey', 'bodyValue'],
    severity: 'warning',
    score: 3,
    action: 'score'
  },
  {
    name: 'prototype-pollution',
    regex: prototypePollution,
    inputs: ['url', 'bodyKey'],
    severity: 'critical',
    score: 5,
    action: 'block'
  },
  {
    name: 'sql-injection',
    regex: sqlInjection,
    inputs: ['url', 'bodyValue'],
    severity: 'warning',
    score: 3,
    action: 'score'
  },
  {
    name: 'xml-injection',
    regex: xmlInjection,
    inputs: ['bodyValue'],
    severity: 'critical',
    score: 5,
    action: 'block'
  },
  {
    name: 'xss',
    regex: xss,
    inputs: ['url', 'bodyValue'],
    severity: 'warning',
    score: 3,
    action: 'score'
  }
];

export default modules;
