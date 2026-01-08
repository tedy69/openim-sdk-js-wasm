import { QueryExecResult } from '@jlongster/sql.js';
import { escapeString } from './escape';
import { isString } from './is';
import {
  KeyType,
  convertSnakeCaseToCamelCase,
  convertCamelCaseToSnakeCase,
} from './key';

export function converSqlExecResult(
  record: QueryExecResult,
  keyType: KeyType = 'CamelCase',
  booleanKeys: string[] = [],
  convertMap: Record<string, string> = {}
) {
  const { columns = [], values = [] } = record || {};
  const result: Record<string, unknown>[] = [];

  values.forEach(v => {
    const converted: Record<string, unknown> = {};
    columns.forEach((k, i) => {
      let ck = k;
      let cv: unknown = v[i];

      if (keyType === 'CamelCase') {
        ck = convertSnakeCaseToCamelCase(k);
      }
      if (keyType === 'SnakeCase') {
        ck = convertCamelCaseToSnakeCase(k);
      }
      if (booleanKeys.find(bk => bk === ck)) {
        cv = !!cv;
      }

      ck = convertMap[k] || ck;

      converted[ck] = cv;
    });
    result.push(converted);
  });

  return result;
}

export function convertToCamelCaseObject(obj: Record<string, unknown>) {
  const retObj: Record<string, unknown> = {};

  Object.keys(obj).forEach(k => {
    retObj[convertSnakeCaseToCamelCase(k)] = obj[k];
  });

  return retObj;
}

export function convertToSnakeCaseObject(
  obj: Record<string, unknown>,
  escape = true
) {
  const retObj: Record<string, unknown> = {};

  Object.keys(obj).forEach(k => {
    let value = obj[k];
    // Normalize JSON fields: convert empty strings to null for fields that should be JSON
    // This prevents Go unmarshaling errors when reading empty strings as JSON
    const jsonFields = [
      'attached_info',
      'attachedInfo',
      'ex',
      'local_ex',
      'localEx',
      'envelope_claimed_info',
      'envelopeClaimedInfo',
      'transfer_claimed_info',
      'transferClaimedInfo',
    ];
    const snakeKey = convertCamelCaseToSnakeCase(k);
    if (jsonFields.includes(k) || jsonFields.includes(snakeKey)) {
      if (value === '' || value === undefined) {
        value = null;
      }
    }
    if (escape && isString(value)) {
      value = escapeString(value as string).slice(1, -1);
    }
    retObj[convertCamelCaseToSnakeCase(k)] = value;
  });

  return retObj;
}

export function convertObjectField(
  obj: Record<string, unknown>,
  convertMap: Record<string, string> = {}
) {
  const ret: Record<string, any> = {};

  Object.keys(obj).forEach(k => {
    const nk = convertMap[k] || k;

    ret[nk] = obj[k];
  });

  return ret;
}
