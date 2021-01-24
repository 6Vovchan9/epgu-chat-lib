import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, mergeMap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { ChatsService } from '../../../services/chats/chats.service';
import { appState } from '../../../constants/app-state';
import { toastrConfig } from '../../../constants/notifications';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantsComponent implements OnInit {
  private participantsPrivate: any;
  private subscriptions: Subscription = new Subscription();

  public scId: number;

  constructor(private chatsService: ChatsService,
              private snackBar: MatSnackBar,
              private cd: ChangeDetectorRef) { }

  set participants(value: any) {
    this.participantsPrivate = value;
    this.cd.detectChanges();
  }

  get participants(): any {
    return this.participantsPrivate;
  }

  public trackByFn(index): number {
    return index;
  }

  public ngOnInit(): void {

    this.scId = + localStorage.getItem('SC_ID');

    if (!this.scId) { return; }

    this.participants = [];

    this.subscriptions.add(
      appState.getValue().filters.getValue().chatFilter.checkChatId
        .pipe(
          mergeMap((checkChatId) => {
            return this.chatsService.getParticipantsList({chatId: checkChatId});
          }),
          catchError((err) => {
            const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
            this.snackBar.open(`Ошибка, не удалось загрузить участников ${ description }`, 'закрыть', toastrConfig);
            return of(null);
          })
        )
        .subscribe((participants) => {
          if (!participants) { return; }

          this.participants = participants.items;

        })
    );

  }

}
