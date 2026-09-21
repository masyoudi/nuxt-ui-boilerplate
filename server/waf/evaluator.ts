import type {
  WAFAffectedInput,
  WAFBodyFieldExclusions,
  WAFEvaluation,
  WAFInputs,
  WAFInputValue,
  WAFModule,
  WAFName,
  WAFResult
} from './types';

const MAX_FINDINGS = 5;
const MAX_LOG_SAMPLE_LENGTH = 200;

function matches(regex: RegExp, value: string) {
  regex.lastIndex = 0;

  return regex.test(value);
}

function matchesBodyPath(path: string, pattern: string) {
  const source = pattern
    .split('*')
    .map((part) => part.replace(/[|\\{}()[\]^$+?.]/g, '\\$&'))
    .join('.*');

  return new RegExp(`^${source}$`).test(path);
}

function isExcludedBodyField(input: WAFInputValue, patterns: string[]) {
  const path = input.bodyPath;

  return typeof path === 'string' && patterns.some((pattern) => matchesBodyPath(path, pattern));
}

function findAffected(regex: RegExp, inputs: WAFInputValue[], limit: number, excludedBodyFields: string[]) {
  const affected: WAFInputValue[] = [];
  let matched = false;

  for (const input of inputs) {
    if (isExcludedBodyField(input, excludedBodyFields)) {
      continue;
    }

    if (input.value !== '' && matches(regex, input.value)) {
      matched = true;

      if (affected.length < limit) {
        affected.push({ ...input, value: input.value.slice(0, MAX_LOG_SAMPLE_LENGTH) });
      }
    }

    if (matched && affected.length >= limit) {
      break;
    }
  }

  return {
    matched,
    affected
  };
}

function getExcludedBodyFields(moduleName: WAFName, exclusions: WAFBodyFieldExclusions) {
  if (moduleName !== 'sql-injection' && moduleName !== 'xss') {
    return [];
  }

  return exclusions[moduleName] ?? [];
}

function inspectModule(
  module: WAFModule,
  inputs: WAFInputs,
  limit: number,
  bodyFieldExclusions: WAFBodyFieldExclusions
) {
  const data: WAFAffectedInput[] = [];
  let matched = false;
  let finding = 0;
  const excludedBodyFields = getExcludedBodyFields(module.name, bodyFieldExclusions);

  for (const input of module.inputs) {
    const inspected = findAffected(module.regex, inputs[input], limit - finding, excludedBodyFields);
    matched ||= inspected.matched;

    if (inspected.affected.length > 0) {
      data.push({ input, affected: inspected.affected });
      finding += inspected.affected.length;
    }
  }

  const result: WAFResult = {
    module: module.name,
    severity: module.severity,
    score: module.score,
    action: module.action,
    data
  };

  return {
    finding,
    result: matched ? result : undefined
  };
}

export function evaluateWAF(
  incomingModules: WAFModule[],
  inputs: WAFInputs,
  anomalyThreshold: number,
  bodyFieldExclusions: WAFBodyFieldExclusions = {}
): WAFEvaluation {
  const results: WAFResult[] = [];
  let finding = 0;
  let totalScore = 0;
  let blockOnMatch = false;

  for (const module of incomingModules) {
    const inspected = inspectModule(
      module,
      inputs,
      Math.max(0, MAX_FINDINGS - finding),
      bodyFieldExclusions
    );
    if (!inspected.result) {
      continue;
    }

    results.push(inspected.result);
    finding += inspected.finding;
    totalScore += module.score;
    blockOnMatch ||= module.action === 'block';
  }

  return {
    success: !blockOnMatch && totalScore < anomalyThreshold,
    totalScore,
    anomalyThreshold,
    results
  };
}
