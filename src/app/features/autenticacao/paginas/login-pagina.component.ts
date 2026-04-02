import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChildren } from '@angular/core';
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
            <label class="flex flex-col gap-5 py-5">
              <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Codigo de 6 digitos</span>
              <div class="grid grid-cols-6 gap-2 sm:gap-3">
                @for (indice of indicesCodigo; track indice) {
                  <input
                    #campoCodigo
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    [value]="digitosCodigo()[indice]"
                    [attr.aria-label]="'Digito ' + (indice + 1) + ' do codigo'"
                    [autocomplete]="indice === 0 ? 'one-time-code' : 'off'"
                    class="h-12 rounded-xl border border-borda bg-superficie px-0 text-center text-lg font-semibold text-cor-texto outline-none transition focus:border-primaria focus:ring-2 focus:ring-primaria/20"
                    (input)="atualizarDigitoCodigo(indice, $event)"
                    (keydown)="tratarTeclaCodigo(indice, $event)"
                    (paste)="colarCodigo(indice, $event)"
                  />
                }
              </div>
              <input type="hidden" formControlName="codigo" />
            </label>

            @if (mensagemErro()) {
              <p class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{{ mensagemErro() }}</p>
            }

            <div class="grid grid-cols-2 items-stretch gap-2">
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

        @if (etapaAtual() === 'credenciais') {
          <footer class="mt-5 rounded-xl border border-borda bg-superficie-secundaria/40 px-3 py-2 text-xs text-cor-texto-terciaria">
            Usuario inicial: <strong class="text-cor-texto">dennerlemos.dev@gmail.com</strong> | senha: <strong class="text-cor-texto">Gestor@123</strong>
          </footer>
        }
      </section>
    </main>
  `,
})
export class LoginPaginaComponent {
  private static readonly quantidadeDigitosCodigo = 6;

  private readonly construtorFormulario = inject(FormBuilder);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly roteador = inject(Router);
  private readonly camposCodigo = viewChildren<ElementRef<HTMLInputElement>>('campoCodigo');

  readonly carregando = signal(false);
  readonly mensagemErro = signal('');
  readonly etapaAtual = signal<EtapaLogin>('credenciais');
  readonly tokenDesafio = signal<string | null>(null);
  readonly emailInformado = signal('');
  readonly indicesCodigo = Array.from({ length: LoginPaginaComponent.quantidadeDigitosCodigo }, (_, indice) => indice);
  readonly digitosCodigo = signal(Array<string>(LoginPaginaComponent.quantidadeDigitosCodigo).fill(''));

  readonly tituloEtapa = computed(() => (this.etapaAtual() === 'credenciais' ? 'Entrar no Gestor' : 'Verificacao em dois fatores'));
  readonly subtituloEtapa = computed(() => {
    if (this.etapaAtual() === 'credenciais') {
      return 'Acesse sua conta para continuar.';
    }

    return `Enviamos um codigo para ${this.mascararEmail(this.emailInformado())}.`;
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
      this.definirCodigoCompleto('');
      this.etapaAtual.set('segundo-fator');
      queueMicrotask(() => this.focarCampoCodigo(0));
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
    this.definirCodigoCompleto('');
  }

  atualizarDigitoCodigo(indice: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorNormalizado = input.value.replace(/\D/g, '');

    if (!valorNormalizado) {
      this.atualizarDigitosCodigo((digitos) => {
        digitos[indice] = '';
      });
      input.value = '';
      return;
    }

    this.preencherCodigoAPartir(indice, valorNormalizado);
  }

  tratarTeclaCodigo(indice: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const digitos = this.digitosCodigo();

      if (digitos[indice]) {
        event.preventDefault();
        this.atualizarDigitosCodigo((proximo) => {
          proximo[indice] = '';
        });
        return;
      }

      if (indice > 0) {
        event.preventDefault();
        this.atualizarDigitosCodigo((proximo) => {
          proximo[indice - 1] = '';
        });
        this.focarCampoCodigo(indice - 1);
      }

      return;
    }

    if (event.key === 'ArrowLeft' && indice > 0) {
      event.preventDefault();
      this.focarCampoCodigo(indice - 1);
      return;
    }

    if (event.key === 'ArrowRight' && indice < this.indicesCodigo.length - 1) {
      event.preventDefault();
      this.focarCampoCodigo(indice + 1);
      return;
    }

    if (event.key === ' ' || (event.key.length === 1 && !/\d/.test(event.key))) {
      event.preventDefault();
    }
  }

  colarCodigo(indice: number, event: ClipboardEvent): void {
    event.preventDefault();
    const textoColado = event.clipboardData?.getData('text') ?? '';
    this.preencherCodigoAPartir(indice, textoColado);
  }

  private extrairMensagemErro(erro: unknown, fallback: string): string {
    const erroHttp = erro as HttpErrorResponse;
    const erroApi = erroHttp.error as { detail?: string; mensagem?: string } | null;
    const mensagemApi = erroApi?.detail ?? erroApi?.mensagem;
    return mensagemApi ?? fallback;
  }

  private mascararEmail(email: string): string {
    const [parteLocal, dominio] = email.split('@');

    if (!parteLocal || !dominio) {
      return email;
    }

    if (parteLocal.length <= 2) {
      return `${parteLocal[0] ?? ''}***@${dominio}`;
    }

    return `${parteLocal[0]}***${parteLocal[parteLocal.length - 1]}@${dominio}`;
  }

  private preencherCodigoAPartir(indiceInicial: number, valor: string): void {
    const digitosValidos = valor.replace(/\D/g, '').slice(0, this.indicesCodigo.length - indiceInicial).split('');
    if (!digitosValidos.length) {
      return;
    }

    let ultimoIndicePreenchido = indiceInicial;

    this.atualizarDigitosCodigo((digitos) => {
      digitosValidos.forEach((digito, deslocamento) => {
        const indice = indiceInicial + deslocamento;
        digitos[indice] = digito;
        ultimoIndicePreenchido = indice;
      });
    });

    const proximoIndice = Math.min(ultimoIndicePreenchido + 1, this.indicesCodigo.length - 1);
    this.focarCampoCodigo(proximoIndice);
  }

  private atualizarDigitosCodigo(atualizador: (digitos: string[]) => void): void {
    const proximoCodigo = [...this.digitosCodigo()];
    atualizador(proximoCodigo);
    this.digitosCodigo.set(proximoCodigo);
    this.formularioCodigo.controls.codigo.setValue(proximoCodigo.join(''));
  }

  private definirCodigoCompleto(codigo: string): void {
    const digitos = codigo
      .replace(/\D/g, '')
      .slice(0, this.indicesCodigo.length)
      .split('');

    while (digitos.length < this.indicesCodigo.length) {
      digitos.push('');
    }

    this.digitosCodigo.set(digitos);
    this.formularioCodigo.controls.codigo.setValue(digitos.join(''));
  }

  private focarCampoCodigo(indice: number): void {
    const campo = this.camposCodigo()[indice]?.nativeElement;
    campo?.focus();
    campo?.select();
  }
}
