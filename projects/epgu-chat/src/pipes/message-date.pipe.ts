import { Pipe, PipeTransform } from '@angular/core';
import { days, months } from '../constants/calendar.const';

@Pipe({ name: 'messageDate' })
export class MessageDatePipe implements PipeTransform {
  transform(messageMilliseconds: number | string): string {
    if (typeof messageMilliseconds === 'string') {
      messageMilliseconds = + messageMilliseconds;
    }

    const messageDate: Date = new Date(messageMilliseconds);
    const currentDate: Date = new Date();
    const startCurrentDate: Date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    if (startCurrentDate.getTime() <= messageMilliseconds) {
      return `${ this.parseString(messageDate.getHours()) }:${ this.parseString(messageDate.getMinutes()) }`;
    } else if (startCurrentDate.getTime() - 24 * 3600 * 1000 <= messageMilliseconds) {
      return 'вчера';
    } else if (startCurrentDate.getTime() - 7 * 24 * 3600 * 1000 <= messageMilliseconds) {
      return `${ days[messageDate.getDay()] }`;
    } else if (startCurrentDate.getTime() - 365 * 24 * 3600 * 1000 <= messageMilliseconds) {
      return `${ messageDate.getDate() } ${ months[messageDate.getMonth()] }`;
    } else {
      return `${ messageDate.getDate() } ${ months[messageDate.getMonth()] } ${ messageDate.getFullYear() }`;
    }
  }

  parseString(count: number): string | number {
    return count < 10 ? `0${count}` : count;
  }
}
