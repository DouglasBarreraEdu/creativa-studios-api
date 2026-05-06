export class PrecioError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'PrecioError'
    this.statusCode = statusCode
  }
}
