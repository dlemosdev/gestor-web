import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutenticacaoService } from '../../../core/services/autenticacao.service';
import { BotaoUiComponent } from '../../../shared/ui/botao/botao-ui.component';

type EtapaLogin = 'credenciais' | 'segundo-fator';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex min-h-screen items-center justify-center bg-fundo px-4 py-8">
      <section class="w-full max-w-md rounded-3xl border border-borda bg-superficie p-6 shadow-[var(--sombra-card)] sm:p-7">
        <header class="mb-6 text-center">
          <img src="assets/marca/gestor-logo.svg" alt="Gestor" class="mx-auto h-11 w-auto" />
          <h1 class="mt-4 text-2xl font-semibold text-cor-texto">{{ tituloEtapa() }}</h1>
          <p class="mt-1 text-sm text-cor-texto-secundaria">{{ subtituloEtapa() }}</p>
        </header>

        @if (etapaAtual() === 'credenciais') {
          <form class="space-y-4" [formGroup]="formularioLogin" (ngSubmit)="enviarCredenciais()">
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">E-mail</span>
              <input
                type="email"
                formControlName="email"
                placeholder="seuemail@empresa.com"
                autocomplete="email"
                class="h-11 rounded-xl border border-borda bg-superficie px-3.5 text-sm text-cor-texto outline-none transition placeholder:text-cor-texto-suave focus:border-primaria focus:ring-2 focus:ring-primaria/20"
              />
            </label>

            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Senha</span>
              <input
                type="password"
                formControlName="senha"
                placeholder="Digite sua senha"
                autocomplete="current-password"
                class="h-11 rounded-xl border border-borda bg-superficie px-3.5 text-sm text-cor-texto outline-none transition placeholder:text-cor-texto-suave focus:border-primaria focus:ring-2 focus:ring-primaria/20"
              />
            </label>

            @if (mensagemErro()) {
              <p class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{{ mensagemErro() }}</p>
            }

            <app-botao-ui
              class="block"
              [texto]="carregando() ? 'Enviando codigo...' : 'Continuar'"
              [desabilitado]="formularioLogin.invalid || carregando()"
              [larguraTotal]="true"
              [tipo]="'submit'"
            />
          </form>
        }

        @if (etapaAtual() === 'segundo-fator') {
          <form class="space-y-4" [formGroup]="formularioCodigo" (ngSubmit)="validarCodigo()">
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Codigo de 6 digitos</span>
              <input
                type="text"
                inputmode="numeric"
                maxlength="6"
                formControlName="codigo"
                placeholder="000000"
                autocomplete="one-time-code"
                class="h-11 rounded-xl border border-borda bg-superficie px-3.5 text-center text-lg tracking-[0.3em] text-cor-texto outline-none transition placeholder:tracking-normal placeholder:text-cor-texto-suave focus:border-primaria focus:ring-2 focus:ring-primaria/20"
              />
            </label>

            @if (mensagemErro()) {
              <p class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{{ mensagemErro() }}</p>
            }

            <div class="grid grid-cols-2 gap-2">
              <app-botao-ui texto="Voltar" variante="secundario" [desabilitado]="carregando()" [larguraTotal]="true" (click)="voltarEtapaCredenciais()" />
              <app-botao-ui
                [texto]="carregando() ? 'Validando...' : 'Validar codigo'"
                [desabilitado]="formularioCodigo.invalid || carregando()"
                [larguraTotal]="true"
                [tipo]="'submit'"
              />
            </div>
          </form>
        }

        <footer class="mt-5 rounded-xl border border-borda bg-superficie-secundaria/40 px-3 py-2 text-xs text-cor-texto-terciaria">
          Usuário inicial: <strong class="text-cor-texto">ana.paula@empresa.com</strong> | senha: <strong class="text-cor-texto">Gestor@123</strong>
        </footer>
      </section>
    </main>
  `,
})
export class LoginPaginaComponent {
  private readonly construtorFormulario = inject(FormBuilder);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly roteador = inject(Router);

  readonly carregando = signal(false);
  readonly mensagemErro = signal('');
  readonly etapaAtual = signal<EtapaLogin>('credenciais');
  readonly tokenDesafio = signal<string | null>(null);
  readonly emailInformado = signal('');

  readonly tituloEtapa = computed(() => (this.etapaAtual() === 'credenciais' ? 'Entrar no Gestor' : 'Verificacao em dois fatores'));
  readonly subtituloEtapa = computed(() => {
    if (this.etapaAtual() === 'credenciais') {
      return 'Acesse sua conta para continuar.';
    }

    return `Enviamos um codigo para ${this.emailInformado()}.`;
  });

  readonly formularioLogin = this.construtorFormulario.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly formularioCodigo = this.construtorFormulario.nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  async enviarCredenciais(): Promise<void> {
    if (this.formularioLogin.invalid || this.carregando()) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    try {
      const { email, senha } = this.formularioLogin.getRawValue();
      const tokenDesafio = await this.autenticacaoService.solicitarCodigoSegundoFator(email, senha);

      this.tokenDesafio.set(tokenDesafio);
      this.emailInformado.set(email);
      this.formularioCodigo.setValue({ codigo: '' });
      this.etapaAtual.set('segundo-fator');
    } catch (erro) {
      this.mensagemErro.set(this.extrairMensagemErro(erro, 'Falha ao autenticar. Verifique suas credenciais.'));
    } finally {
      this.carregando.set(false);
    }
  }

  async validarCodigo(): Promise<void> {
    if (this.formularioCodigo.invalid || this.carregando()) {
      this.formularioCodigo.markAllAsTouched();
      return;
    }

    const tokenDesafio = this.tokenDesafio();
    if (!tokenDesafio) {
      this.mensagemErro.set('Sessao de validacao expirada. Refaça o login.');
      this.etapaAtual.set('credenciais');
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    try {
      const { codigo } = this.formularioCodigo.getRawValue();
      await this.autenticacaoService.validarSegundoFator(tokenDesafio, codigo);
      await this.roteador.navigateByUrl('/dashboard');
    } catch (erro) {
      this.mensagemErro.set(this.extrairMensagemErro(erro, 'Codigo invalido ou expirado.'));
    } finally {
      this.carregando.set(false);
    }
  }

  voltarEtapaCredenciais(): void {
    if (this.carregando()) {
      return;
    }

    this.tokenDesafio.set(null);
    this.etapaAtual.set('credenciais');
    this.mensagemErro.set('');
  }

  private extrairMensagemErro(erro: unknown, fallback: string): string {
    const erroHttp = erro as HttpErrorResponse;
    const erroApi = erroHttp.error as { detail?: string; mensagem?: string } | null;
    const mensagemApi = erroApi?.detail ?? erroApi?.mensagem;
    return mensagemApi ?? fallback;
  }
}
