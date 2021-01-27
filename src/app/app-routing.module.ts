import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { NewCompComponent } from './pages/new-comp/new-comp.component';

const routes: Routes = [
  // {
  //   path: 'chat',
  //   component: NewCompComponent
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
