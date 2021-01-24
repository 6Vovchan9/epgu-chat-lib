import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'messageContent' })
export class MessageContentPipe implements PipeTransform {
  transform(messageContent: string): string {
    if (!messageContent) { return; }

    return sliceString(messageContent);
  }
}

export function sliceString(string: string) {
  if (string.indexOf('<oid:') < 0) {
    return string;
  }

  return string.slice(0, string.indexOf('<oid:'));
}
