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

    const chatRest = request.url.startsWith('/api/chats/v1/sc') || request.url.startsWith('/api/lk/v1/sc')

    const req = request.clone({
      setHeaders: {
        accept: '*/*',
        Authorization: `Bearer ${chatRest ? localStorage.getItem('ARM_AUTH_TOKEN') : sessionStorage.getItem('accessToken')}`,
      },
    });

    return next.handle(req);
  }
}
