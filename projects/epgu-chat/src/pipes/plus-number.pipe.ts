import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'plus' })
export class PlusPipe implements PipeTransform {
  transform(num: number | string): number {
    if (typeof num === 'string') {
      num = +num;
    }
    return Math.abs(num);
  }
}
