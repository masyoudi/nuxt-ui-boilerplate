import type { WAFModule } from '../types';
import badBots from './bad-bots';
import clrfInjection from './clrf-injection';
import directoryTraversal from './directory-traversal';
import nosqlInjection from './nosql-injection';
import prototypePollution from './prototype-pollution';
import sqlInjection from './sql-injection';
import xmlInjection from './xml-injection';
import xss from './xss';

const modules: WAFModule[] = [
  {
    name: 'bad-bots',
    regex: badBots,
    inputs: ['ua']
  },
  {
    name: 'clrf-injection',
    regex: clrfInjection,
    inputs: ['url', 'body']
  },
  {
    name: 'directory-traversal',
    regex: directoryTraversal,
    inputs: ['url', 'body']
  },
  {
    name: 'nosql-injection',
    regex: nosqlInjection,
    inputs: ['url', 'ua', 'headers', 'body']
  },
  {
    name: 'prototype-pollution',
    regex: prototypePollution,
    inputs: ['url', 'ua', 'headers', 'body']
  },
  {
    name: 'sql-injection',
    regex: sqlInjection,
    inputs: ['url', 'ua', 'headers', 'body']
  },
  {
    name: 'xml-injection',
    regex: xmlInjection,
    inputs: ['body']
  },
  {
    name: 'xss',
    regex: xss,
    inputs: ['url', 'ua', 'headers', 'body']
  }
];

export default modules;
