import { Pipe, PipeTransform } from '@angular/core';
import { fileFormats } from '../../constants/file-formats.const';

@Pipe({ name: 'fileName' })
export class FileNamePipe implements PipeTransform {
  transform(fileName: string): string {

    const basePath: string = 'assets/img/file/types';

    if (fileName) {

      const format: string = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();

      if (fileFormats.findIndex(item => item === format) >= 0) {
        return `${basePath}/${format.toUpperCase()}.svg`;
      }

    }

    return `${basePath}/No_recognize.svg`;

  }
}
