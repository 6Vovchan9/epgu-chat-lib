import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BorderDirective} from './border.directive';

@NgModule({
  declarations: [
    BorderDirective
  ],
  exports: [
    BorderDirective
  ],
  imports: [
    CommonModule
  ]
})
export class BorderModule {
}
