import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicedHousesListComponent } from './serviced-houses-list.component';

describe('ServicedHousesListComponent', () => {
  let component: ServicedHousesListComponent;
  let fixture: ComponentFixture<ServicedHousesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicedHousesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicedHousesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
