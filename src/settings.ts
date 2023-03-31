import { ISchema, IDialect, IResource, IPackage } from './interfaces'

// Genearl

export const PACKAGE_PATH = 'datapackage.json'
export const FORMATS = ['csv', 'xlsx', 'jsonl']
export const HASHINGS = ['md5', 'sha256']
export const ENCODINGS = ['utf-8', 'iso-8859-1']
export const MISSING_VALUES = ['""', 'n/a', 'na', 'N/A', 'NA']
export const TRUE_VALUES = ['true', 'TRUE', 'yes', 'YES', '1']
export const FALSE_VALUES = ['false', 'FALSE', 'no', 'NO', '0']
export const METADATA_FORMATS = ['yaml', 'json']
export const METADATA_TYPES = ['resource', 'dialect', 'schema', 'checklist', 'pipeline']

// Defaults

export const DEFAULT_BASEPATH = '/api'
export const DEFAULT_PORT = 4040
export const DEFAULT_EXPORT_FORMAT = 'yaml'
export const DEFAULT_FIELD_CONFIDENCE = 0.9
export const DEFAULT_MISSING_VALUES = ['""']
export const DEFAULT_HEADER = true
export const DEFAULT_HEADER_JOIN = ' '
export const DEFAULT_HEADER_CASE = true
export const DEFAULT_DECIMAL_CHAR = '.'
export const DEFAULT_GROUP_CHAR = ','
export const DEFAULT_BARE_NUMBER = true
export const DEFAULT_DELIMITER = ','
export const DEFAULT_LINE_TERMINATOR = '\\r\\n'
export const DEFAULT_QUOTE_CHAR = '"'
export const DEFAULT_DOUBLE_QUOTE = true
export const DEFAULT_ESCAPE_CHAR = undefined
export const DEFAULT_NULL_SEQUENCE = undefined
export const DEFAULT_SKIP_INITIAL_SPACE = false
export const DEFAULT_COMMENT_CHAR = undefined
export const DEFAULT_BUTTON_COLOR = 'info'
export const DEFAULT_BUTTON_VARIANT = 'outlined'
export const DEFAULT_PRIMARY_BUTTON_VARIANT = 'contained'

// Initials

export const INITIAL_SCHEMA: ISchema = { fields: [] }
export const INITIAL_DIALECT: IDialect = {}
export const INITIAL_RESOURCE: IResource = { name: 'name', type: 'table', path: 'path' }
export const INITIAL_PACKAGE: IPackage = { resources: [] }

// Structures

export const FIELDS = {
  any: {
    formats: ['default'],
    constraints: ['required', 'enum'],
  },
  array: {
    formats: ['default'],
    constraints: ['required', 'enum', 'pattern', 'minLength', 'maxLength'],
  },
  boolean: {
    formats: ['default'],
    constraints: ['required', 'enum'],
  },
  date: {
    formats: ['default', '*'],
    constraints: ['required', 'enum', 'minimum', 'maximum'],
  },
  datetime: {
    formats: ['default', '*'],
    constraints: ['required', 'enum', 'minimum', 'maximum'],
  },
  duration: {
    formats: ['default'],
    constraints: ['required', 'enum'],
  },
  geojson: {
    formats: ['default', 'topojson'],
    constraints: ['required', 'enum'],
  },
  geopoint: {
    formats: ['default'],
    constraints: ['required', 'enum'],
  },
  integer: {
    formats: ['default'],
    constraints: ['required', 'enum', 'minimum', 'maximum'],
  },
  number: {
    formats: ['default'],
    constraints: ['required', 'enum', 'minimum', 'maximum'],
  },
  string: {
    formats: ['default', 'email', 'uri', 'binary', 'uuid'],
    constraints: ['required', 'enum', 'pattern', 'minLength', 'maxLength'],
  },
  object: {
    formats: ['default'],
    constraints: ['required', 'enum', 'minLength', 'maxLength'],
    extraProperties: [],
  },
  time: {
    formats: ['default', '*'],
    constraints: ['required', 'enum', 'minimum', 'maximum'],
    extraProperties: [],
  },
  year: {
    formats: ['default'],
    constraints: ['required', 'enum', 'minimum', 'maximum'],
  },
  yearmonth: {
    formats: ['default'],
    constraints: ['required', 'enum', 'minimum', 'maximum'],
  },
}

export const CHECKS = [
  'duplicate-row',
  'deviated-value',
  'truncated-value',
  'forbidden-value',
  'sequential-value',
  'row-constraint',
  'table-dimensions',
]

export const STEPS = [
  'field-add',
  'field-filter',
  'field-move',
  'field-remove',
  'field-split',
  'field-unpack',
  'field-update',
]
