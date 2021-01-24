import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  timer: any;
  private list$: Subject<string> = new Subject<string>();
  list: Observable<string> = this.list$.asObservable();

  constructor() {
    this.timer = setInterval(this.nextItem.bind(this), 1000);
  }

  nextItem() {
    const now = new Date();
    const currentTime = now.getTime().toString();
    this.list$.next(currentTime);
  }
}
