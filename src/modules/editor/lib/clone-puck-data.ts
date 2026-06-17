import type { Data } from '@measured/puck'

export function clonePuckData(data: Data): Data {
  return JSON.parse(JSON.stringify(data)) as Data
}

export function puckDataEqual(a: Data, b: Data): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
