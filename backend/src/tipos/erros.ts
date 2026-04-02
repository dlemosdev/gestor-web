export class ApiErro extends Error {
  readonly statusCode: number;

  constructor(mensagem: string, statusCode = 400) {
    super(mensagem);
    this.statusCode = statusCode;
  }
}
