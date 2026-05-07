export class ClienteError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'ClienteError'
    this.statusCode = statusCode
  }
}
