import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdsService {
  constructor(private http: HttpClient) {
  }

  public getOptions(params?: any): { params: HttpParams } {
    if (params) {
      const options = new HttpParams({
        fromObject: params,
      });

      return { params: options };
    }
    return undefined;
  }

  public getBuildingsAdsList(params?: BuildingsAdsListParamsInterface): Observable<any> {
    return this.http.post(`/api/lk/v1/sc/${params.managementCompanyId}/board/message/page`, {
      filter: params.filter,
    });
  }

  public updateAd(params: { managementCompanyId: number; bmId: number; body: any; }): Observable<any> {
    return this.http.put(`/api/lk/v1/sc/${params.managementCompanyId}/board/message/${params.bmId}`, params.body);
  }

  public saveAd(params: { managementCompanyId: number; body: any }): Observable<any> {
    return this.http.post(`/api/lk/v1/sc/${params.managementCompanyId}/board/message`, params.body);
  }

  public deleteAd(params: {scId: number; bmId: number}): Observable<any> {
    return this.http.delete(`/api/lk/v1/sc/${params.scId}/board/message/${params.bmId}`);
  }

}

export interface BuildingsAdsListParamsInterface {
  managementCompanyId?: number;
  filter?: AdsFilterInterface;
}

export interface AdsFilterInterface {
  isViewActive?: boolean;
  isViewInactive?: boolean;
  title?: string;
  viewStartDate?: string;
  viewStopDate?: string;
  buildingIds?: number[];
}

export interface BuildingsAdsListResponseInterface {
  id: number;
  title: string;
  description: string;
  viewStartDate: number;
  viewStopDate: number;
  buildingIds: number[];
}
