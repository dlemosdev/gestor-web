import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutenticacaoService } from '../../../core/services/autenticacao.service';
import { BotaoUiComponent } from '../../../shared/ui/botao/botao-ui.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex min-h-screen items-center justify-center bg-fundo px-4 py-8">
      <section class="w-full max-w-md rounded-3xl border border-borda bg-superficie p-6 shadow-[var(--sombra-card)] sm:p-7">
        <header class="mb-6 text-center">
          <img src="assets/marca/gestor-logo.svg" alt="Gestor" class="mx-auto h-11 w-auto" />
          <h1 class="mt-4 text-2xl font-semibold text-cor-texto">Entrar no Gestor</h1>
          <p class="mt-1 text-sm text-cor-texto-secundaria">Acesse sua conta para continuar.</p>
        </header>

        <form class="space-y-4" [formGroup]="formularioLogin" (ngSubmit)="entrar()">
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
            [texto]="carregando() ? 'Entrando...' : 'Entrar'"
            [desabilitado]="formularioLogin.invalid || carregando()"
            [larguraTotal]="true"
            [tipo]="'submit'"
          />
        </form>

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

  readonly formularioLogin = this.construtorFormulario.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(8)]],
  });

  async entrar(): Promise<void> {
    if (this.formularioLogin.invalid || this.carregando()) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    try {
      const { email, senha } = this.formularioLogin.getRawValue();
      await this.autenticacaoService.iniciarSessao(email, senha);
      await this.roteador.navigateByUrl('/dashboard');
    } catch (erro) {
      const erroHttp = erro as HttpErrorResponse;
      const mensagemApi = (erroHttp.error as { mensagem?: string } | null)?.mensagem;
      this.mensagemErro.set(mensagemApi ?? 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      this.carregando.set(false);
    }
  }
}
