import { Layout } from '@/shared/components/layout/layout';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        loadComponent: () => import('./public/pages/login/login'),
      },
    ],
  },
  {
    path: 'private',
    children: [
      {
        path: '',
        loadComponent: () => import('./private/pages/principal/principal'),
      },
      {
        path: 'board/:sprint_id',
        loadComponent: () => import('./private/pages/board/board'),
      },
      {
        path: 'work',
        loadComponent: () => import('./private/pages/work/work'),
      },
      {
        path: 'timer',
        loadComponent: () => import('./private/pages/timer/timer'),
      },
    ],
  },
];
