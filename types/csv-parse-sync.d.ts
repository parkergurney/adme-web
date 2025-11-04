declare module 'csv-parse/sync' {
  export interface Options {
    columns?: boolean | string[]
    skip_empty_lines?: boolean
  }
  export function parse<T = any>(input: string, options?: Options): T[]
}

