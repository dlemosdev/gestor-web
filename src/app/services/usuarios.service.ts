import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

import { apiUrlBase } from '../core/config/api.config';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly urlUsuarios = `${apiUrlBase}/usuarios`;

  private readonly usuariosInterno = signal<Usuario[]>([]);
  readonly usuarios = this.usuariosInterno.asReadonly();

  constructor(private readonly http: HttpClient) {
    this.carregarUsuarios();
  }

  listarUsuarios(): Usuario[] {
    return this.usuariosInterno();
  }

  private carregarUsuarios(): void {
    this.http.get<Usuario[]>(this.urlUsuarios).subscribe({
      next: (usuariosApi) => {
        this.usuariosInterno.set(usuariosApi);
      },
      error: (erro) => {
        console.error('Falha ao carregar usuários da API.', erro);
      },
    });
  }
}

