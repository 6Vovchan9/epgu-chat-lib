import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ChatsService } from '../../../services/chats/chats.service';

@Component({
  selector: 'tl-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  
  @Input() list: string[];
  @Input() text: string = 'ChatsService';
  @Input() buildId: number = null;
  @Input() userAdmin: boolean = false;

  constructor(
    private chatsService: ChatsService
  ) {}

  ngOnInit() {
    this.chatsService.myMessage = this.text;
    // if (this.buildId) {
      console.warn('buildId: ', this.buildId);
      this.chatsService.buildingId = this.buildId;
      this.chatsService.userAdmin = this.userAdmin;
    // }
  }
}
