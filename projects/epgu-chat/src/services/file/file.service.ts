import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  progressBarWidth = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) { }

  public compress(file: File): Observable<any> {

    const width = 500;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    return Observable.create(observer => {

      reader.onload = ev => {

        const img = new Image();

        img.src = (ev.target as any).result;

        (img.onload = () => {

          const elem = document.createElement('canvas'); // Todo: Renderer2

          const scaleFactor = width / img.width;

          elem.width = width;

          elem.height = img.height * scaleFactor;

          const ctx = <CanvasRenderingContext2D>elem.getContext('2d');

          ctx.drawImage(img, 0, 0, width, img.height * scaleFactor);

          ctx.canvas.toBlob(

            blob => {

              observer.next(

                new File([blob], file.name, {

                  type: file.type,

                  lastModified: Date.now(),

                }),

              );

            },

            file.type,

            1,

          );

        });

          (reader.onerror = error => observer.error(error));

      };
    });

  }

  public getLinks(): Observable<any> {
    return this.http.get('/api/lk/v1/info/links');
  }

  public fileDownload(params: {scId: number; fileUrl: string;}): Observable<any> {
    return new Observable(observer => {

      this.getLinks()
        .pipe(
          switchMap((links: LinksInterface) => {
            if (!links || !links.filesUrl) {
              console.error(throwError('ошибка, не удалось получить файловый сервер'));
              return of(null);
            }

            return of(links.filesUrl);
          }),
        )
        .subscribe((filesUrl: string) => {
          if (!filesUrl) { return; }

          const xhr = new XMLHttpRequest();

          xhr.onerror = e => observer.error(e);
          xhr.onload = () => observer.complete();

          xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
              observer.next({responseText: xhr.response});
            }
          }

          xhr.open('GET', `${filesUrl}/${params.fileUrl}`, true);
          xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('ARM_AUTH_TOKEN')}`);
          xhr.setRequestHeader('mpdom-agent', 'uk');
          xhr.responseType = 'arraybuffer';
          xhr.send();

          return () => xhr.abort();
        });
    });
  }

  public deleteFile(params: {scId: number, fileId : string}): Observable<any> {
    return this.http.delete(`/api/file/v1/sc/${params.scId}/${params.fileId}`);
  }

  public fileUpload(params: {scId: number, data: FormData}): Observable<any> {
    return new Observable(observer => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = e => {
        const progress = e.loaded / e.total * 100;
        observer.next(progress);
      };

      xhr.onerror = e => observer.error(e);
      xhr.onload = () => observer.complete();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            observer.next({responseText: xhr.response});
          } else {
            observer.next({error: xhr.response});
          }
        }
      }

      xhr.open('POST', `/api/file/v1/sc/${params.scId}/upload`, true);
      xhr.setRequestHeader('mpdom-agent', 'uk');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('ARM_AUTH_TOKEN')}`);
      xhr.send(params.data);

      return () => xhr.abort();
    });
  }

}

export interface LinksInterface {
  registration: string,
  recoveryPassword: string,
  domain: string,
  filesUrl: string
}
