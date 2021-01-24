import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewPollComponent } from './new-poll.component';

const routes: Routes = [{
  path: '',
  component: NewPollComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewPollRoutingModule { }
