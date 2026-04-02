import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { apiUrlBase } from '../config/api.config';
import { AutenticacaoService } from '../services/autenticacao.service';

export const interceptorAutenticacao: HttpInterceptorFn = (requisicao, next) => {
  const autenticacaoService = inject(AutenticacaoService);

  const ehApiGestor = requisicao.url.startsWith(apiUrlBase);
  if (!ehApiGestor) {
    return next(requisicao);
  }

  const token = autenticacaoService.tokenAcesso();
  const requisicaoAutenticada = requisicao.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(requisicaoAutenticada).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 401) {
        autenticacaoService.limparSessaoLocal();
      }

      return throwError(() => erro);
    }),
  );
};
