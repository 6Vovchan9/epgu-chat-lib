import { TestBed } from '@angular/core/testing';

import { ServicedHousesListService } from './serviced-houses-list.service';

describe('ServicedHousesListService', () => {
  let service: ServicedHousesListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicedHousesListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
