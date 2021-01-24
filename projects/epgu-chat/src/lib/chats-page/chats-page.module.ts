import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatsPageRoutingModule } from './chats-page-routing.module';
import { ChatsPageComponent } from './chats-page.component';
import { ChatsListComponent } from '../../components/chat/chats-list/chats-list.component';
import { OverviewPageModule } from '../overview-page/overview-page.module';
import { ChatPageModule } from './chat-page/chat-page.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket/socket.service';
import { NewPollModule } from './chat-page/new-poll/new-poll.module';

@NgModule({
  declarations: [
    ChatsPageComponent,
    ChatsListComponent,
  ],
  imports: [
    CommonModule,
    ChatsPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    OverviewPageModule,
    ChatPageModule,
    NewPollModule,
  ],
  providers: [
    SocketService,
  ],
})
export class ChatsPageModule { }
