import { Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';

import { executar, obter, transacao } from '../banco/conexao';
import { ApiErro } from '../tipos/erros';
import { agoraIso } from '../util/serializacao';
import {
  gerarIdentificadorSessao,
  gerarTokenAcesso,
  gerarTokenRefresh,
  hashToken,
  nomeCookieRefresh,
  verificarTokenRefresh,
} from '../autenticacao/jwt';

interface UsuarioAuthLinha {
  id: string;
  nome: string;
  email: string;
  iniciais: string;
  senha_hash: string;
  tentativas_falha: number;
  bloqueado_ate: string | null;
}

interface SessaoAuthLinha {
  id: string;
  usuario_id: string;
  token_hash: string;
  expira_em: string;
  revogado_em: string | null;
}

interface LoginPayload {
  email: string;
  senha: string;
}

interface UsuarioResposta {
  id: string;
  nome: string;
  email: string;
  iniciais: string;
}

const minutosBloqueioFalha = 15;
const limiteFalhas = 5;

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensagem: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

export const roteadorAutenticacao = Router();

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

function montarRespostaUsuario(usuario: UsuarioAuthLinha): UsuarioResposta {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    iniciais: usuario.iniciais,
  };
}

function obterIpRequisicao(req: Request): string {
  const encaminhado = req.headers['x-forwarded-for'];
  if (typeof encaminhado === 'string') {
    return encaminhado.split(',')[0]?.trim() ?? req.ip ?? 'desconhecido';
  }

  return req.ip ?? 'desconhecido';
}

function cookieSegura(): boolean {
  return process.env.NODE_ENV === 'production';
}

