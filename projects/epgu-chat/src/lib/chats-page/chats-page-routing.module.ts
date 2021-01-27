import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatsPageComponent } from './chats-page.component';
import { ChatsListComponent } from '../../components/chat/chats-list/chats-list.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { NewPollComponent } from './chat-page/new-poll/new-poll.component';

const routes: Routes = [{
  path: 'chats', // можно ''
  component: ChatsPageComponent,
  children: [
    {
      path: '',
      component: ChatsListComponent
    },
    {
      path: ':chatId',
      component: ChatPageComponent
    },
    {
      path: ':chatId/new-poll',
      component: NewPollComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatsPageRoutingModule { }
