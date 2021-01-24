import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryFieldComponent } from './entry-field.component';

describe('EntryFieldComponent', () => {
  let component: EntryFieldComponent;
  let fixture: ComponentFixture<EntryFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntryFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
