import { Injectable, signal } from '@angular/core';

import { ArmazenamentoLocalService } from '../core/services/armazenamento-local.service';
import { Usuario } from '../models/usuario.model';
import { DadosMockService } from './dados-mock.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly chaveUsuarios = 'gestor:usuarios';

  private readonly usuariosInterno = signal<Usuario[]>([]);
  readonly usuarios = this.usuariosInterno.asReadonly();

  constructor(
    private readonly armazenamentoLocalService: ArmazenamentoLocalService,
    private readonly dadosMockService: DadosMockService,
  ) {
    this.dadosMockService.garantirDadosIniciais();
    this.carregar();
  }

  listarUsuarios(): Usuario[] {
    return this.usuariosInterno();
  }

  private carregar(): void {
    const usuariosSalvos = this.armazenamentoLocalService.obterItem<Usuario[]>(this.chaveUsuarios);
    this.usuariosInterno.set(usuariosSalvos ?? []);
  }
}


