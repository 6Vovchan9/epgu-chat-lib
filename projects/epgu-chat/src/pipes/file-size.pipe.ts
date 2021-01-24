import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  transform(size: number): string {

    size = +size;

    if (!size || typeof size !== 'number' || isNaN(size)) { return; }

    if (size >= 1000000) {
      return `${(size / 1000000).toFixed(1)}мб`;
    } else {
      return `${(size / 1000).toFixed(1)}кб`
    }
  }
}
