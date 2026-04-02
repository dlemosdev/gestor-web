import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import { autenticarRequisicao } from './autenticacao/middleware-autenticacao';
import { inicializarBanco } from './banco/inicializar-banco';
import { roteadorAutenticacao } from './rotas/autenticacao';
import { roteador } from './rotas/api';
import { ApiErro } from './tipos/erros';

const porta = Number(process.env.PORTA_API || 3333);
const origemFrontend = process.env.ORIGEM_FRONTEND || 'http://localhost:4200';

const app = express();

app.use(
  cors({
    origin: origemFrontend,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', servico: 'gestor-api' });
});

app.use('/api/auth', roteadorAutenticacao);
app.use('/api', autenticarRequisicao, roteador);

app.use((erro: Error, _req: Request, res: Response, _next: NextFunction) => {
  const erroApi = erro as Partial<ApiErro>;
  res.status(erroApi.statusCode ?? 500).json({
    mensagem: erro.message || 'Erro interno do servidor.',
  });
});

async function iniciarServidor(): Promise<void> {
  await inicializarBanco();

  app.listen(porta, () => {
    // eslint-disable-next-line no-console
    console.log(`Gestor API disponível em http://localhost:${porta}`);
  });
}

iniciarServidor().catch((erro) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao iniciar API:', erro);
  process.exit(1);
});
