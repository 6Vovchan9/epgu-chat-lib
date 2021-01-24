import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'arm-chats-page',
  templateUrl: './chats-page.component.html',
  styleUrls: ['./chats-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsPageComponent implements OnInit {

  constructor() { }

  public ngOnInit(): void {}

}
