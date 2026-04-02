import { Routes } from '@angular/router';

import { guardAutenticacao } from './core/guards/guard-autenticacao';
import { guardPaginaLogin } from './core/guards/guard-pagina-login';
import { ShellComponent } from './layout/shell/shell.component';

export const rotasAplicacao: Routes = [
  {
    path: 'login',
    canActivate: [guardPaginaLogin],
    loadComponent: () =>
      import('./features/autenticacao/paginas/login-pagina.component').then((modulo) => modulo.LoginPaginaComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [guardAutenticacao],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/paginas/dashboard-pagina.component').then(
            (modulo) => modulo.DashboardPaginaComponent,
          ),
      },
      {
        path: 'projetos',
        loadComponent: () =>
          import('./features/projetos/paginas/projetos-pagina.component').then(
            (modulo) => modulo.ProjetosPaginaComponent,
          ),
      },
      {
        path: 'projetos/:id/board',
        loadComponent: () =>
          import('./features/board/paginas/board-projeto-pagina.component').then(
            (modulo) => modulo.BoardProjetoPaginaComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
