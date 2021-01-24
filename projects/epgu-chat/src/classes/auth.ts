import { Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthClass {

  constructor(private http: HttpClient) {  }

  static getToken(): string {
    return localStorage.getItem('ARM_AUTH_TOKEN');
  }

  public getScId(): string {
    return localStorage.getItem('SC_ID');
  }

  public setParams(params: { 'OPA-ID': string, 'POS-ACCESS-TOKEN': string; }): Observable<any> {

    if (params['POS-ACCESS-TOKEN']) {
      localStorage.setItem('ARM_AUTH_TOKEN', params['POS-ACCESS-TOKEN']);
    }

    const opaId: string = params['OPA-ID'];

    const observable: Observable<any> = new Observable((observer: any) => {
      if (opaId) {
        this.getManagementCompany(opaId)
          .pipe(
            catchError((err) => {
              return of({ error: err });
            })
          )
          .subscribe((value) => {
            if (!value) { return; }

            if (value.error) {
              observer.next(value);
              return;
            }

            localStorage.setItem('SC_ID', value);

            observer.next({
              authToken: AuthClass.getToken(),
              scId: this.getScId(),
            });
          });

      } else {

        observer.next({err: throwError('не удалось определить ЛКО')});

      }
    });

    return observable;
  }

  public getManagementCompany(opaId): Observable<any> {
    return this.http.get(`/api/lk/v1/sc/pos/${opaId}`);
  }

}
