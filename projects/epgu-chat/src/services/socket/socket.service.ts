import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatsService } from '../chats/chats.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  public token: string;
  public scId: string;

  constructor(
    private chatsService: ChatsService
  ) {
    this.token = localStorage.getItem('ARM_AUTH_TOKEN');
    this.scId = localStorage.getItem('SC_ID');
  }

  public emit() {
    return new Observable<SocketInterface>(observer => {
      this.socket.onmessage = (event: MessageEvent) => {

        if (!event.data) { return; }

        observer.next({open: true, message: 'переданы данные', data: event.data});
      };
    });
  }

  public connect(chatId: number) {
    return new Observable<SocketInterface>(observer => {
      if (!this.token && !this.chatsService.userAdmin) {
        observer.error({open: false, message: 'не передан token'});
        return;
      }

      // this.socket = new WebSocket(`wss://${document.location.host.includes('localhost') ? 'gudom-dev.test.gosuslugi.ru' : document.location.host}/chats/ws/chat/${chatId}?authorization=${this.chatsService.userAdmin ? sessionStorage.getItem('accessToken') : this.token}&scId=-${this.scId}&admin=${this.chatsService.userAdmin}`);
      // this.socket = new WebSocket(`${'wss://gudom-dev.test.gosuslugi.ru/chats/ws/chat'}/${chatId}?authorization=${this.token}&scId=-${this.scId}&admin=${this.chatsService.userAdmin}`);
      this.socket = new WebSocket(`${environment.wss}/${chatId}?authorization=${this.chatsService.userAdmin ? sessionStorage.getItem('accessToken') : this.token}&scId=-${this.scId}&admin=${this.chatsService.userAdmin}`);

      this.socket.onopen = (e: Event) => {
        observer.next({open: true, message: 'socket: соединение установлено'});
      };

      this.socket.onerror = (error: Error) => {
        observer.error({open: false, message: error.message});
      };
    });
  }

  public disconnect() {
    return new Observable<SocketInterface>(observer => {
      this.socket.close();

      this.socket.onclose = (event: CloseEvent) => {
        if (event.wasClean) {
          observer.next({open: false, message: `socket: соединение закрыто чисто, код=${event.code} причина=${event.reason}`});
        } else {
          observer.next({open: false, message: `socket: соединение прервано`});
        }
      };
    });
  }
}

export interface SocketInterface {
  open: boolean;
  message: string;
  data?: string;
}
