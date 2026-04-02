import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AutenticacaoService } from '../services/autenticacao.service';

export const guardPaginaLogin: CanActivateFn = async () => {
  const roteador = inject(Router);
  const autenticacaoService = inject(AutenticacaoService);

  const autenticado = await autenticacaoService.garantirSessaoAtiva();
  if (autenticado) {
    return roteador.createUrlTree(['/dashboard']);
  }

  return true;
};
