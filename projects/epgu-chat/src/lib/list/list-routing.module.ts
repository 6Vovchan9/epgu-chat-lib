import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatsPageModule } from '../chats-page/chats-page.module';

export function getChatsPageModule() {
  return ChatsPageModule;
}

const routes: Routes = [
  {
    path: '',
    loadChildren: getChatsPageModule
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListRoutingModule { }