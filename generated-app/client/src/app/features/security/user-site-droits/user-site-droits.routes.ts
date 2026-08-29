import { Routes } from '@angular/router';

export const UserSiteDroitsRoutes: Routes = [
{
path: 'user-site-droits',
loadComponent: () => import('./list/user-site-droits-list.component').then((m) => m.UserSiteDroitsListComponent),
},
{
path: 'user-site-droits/new',
loadComponent: () => import('./form/user-site-droits-form.component').then((m) => m.UserSiteDroitsFormComponent),
},
];