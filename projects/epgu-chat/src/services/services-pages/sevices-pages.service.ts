import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class ServicesPagesService {

    public refreshServList = new BehaviorSubject<number>(0);
    public newServiceData = new BehaviorSubject<any>(null);
    public newServCreated = false;
  
    constructor(
        private http: HttpClient
    ) {
        const newServiceDataFromSS = sessionStorage.getItem('newServiceData');

        if (newServiceDataFromSS) {
            this.newServiceData.next(JSON.parse(newServiceDataFromSS));
        }

        this.newServiceData.subscribe(value => sessionStorage.setItem('newServiceData', JSON.stringify(value)));
    }

    getAllServices({pageSize = undefined, search = undefined, body = {}, scId = undefined, page = undefined}) {
        let params = new HttpParams();
        
        if (pageSize) {
            params = params.append('pageSize', pageSize);
        }

        if (search) {
            params = params.append('search', search)
        }

        if (page) {
            params = params.append('page', page);
        }
        
        return this.http.post(`/api/lk/v1/sc/${scId}/service`, body, {params});
    }

    createNewService(scId, body) {
        return this.http.post(`/api/lk/v1/sc/${scId}/service/new`, body);
    }

    getAllBuildings({scId = undefined}) {
        return this.http.get(`/api/lk/v1/sc/${scId}/buildings`);
    }

    getPageBuildings({pageSize = undefined, search = undefined, scId = undefined, page = undefined}) {
        let params = new HttpParams();
        
        if (pageSize) {
            params = params.append('pageSize', pageSize);
        }

        if (search) {
            params = params.append('search', search)
        }

        if (page) {
            params = params.append('page', page);
        }
        
        return this.http.get(`/api/lk/v1/sc/${scId}/buildings/page`, {params});
    }

    deleteOneService(scId, serviceIds) {
        return this.http.post(`/api/lk/v1/sc/${scId}/service/delete`, serviceIds);
    }

    getServiceCategories() {
        return this.http.get(`/api/lk/v1/sc/service/category`);
    }

    getServiceDetails(scId, serviceId) {
        return this.http.get(`/api/lk/v1/sc/${scId}/service/${serviceId}`);
    }

    sendFiles({formData = undefined, scId = 18}) {
        return this.http.post(`/api/lk/v1/sc/${scId}/service/import`, formData);
    }
}