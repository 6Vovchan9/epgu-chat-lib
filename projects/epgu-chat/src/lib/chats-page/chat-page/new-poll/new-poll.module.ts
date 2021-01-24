import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewPollRoutingModule } from './new-poll-routing.module';
import { NewPollComponent } from './new-poll.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatPageModule } from '../chat-page.module';

@NgModule({
  declarations: [
    NewPollComponent,
  ],
  imports: [
    CommonModule,
    NewPollRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ChatPageModule,
  ]
})
export class NewPollModule { }
