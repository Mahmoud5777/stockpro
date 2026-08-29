import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const securityOperations = {
 'User': {"consultation":true,"export":true,"ajout":true,"modification":true,"suppression":true},
 'Site': {"consultation":true,"export":true,"ajout":true,"modification":true,"suppression":true},
 'Role': {"consultation":true,"export":true,"ajout":true,"modification":true,"suppression":true},
 'Group': {"consultation":true,"export":true,"ajout":true,"modification":true,"suppression":true},
 'UserSite': {"consultation":true,"export":false,"ajout":true,"modification":true,"suppression":false},
 'GroupeRole': {"consultation":true,"export":false,"ajout":true,"modification":true,"suppression":false},
 'UserSiteDroits': {"consultation":true,"export":false,"ajout":true,"modification":true,"suppression":false},
} as const;

export const permissionGuard: CanActivateFn = (route) => {
const entity = route.data['entity'] as keyof typeof securityOperations;
const operation = route.data['operation'] as string || 'consultation';
const allowed = securityOperations[entity]?.[operation as keyof typeof securityOperations[typeof entity]];
return allowed ? true : inject(Router).createUrlTree(['/forbidden']);
};