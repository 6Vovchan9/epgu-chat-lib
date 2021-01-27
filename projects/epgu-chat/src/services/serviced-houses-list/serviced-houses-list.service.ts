import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServicedHousesListService {

  constructor(private http: HttpClient) {
  }

  public getOptions(params?: any): any {
    if (params) {
      const options = new HttpParams({
        fromObject: params,
      });

      return { params: options };
    }
    return undefined;
  }

  public getServicedHousesList(params: ServicedHousesListInterface): Observable<any> {
    return this.http.get(`/api/lk/v1/sc/${params.managementCompanyId}/buildings/page`, this.getOptions(params.filter));
  }

  public getSearchBuildingList(params: ServicedHousesListInterface): any {
    const http = this.http;
    return {
      search(query: string): Observable<any> {
        return http
          .get(`/api/lk/v1/sc/${params.managementCompanyId}/buildings/page`, {
            params: {
              search: query,
              pageSize: '10',
            }
          })
          .pipe(
            map((val: ServicedHousesListBuildingsInterface) => {

              return val.contents.map((item: ServicedHousesListBuildingsContInterface) => {
                return {
                  id: item.id,
                  text: item.address,
                };
              });
            })
          );
      }
    };
  }
}

export interface ServicedHousesListInterface {
  managementCompanyId: number | string;
  filter?: {
    pageSize?: number;
    page?: number;
    search?: string;
    sortDirection?: string;
    sortField?: string;
  };
}

export interface ServicedHousesListBuildingsInterface {
  contents: ServicedHousesListBuildingsContInterface[];
  total: number;
}

export interface ServicedHousesListBuildingsContInterface {
  id?: number;
  address: string;
  cadaster?: string;
  chatId?: number;
  sc?: string;
  title?: string;
  chatType?: string;
  createdDateTime?: number; // Todo: разбить на несколько интерфейсов
}
