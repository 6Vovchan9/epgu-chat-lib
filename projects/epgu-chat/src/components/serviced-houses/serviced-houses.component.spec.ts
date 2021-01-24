import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicedHousesComponent } from './serviced-houses.component';

describe('ServicedHousesComponent', () => {
  let component: ServicedHousesComponent;
  let fixture: ComponentFixture<ServicedHousesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicedHousesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicedHousesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
