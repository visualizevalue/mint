import { jsonrepair } from 'jsonrepair'

export const parseJson = <T>(input: string): T | null => {
  let parsed: T | null = null

  try {
    parsed = JSON.parse(input)
  } catch (e) {}

  try {
    parsed = JSON.parse(jsonrepair(input))
  } catch (e: any) {
    console.warn(`Bad JSON: `, e?.message || e)
  }

  return parsed
}
