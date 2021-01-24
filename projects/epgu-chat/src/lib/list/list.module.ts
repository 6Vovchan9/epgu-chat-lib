import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import { ListRoutingModule } from './list-routing.module';
import { EpguLibModule } from 'epgu-lib';

@NgModule({
  declarations: [
    ListComponent
  ],
  exports: [
    ListComponent
  ],
  imports: [
    CommonModule,
    ListRoutingModule,
    // HttpClientModule, // зависимость нужная только для отладки при сборке ее НУЖНО ОТКЛЮЧИТЬ!
    // BrowserAnimationsModule, // зависимость нужная только для отладки при сборке ее НУЖНО ОТКЛЮЧИТЬ!
    EpguLibModule.forRoot(),
  ]
})
export class ListModule {
}
