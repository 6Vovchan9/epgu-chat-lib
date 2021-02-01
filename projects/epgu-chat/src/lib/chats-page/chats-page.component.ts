import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { ChatsService } from '../../services/chats/chats.service';

@Component({
  selector: 'arm-chats-page',
  templateUrl: './chats-page.component.html',
  styleUrls: ['./chats-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsPageComponent implements OnInit {

  @Input() text: string = 'fakeMy';

  constructor() {}

  public ngOnInit(): void {
    // console.warn(this.text);
    // this.chatsService.myMessage = this.text;
    // setTimeout(()=> this.chatsService.myMessage = this.text, 2000);
    // setTimeout(()=> console.warn('Hi',this.text), 4000);
  }

}
