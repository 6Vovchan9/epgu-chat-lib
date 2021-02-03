import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {

  public myMessage;
  public buildingId;
  public userAdmin;

  constructor(private http: HttpClient) {}

  public getOptions(params?: any): any {
    if (params) {
      const options = new HttpParams({
        fromObject: params,
      });

      return { params: options };
    }
    return undefined;
  }

  public getLinks() {
    return this.http.get(`/api/lk/v1/info/links`);
  }

  public getChatsList(params: {scId: number | string; buildingIds: any}): Observable<any> {

    if (this.buildingId) {
      // Получить все чаты в здании
      return this.http.get(`/api/chats/v1/admin/building/${this.buildingId}/chats`);
    } else {
      // Получить список чатов c УК в зданиях
      if (this.userAdmin) {
        // В АРМ Админа
        return this.http.get('/api/chats/v1/admin/buildings/sc/chat', this.getOptions(params));
      } else {
        // В АРМ УК
        return this.http.get('/api/chats/v1/sc/buildings/sc/chat', this.getOptions(params));
      }
    }
  }

  public getChatMessages(params: any): Observable<any> {
    // Получить все сообщения (или избранно) определенного чата
    if (this.userAdmin) {
      // delete params.filter.scId
      return this.http.get(`/api/chats/v1/admin/chat/${params.chatId}/messages`, this.getOptions(params.filter));
    } else {
      return this.http.get(`/api/chats/v1/sc/${params.chatId}/messages`, this.getOptions(params.filter));
    }
  }

  public sendMessage(params: any, body: any): Observable<any> {
    if (this.userAdmin) {
      return this.http.post(`/api/chats/v1/admin/chat/${params.chatId}/message`, body);
    } else {
      return this.http.post(`/api/chats/v1/sc/${params.chatId}/message?scId=${params.scId}`, body);
    }
  }

  public deleteMessage(params: {chatId: number; timeId: number; scId: number;}): Observable<any> {
    if (this.userAdmin) {
      return this.http.delete(`/api/chats/v1/admin/chat/${params.chatId}/message/${params.timeId}`);
    } else {
      return this.http.delete(`/api/chats/v1/sc/${params.chatId}/message/${params.timeId}?scId=${params.scId}`);
    }
  }

  public editMessage(params: {chatId: number; timeId: number; scId: number;}, body: any): Observable<any> {
    if (this.userAdmin) {
      return this.http.put(`/api/chats/v1/admin/chat/${params.chatId}/message/${params.timeId}`, body);
    } else {
      return this.http.put(`/api/chats/v1/sc/${params.chatId}/message/${params.timeId}?scId=${params.scId}`, body);
    }
  }

  public getParticipants(params: {chatId: number; filter: {search: string;}}): Observable<any> {
    if (this.userAdmin) {
      return this.http.get(`/api/chats/v1/admin/chat/${params.chatId}/participants/search`, this.getOptions(params.filter));
    } else {
      return this.http.get(`/api/chats/v1/sc/chat/${params.chatId}/participants/search`, this.getOptions(params.filter));
    }
  }

  public getParticipantsList(params: {chatId: number;}): Observable<any> {
    if (this.userAdmin) {
      return this.http.get(`/api/chats/v1/admin/chat/${params.chatId}/participants`, this.getOptions({limit: 30}));
    } else {
      return this.http.get(`/api/chats/v1/sc/chat/${params.chatId}/participants`, this.getOptions({limit: 30}));
    }
  }

  public getPolls(params: {scId: number; chatId: number; filter: any}): Observable<any> {
    if (this.userAdmin) {
      return this.http.get(`/api/chats/v1/admin/chat/${params.chatId}/messages/polls`, this.getOptions(params.filter));
    } else {
      return this.http.get(`/api/chats/v1/sc/${params.chatId}/messages/polls?scId=-${params.scId}`, this.getOptions(params.filter));
    }
  }

  // Сервисов ниже не было

  public toVote(params: { scId: number; chatId: number, answerId: number; }, body: any): Observable<any> {
    if (this.userAdmin) {
      return this.http.post(`/api/chats/v1/admin/chat/${params.chatId}/answer/${params.answerId}/vote`, body);
    } else {
      return this.http.post(`/api/chats/v1/sc/${params.chatId}/answer/${params.answerId}/vote?scId=${params.scId}`, body);
    }
  }

  public deleteVote(params: { scId: number; chatId: number, pollId: number; }): Observable<any> {
    if (this.userAdmin) {
      return this.http.delete(`/api/chats/v1/admin/chat/${params.chatId}/poll/${params.pollId}/vote`);
    } else {
      return this.http.delete(`/api/chats/v1/sc/${params.chatId}/poll/${params.pollId}/vote?scId=${params.scId}`);
    }
  }

  public getMentionList(params: {chatId: number; filter: {scId: number}}): Observable<any> {
    if (this.userAdmin) {
      return this.http.get(`/api/chats/v1/admin/chat/${params.chatId}/mentioning`, this.getOptions(params.filter));
    } else {
      return this.http.get(`/api/chats/v1/sc/${params.chatId}/mentioning`, this.getOptions(params.filter));
    }
  }

  public readMessage(params: {chatId: number; timeId: number; scId: number;}, body: any): Observable<any> {
    if (this.userAdmin) {
      return this.http.put(`/api/chats/v1/admin/chat/${params.chatId}/message/${params.timeId}/read`, body);
    } else {
      return this.http.put(`/api/chats/v1/sc/${params.chatId}/message/${params.timeId}/read?scId=${params.scId}`, body);
    }
  }
}
