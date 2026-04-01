import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell.component';

export const rotasAplicacao: Routes = [
  {
    path: '',
    component: ShellComponent,
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

