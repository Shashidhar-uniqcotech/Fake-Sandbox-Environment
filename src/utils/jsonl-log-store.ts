import fs from 'fs'
import path from 'path'

export class JsonlLogStore<T> {
  constructor(
    private readonly relativePath: string
  ) {}

  append(entry: T) {
    const absolutePath = path.join(
      process.cwd(),
      this.relativePath
    )

    fs.mkdirSync(
      path.dirname(absolutePath),
      { recursive: true }
    )

    fs.appendFileSync(
      absolutePath,
      `${JSON.stringify(entry)}\n`
    )
  }
}
