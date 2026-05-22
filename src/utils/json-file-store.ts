import fs from 'fs'
import path from 'path'

export class JsonFileStore<T> {
  constructor(
    private readonly relativePath: string,
    private readonly fallback: T
  ) {}

  read(): T {
    this.ensureFile()

    const raw = fs.readFileSync(
      this.absolutePath,
      'utf-8'
    )

    if (!raw.trim()) {
      return this.fallback
    }

    return JSON.parse(raw) as T
  }

  write(value: T) {
    this.ensureDirectory()

    fs.writeFileSync(
      this.absolutePath,
      JSON.stringify(value, null, 2)
    )
  }

  update(mutator: (current: T) => T) {
    const current = this.read()
    const next = mutator(current)
    this.write(next)

    return next
  }

  private get absolutePath() {
    return path.join(
      process.cwd(),
      this.relativePath
    )
  }

  private ensureDirectory() {
    fs.mkdirSync(
      path.dirname(this.absolutePath),
      { recursive: true }
    )
  }

  private ensureFile() {
    this.ensureDirectory()

    if (!fs.existsSync(this.absolutePath)) {
      this.write(this.fallback)
    }
  }
}
