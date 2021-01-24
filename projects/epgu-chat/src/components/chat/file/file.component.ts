import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { appState, StatusEnum } from '../../../constants/app-state';
import { fromEvent, Observable, of, Subject, Subscription } from 'rxjs';
import { FileService } from '../../../services/file/file.service';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { toastrBottomConfig, toastrConfig } from '../../../constants/notifications';
import { ChatsService } from '../../../services/chats/chats.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'arm-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private filesInfoPrivate: any;
  private loadingPrivate: boolean;

  public scId: number;
  public date: Date;
  public fromCancelBtn: Observable<any>;

  @ViewChild('removeBtn') removeBtn: ElementRef;

  constructor(private cd: ChangeDetectorRef,
              private chatsService: ChatsService,
              private snackBar: MatSnackBar,
              private fileService: FileService) {
  }

  @Input() fileSubscribe: Subject<any>;

  @Input()
  set filesInfo(value: any) {
    this.filesInfoPrivate = value;
    this.cd.detectChanges();
  }

  get filesInfo(): any {
    return this.filesInfoPrivate;
  }

  set loading(value: boolean) {
    this.loadingPrivate = value;
    this.cd.detectChanges();
  }

  get loading(): boolean {
    return this.loadingPrivate;
  }

  public removeFile(id: number): void {

    const dateTime: number = this.filesInfo[0].dateTime;

    const copyMessagesState = appState.getValue().messages.getValue();

    if (copyMessagesState.filesStorage) {

      const index: number = copyMessagesState.filesStorage.findIndex(item => item.dateTime === dateTime);

      if (index >= 0) {
        copyMessagesState.filesStorage[index].status = StatusEnum.loaded;
      } else {
        copyMessagesState.filesStorage = copyMessagesState.filesStorage.filter(item => item.dateTime !== dateTime);
      }

      copyMessagesState.fileUpload = false;
      appState.getValue().messages.next(copyMessagesState);
      appState.next(appState.getValue());

    }

    if (!this.fileSubscribe) { return; }

    this.filesInfo.splice(id, 1);

    if (!this.filesInfo.length) {

      this.loading = false;

      this.filesInfo = null;

      this.fileSubscribe.next({ sender: 'child', filesInfo: this.filesInfo });
    }
  }

  static createFormData(file: File) {
    const form = new FormData();
    form.append('file', file);
    return form;
  }

  public setProgressBarWidth(width) {
    if (width !== 100) { return; }
  }

  public sendMessage(response: any): void {

    const checkChatId: number = appState.getValue().filters.getValue().chatFilter.checkChatId.getValue();

    const params: any = {
      chatId: checkChatId,
      scId: this.scId,
    };

    response = JSON.parse(response);

    const body: any = {
      scId: this.scId,
      chatId: checkChatId,
      id: this.filesInfo[0].id,
      user: {
        id: - this.scId,
      },
      messageContent: response,
      type: 'FILE',
    };

    this.subscriptions.add(
      this.chatsService.sendMessage(params, body)
        .pipe(
          tap(() => this.loading = true),
          switchMap((value: any) => {
            this.snackBar.open('Сообщение отправлено', 'закрыть', toastrBottomConfig);

            this.removeFile(0);

            return of(value);
          }),
          catchError((err) => {
            const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
            this.snackBar.open(`Ошибка, сообщение не отправлено ${ description }`, 'закрыть', toastrConfig);

            return of([]);
          }),
        )
        .subscribe((value: any) => {
          this.removeFile(0);
        })
    );
  }

  public trackByFn(index): number {
    return index;
  }

  public ngOnInit(): void {
    this.scId = + localStorage.getItem('SC_ID');

    if (!this.fileSubscribe) { return; }

    this.fromCancelBtn = fromEvent(this.removeBtn.nativeElement, 'click');

    this.subscriptions.add(
      this.fileSubscribe
        .pipe(
          filter((value) => {
            if (value.sender !== 'child' && value.command === 'unload') {
              this.date = new Date();
              return true;
            }

            return false;
          }),
          map((value) => {
            if (this.filesInfo[0].type === 'IMAGE') {

              return this.fileService.compress(this.filesInfo[0].messageContent)
                .pipe(
                  switchMap((file: File) => {

                    return of(FileComponent.createFormData(file));
                  }),
                );
            } else {

              return of(FileComponent.createFormData(this.filesInfo[0].messageContent));
            }
          }),
          switchMap((formData) => {

            return formData;
          }),
          exhaustMap((data: FormData) => {
              this.loading = true;
              return this.fileService.fileUpload({ scId: this.scId, data: data })
                .pipe(
                  takeUntil(this.fromCancelBtn),
                )
            }
          ),
        )
        .subscribe((value) => {

          if (value.responseText) {
            this.sendMessage(value.responseText);
            return;
          } else if (value.error) {
            this.snackBar.open(`Сообщение не отправлено ${value.error}`, 'закрыть', toastrConfig);
            this.removeFile(0);
          }

          this.setProgressBarWidth(value)
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
