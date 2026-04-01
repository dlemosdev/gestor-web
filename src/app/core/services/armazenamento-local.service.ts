import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ArmazenamentoLocalService {
  obterItem<T>(chave: string): T | null {
    const conteudo = localStorage.getItem(chave);

    if (!conteudo) {
      return null;
    }

    try {
      return JSON.parse(conteudo) as T;
    } catch {
      localStorage.removeItem(chave);
      return null;
    }
  }

  salvarItem<T>(chave: string, valor: T): void {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  removerItem(chave: string): void {
    localStorage.removeItem(chave);
  }
}

