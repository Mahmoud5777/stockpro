import { Routes } from '@angular/router';

export const GroupeRoleRoutes: Routes = [
{
path: 'group-roles',
loadComponent: () => import('./list/groupe-role-list.component').then((m) => m.GroupeRoleListComponent),
},
{
path: 'group-roles/new',
loadComponent: () => import('./form/groupe-role-form.component').then((m) => m.GroupeRoleFormComponent),
},
];