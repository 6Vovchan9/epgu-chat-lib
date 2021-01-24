import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatPageRoutingModule } from './chat-page-routing.module';
import { ChatPageComponent } from './chat-page.component';
import { OverviewPageModule } from '../../overview-page/overview-page.module';
import { ChatListShortComponent } from '../../../components/chat/chat-list-short/chat-list-short.component';
import { MessageComponent } from '../../../components/chat/message/message.component';
import { PlusPipe } from '../../../pipes/plus-number.pipe';
import { MessageDatePipe } from "../../../pipes/message-date.pipe";
import { BubbleComponent } from '../../../components/chat/message/bubble/bubble.component';
import { EntryFieldComponent } from '../../../components/chat/message/entry-field/entry-field.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MessageContentPipe } from '../../../pipes/message-content.pipe';
import { FileComponent } from '../../../components/chat/file/file.component';
import { SearchComponent } from '../../../components/chat/search/search.component';
import { SpinnerComponent } from '../../../components/loading/spinner/spinner.component';
import { ParticipantsComponent } from '../../../components/chat/participants/participants.component';
import { PhotoPreviewComponent } from '../../../components/chat/photo-preview/photo-preview.component';
import { MatDialogModule } from '@angular/material/dialog';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import { MatIconModule } from '@angular/material/icon';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';

export class HammerConfig extends HammerGestureConfig {
  events = ['tap'];
  overrides = <any>{
    swipe: { direction: Hammer.DIRETION_ALLL },
  };
}

@NgModule({
  declarations: [
    ChatPageComponent,
    ChatListShortComponent,
    MessageComponent,
    PlusPipe,
    MessageDatePipe,
    MessageContentPipe,
    BubbleComponent,
    EntryFieldComponent,
    FileComponent,
    SearchComponent,
    ParticipantsComponent,
    PhotoPreviewComponent,
  ],
  exports: [
    SpinnerComponent,
    MatIconModule,
  ],
  imports: [
    CommonModule,
    ChatPageRoutingModule,
    OverviewPageModule,
    CKEditorModule,
    MatDialogModule,
    HammerModule,
    NgxLinkifyjsModule.forRoot(
      {
        enableHash: false,
        enableMention: false,
      }),
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerGestureConfig
    }
  ]
})
export class ChatPageModule { }
