import { jsonrepair } from 'jsonrepair'

export const parseJson = <T>(input: string): T|object => {
  let parsed: T|object = {}

  try {
    parsed = JSON.parse(input)
  } catch (e) {}

  try {
    parsed = JSON.parse(jsonrepair(input))
  } catch (e) {
    console.error(`Bad json`, e)
  }

  return parsed
}