function definirCookieRefresh(res: Response, tokenRefresh: string): void {
  res.cookie(nomeCookieRefresh, tokenRefresh, {
    httpOnly: true,
    secure: cookieSegura(),
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function limparCookieRefresh(res: Response): void {
  res.clearCookie(nomeCookieRefresh, {
    httpOnly: true,
    secure: cookieSegura(),
    sameSite: 'strict',
    path: '/api/auth',
  });
}

async function registrarNovaSessao(
  usuario: UsuarioAuthLinha,
  req: Request,
): Promise<{ tokenAcesso: string; tokenRefresh: string }> {
  const identificadorSessao = gerarIdentificadorSessao();
  const tokenRefresh = gerarTokenRefresh(usuario.id, usuario.email, identificadorSessao);
  const payloadRefresh = verificarTokenRefresh(tokenRefresh);

  if (!payloadRefresh.exp) {
    throw new ApiErro('Falha ao criar sessão.', 500);
  }

  await executar(
    `INSERT INTO sessoes_auth (id, usuario_id, token_hash, expira_em, revogado_em, ip_origem, user_agent, criado_em, atualizado_em)
     VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
    [
      identificadorSessao,
      usuario.id,
      hashToken(tokenRefresh),
      new Date(payloadRefresh.exp * 1000).toISOString(),
      obterIpRequisicao(req),
      String(req.headers['user-agent'] ?? '').slice(0, 255),
      agoraIso(),
      agoraIso(),
    ],
  );

  return {
    tokenAcesso: gerarTokenAcesso(usuario.id, usuario.email),
    tokenRefresh,
  };
}

async function buscarUsuarioPorEmail(email: string): Promise<UsuarioAuthLinha | null> {
  return obter<UsuarioAuthLinha>(
    `SELECT u.id, u.nome, u.email, u.iniciais, a.senha_hash, a.tentativas_falha, a.bloqueado_ate
     FROM usuarios u
     JOIN usuarios_auth a ON a.usuario_id = u.id
     WHERE LOWER(u.email) = ?`,
    [normalizarEmail(email)],
  );
}

async function incrementarTentativasFalha(usuario: UsuarioAuthLinha): Promise<void> {
  const proximaTentativa = usuario.tentativas_falha + 1;
  const bloqueadoAte =
    proximaTentativa >= limiteFalhas
      ? new Date(Date.now() + minutosBloqueioFalha * 60 * 1000).toISOString()
      : null;

  await executar(
    `UPDATE usuarios_auth
     SET tentativas_falha = ?, bloqueado_ate = ?, atualizado_em = ?
     WHERE usuario_id = ?`,
    [proximaTentativa >= limiteFalhas ? 0 : proximaTentativa, bloqueadoAte, agoraIso(), usuario.id],
  );
}

async function resetarTentativasFalha(usuarioId: string): Promise<void> {
  await executar(
    `UPDATE usuarios_auth
     SET tentativas_falha = 0, bloqueado_ate = NULL, ultimo_login_em = ?, atualizado_em = ?
     WHERE usuario_id = ?`,
    [agoraIso(), agoraIso(), usuarioId],
  );
}

roteadorAutenticacao.post('/login', limiteLogin, async (req, res, next) => {
  try {
    const dados = req.body as Partial<LoginPayload>;
    const email = String(dados.email ?? '').trim();
    const senha = String(dados.senha ?? '');

    if (!email || !senha) {
      throw new ApiErro('Credenciais inválidas.', 401);
    }

    const usuario = await buscarUsuarioPorEmail(email);
    if (!usuario) {
      throw new ApiErro('Credenciais inválidas.', 401);
    }

    if (usuario.bloqueado_ate && new Date(usuario.bloqueado_ate).getTime() > Date.now()) {
      throw new ApiErro('Conta temporariamente bloqueada. Tente novamente mais tarde.', 423);
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      await incrementarTentativasFalha(usuario);
      throw new ApiErro('Credenciais inválidas.', 401);
    }

    await resetarTentativasFalha(usuario.id);

    const sessao = await registrarNovaSessao(usuario, req);
    definirCookieRefresh(res, sessao.tokenRefresh);

    res.json({
      tokenAcesso: sessao.tokenAcesso,
      usuario: montarRespostaUsuario(usuario),
    });
  } catch (erro) {
    next(erro);
  }
});

roteadorAutenticacao.post('/refresh', async (req, res, next) => {
  try {
    const tokenRefreshAtual = req.cookies?.[nomeCookieRefresh] as string | undefined;
    if (!tokenRefreshAtual) {
      throw new ApiErro('Sessão inválida.', 401);
    }

    const payload = verificarTokenRefresh(tokenRefreshAtual);
    if (payload.tipo !== 'refresh' || !payload.usuarioId || !payload.email) {
      throw new ApiErro('Sessão inválida.', 401);
    }

    const hashAtual = hashToken(tokenRefreshAtual);
    const sessao = await obter<SessaoAuthLinha>(
      `SELECT id, usuario_id, token_hash, expira_em, revogado_em
       FROM sessoes_auth
       WHERE token_hash = ?`,
      [hashAtual],
    );

    if (!sessao || sessao.revogado_em || new Date(sessao.expira_em).getTime() <= Date.now()) {
      throw new ApiErro('Sessão inválida.', 401);
    }

    const usuario = await buscarUsuarioPorEmail(payload.email);
    if (!usuario || usuario.id !== payload.usuarioId) {
      throw new ApiErro('Sessão inválida.', 401);
    }

    const novaSessao = await transacao(async () => {
      await executar('UPDATE sessoes_auth SET revogado_em = ?, atualizado_em = ? WHERE id = ?', [
        agoraIso(),
        agoraIso(),
        sessao.id,
      ]);
      return registrarNovaSessao(usuario, req);
    });

    definirCookieRefresh(res, novaSessao.tokenRefresh);
    res.json({
      tokenAcesso: novaSessao.tokenAcesso,
      usuario: montarRespostaUsuario(usuario),
    });
  } catch (erro) {
    limparCookieRefresh(res);
    next(erro);
  }
});

roteadorAutenticacao.post('/logout', async (req, res, next) => {
  try {
    const tokenRefreshAtual = req.cookies?.[nomeCookieRefresh] as string | undefined;

    if (tokenRefreshAtual) {
      await executar(
        `UPDATE sessoes_auth
         SET revogado_em = COALESCE(revogado_em, ?), atualizado_em = ?
         WHERE token_hash = ?`,
        [agoraIso(), agoraIso(), hashToken(tokenRefreshAtual)],
      );
    }

    limparCookieRefresh(res);
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});
