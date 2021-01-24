import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const req = request.clone({
      setHeaders: {
        accept: '*/*',
        Authorization: `Bearer ${localStorage.getItem('ARM_AUTH_TOKEN')}`,
      },
    });

    return next.handle(req);
  }
}
