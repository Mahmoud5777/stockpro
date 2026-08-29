import { Routes } from '@angular/router';

export const RoleRoutes: Routes = [
{
path: 'roles',
loadComponent: () => import('./list/role-list.component').then((m) => m.RoleListComponent),
},
{
path: 'roles/new',
loadComponent: () => import('./form/role-form.component').then((m) => m.RoleFormComponent),
},
];