import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/permission/permission.guard';

export const routes: Routes = [
 { path: 'user', data: { entity: 'User', operation: 'consultation' },
canActivate:[authGuard,permissionGuard] },
 { path: 'site', data: { entity: 'Site', operation: 'consultation' },
canActivate:[authGuard,permissionGuard] },
 { path: 'role', data: { entity: 'Role', operation: 'consultation' },
canActivate:[authGuard,permissionGuard] },
 { path: 'group', data: { entity: 'Group', operation: 'consultation' },
canActivate:[authGuard,permissionGuard] },
 { path: 'user-site', data: { entity: 'UserSite', operation: 'consultation' },
canActivate:[authGuard,permissionGuard] },
 { path: 'groupe-role', data: { entity: 'GroupeRole', operation: 'consultation' },
canActivate:[authGuard,permissionGuard] },
 { path: 'user-site-droits', data: { entity: 'UserSiteDroits', operation: 'consultation' },
canActivate:[authGuard,permissionGuard] },
];