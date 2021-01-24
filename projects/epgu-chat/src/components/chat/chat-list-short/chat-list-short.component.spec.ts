import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatListShortComponent } from './chat-list-short.component';

describe('ChatListShortComponent', () => {
  let component: ChatListShortComponent;
  let fixture: ComponentFixture<ChatListShortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatListShortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatListShortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
