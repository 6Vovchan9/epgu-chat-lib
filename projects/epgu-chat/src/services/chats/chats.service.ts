import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {

  constructor(private http: HttpClient) { }

  public getOptions(params?: any): any {
    if (params) {
      const options = new HttpParams({
        fromObject: params,
      });

      return { params: options };
    }
    return undefined;
  }

  public getChatsList(params: {scId: number | string; buildingIds: any}): Observable<any> {
    return this.http.get('/api/chats/v1/sc/buildings/sc/chat', this.getOptions(params));
  }

  public getChatMessages(params: any): Observable<any> {
    return this.http.get(`/api/chats/v1/sc/${params.chatId}/messages`, this.getOptions(params.filter));
  }

  public sendMessage(params: any, body: any): Observable<any> {
    return this.http.post(`/api/chats/v1/sc/${params.chatId}/message?scId=${params.scId}`, body);
  }

  public deleteMessage(params: {chatId: number; timeId: number; scId: number;}): Observable<any> {
    return this.http.delete(`/api/chats/v1/sc/${params.chatId}/message/${params.timeId}?scId=${params.scId}`);
  }

  public editMessage(params: {chatId: number; timeId: number; scId: number;}, body: any): Observable<any> {
    return this.http.put(`/api/chats/v1/sc/${params.chatId}/message/${params.timeId}?scId=${params.scId}`, body);
  }

  public getParticipants(params: {chatId: number; filter: {search: string;}}): Observable<any> {
    return this.http.get(`/api/chats/v1/sc/chat/${params.chatId}/participants/search`, this.getOptions(params.filter));
  }

  public getParticipantsList(params: {chatId: number;}): Observable<any> {
    return this.http.get(`/api/chats/v1/sc/chat/${params.chatId}/participants`, this.getOptions({limit: 30}));
  }

  public getPolls(params: {scId: number; chatId: number; filter: any}): Observable<any> {
    return this.http.get(`/api/chats/v1/sc/${params.chatId}/messages/polls?scId=-${params.scId}`, this.getOptions(params.filter));
  }

  public toVote(params: { scId: number; chatId: number, answerId: number; }, body: any): Observable<any> {
    return this.http.post(`/api/chats/v1/sc/${params.chatId}/answer/${params.answerId}/vote?scId=${params.scId}`, body);
  }

  public deleteVote(params: { scId: number; chatId: number, pollId: number; }): Observable<any> {
    return this.http.delete(`/api/chats/v1/sc/${params.chatId}/poll/${params.pollId}/vote?scId=${params.scId}`);
  }

  public getMentionList(params: {chatId: number; filter: {scId: number}}): Observable<any> {
    return this.http.get(`/api/chats/v1/sc/${params.chatId}/mentioning`, this.getOptions(params.filter));
  }

  public readMessage(params: {chatId: number; timeId: number; scId: number;}, body: any): Observable<any> {
    return this.http.put(`/api/chats/v1/sc/${params.chatId}/message/${params.timeId}/read?scId=${params.scId}`, body);
  }
}
