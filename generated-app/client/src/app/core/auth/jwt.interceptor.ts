import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
const token = localStorage.getItem('access_token');
return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request);
};