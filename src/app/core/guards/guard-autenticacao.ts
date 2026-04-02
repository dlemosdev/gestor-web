import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AutenticacaoService } from '../services/autenticacao.service';

export const guardAutenticacao: CanActivateFn = async () => {
  const roteador = inject(Router);
  const autenticacaoService = inject(AutenticacaoService);

  const autenticado = await autenticacaoService.garantirSessaoAtiva();
  if (autenticado) {
    return true;
  }

  return roteador.createUrlTree(['/login']);
};
