import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Usuario } from '../../models/usuario.model';
import { apiUrlBase } from '../config/api.config';

interface RespostaAutenticacao {
  tokenAcesso: string;
  usuario: Usuario;
}

interface RespostaLogin {
  requerSegundoFator: boolean;
  tokenDesafio?: string;
  tokenAcesso?: string;
  usuario?: Usuario;
}

@Injectable({
  providedIn: 'root',
})
export class AutenticacaoService {
  private readonly urlAutenticacao = `${apiUrlBase}/auth`;

  private readonly tokenAcessoInterno = signal<string | null>(null);
  private readonly usuarioAutenticadoInterno = signal<Usuario | null>(null);
  private readonly inicializandoSessaoInterno = signal(false);

  readonly tokenAcesso = this.tokenAcessoInterno.asReadonly();
  readonly usuarioAutenticado = this.usuarioAutenticadoInterno.asReadonly();
  readonly inicializandoSessao = this.inicializandoSessaoInterno.asReadonly();

  private promessaRenovacaoSessao: Promise<boolean> | null = null;

  constructor(private readonly http: HttpClient) {}

  async autenticar(email: string, senha: string): Promise<{ requerSegundoFator: boolean; tokenDesafio: string | null }> {
    const resposta = await firstValueFrom(
      this.http.post<RespostaLogin>(
        `${this.urlAutenticacao}/login`,
        { email: email.trim().toLowerCase(), senha },
        { withCredentials: true },
      ),
    );

    if (resposta.requerSegundoFator) {
      if (!resposta.tokenDesafio) {
        throw new Error('Resposta de autenticação inválida.');
      }

      return {
        requerSegundoFator: true,
        tokenDesafio: resposta.tokenDesafio,
      };
    }

    if (!resposta.tokenAcesso || !resposta.usuario) {
      throw new Error('Resposta de autenticação inválida.');
    }

    this.tokenAcessoInterno.set(resposta.tokenAcesso);
    this.usuarioAutenticadoInterno.set(resposta.usuario);

    return {
      requerSegundoFator: false,
      tokenDesafio: null,
    };
  }

  async validarSegundoFator(tokenDesafio: string, codigo: string): Promise<void> {
    const resposta = await firstValueFrom(
      this.http.post<RespostaAutenticacao>(
        `${this.urlAutenticacao}/2fa/validar`,
        { tokenDesafio, codigo },
        { withCredentials: true },
      ),
    );

    this.tokenAcessoInterno.set(resposta.tokenAcesso);
    this.usuarioAutenticadoInterno.set(resposta.usuario);
  }

  async garantirSessaoAtiva(): Promise<boolean> {
    if (this.tokenAcessoInterno()) {
      return true;
    }

    if (this.promessaRenovacaoSessao) {
      return this.promessaRenovacaoSessao;
    }

    this.promessaRenovacaoSessao = this.renovarSessao().finally(() => {
      this.promessaRenovacaoSessao = null;
    });

    return this.promessaRenovacaoSessao;
  }

  async encerrarSessao(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>(`${this.urlAutenticacao}/logout`, {}, { withCredentials: true }));
    } finally {
      this.limparSessaoLocal();
    }
  }

  limparSessaoLocal(): void {
    this.tokenAcessoInterno.set(null);
    this.usuarioAutenticadoInterno.set(null);
  }

  private async renovarSessao(): Promise<boolean> {
    this.inicializandoSessaoInterno.set(true);

    try {
      const resposta = await firstValueFrom(
        this.http.post<RespostaAutenticacao>(`${this.urlAutenticacao}/refresh`, {}, { withCredentials: true }),
      );

      this.tokenAcessoInterno.set(resposta.tokenAcesso);
      this.usuarioAutenticadoInterno.set(resposta.usuario);
      return true;
    } catch {
      this.limparSessaoLocal();
      return false;
    } finally {
      this.inicializandoSessaoInterno.set(false);
    }
  }
}
