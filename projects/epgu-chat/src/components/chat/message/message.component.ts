import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, from, fromEvent, Observable, of, Subject, Subscription, throwError } from 'rxjs';
import { catchError, debounceTime, map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import {
  ActionEnum,
  appState, CurrentDisplayList, MainContentDOMElementStateInterface, MessageInterface,
  MessagesStateInterface,
  SelectedMessageListInterface,
  SocketMessageInterface,
  StatusEnum,
  UnsentMessagesInterface
} from '../../../constants/app-state';
import { toastrBottomConfig, toastrConfig } from '../../../constants/notifications';
import { ChatsService } from '../../../services/chats/chats.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SocketInterface, SocketService } from '../../../services/socket/socket.service';
import { ErrorTitlesEnum } from '../../../enums/error-titles.enum';
import { fileFormats } from '../../../constants/file-formats.const';
import { FileService } from '../../../services/file/file.service';
import { DownloadComponent } from '../file/download/download.component';
import { UuidClass } from '../../../classes/uuid';

@Component({
  selector: 'arm-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MessageComponent implements OnInit, AfterViewInit, OnDestroy {
  private loadingPrivate: boolean;
  private messagesPrivate: any;
  private subscriptions: Subscription = new Subscription();
  private messageStatePrivate: MessagesStateInterface;
  private enterButtonActivePrivate: boolean;
  private subscribeIntervalId: any;
  private messagesSubscribe: Observable<any>;
  private downloadButtonShowPrivate: boolean;

  public form: FormGroup;
  public scId: number;
  public chatId: number;
  public fileToUploadPrivate: any = null;
  public fileSubscribe: Subject<any>;
  public search: BehaviorSubject<{youngerThan?: number; olderThan: number; limit?: number, scId: number;}> = new BehaviorSubject<any>({
    olderThan: (new Date()).getTime(),
    limit: 30,
    scId: +localStorage.getItem('SC_ID'),
  });
  public currentDisplayList: CurrentDisplayList;
  public goToBottomButtonShowPrivate: boolean;
  public goToMentionButtonShowShowPrivate: boolean;
  public fileFormats: string[] = ['FILE', 'IMAGE'];

  @ViewChild('messagesElement', { read: ElementRef }) messagesElement: ElementRef;
  @ViewChild('enterButton') enterButton: ElementRef;

  constructor(private cd: ChangeDetectorRef,
              private snackBar: MatSnackBar,
              private fb: FormBuilder,
              private fileService: FileService,
              private socketService: SocketService,
              private chatsService: ChatsService) {
  }

  set enterButtonActive(value: boolean) {
    this.enterButtonActivePrivate = value;
    this.cd.detectChanges();
  }

  get enterButtonActive(): boolean {
    return this.enterButtonActivePrivate;
  }

  set fileToUpload(value: any) {
    this.fileToUploadPrivate = value;
    this.cd.detectChanges();
  }

  get fileToUpload(): any {
    return this.fileToUploadPrivate;
  }

  set downloadButtonShow(value: boolean) {
    this.downloadButtonShowPrivate = value;
    this.cd.detectChanges();
  }

  get downloadButtonShow(): boolean {
    return this.downloadButtonShowPrivate;
  }

  set messages(value: any) {
    this.messagesPrivate = value;
    this.cd.detectChanges();

    if (!this.messagesSubscribe) {
      this.messagesSubscribe = new Observable<any>((observer) => {
        observer.next({length: value.length});
      });
    }
  }

  get messages(): any {
    return this.messagesPrivate;
  }

  set loading(value: boolean) {
    this.loadingPrivate = value;
    this.cd.detectChanges();
  }

  get loading(): boolean {
    return this.loadingPrivate;
  }

  set goToBottomButtonShow(value: boolean) {
    this.goToBottomButtonShowPrivate = value;
    this.cd.detectChanges();
  }

  get goToBottomButtonShow(): boolean {
    return this.goToBottomButtonShowPrivate;
  }

  set goToMentionButtonShow(value: boolean) {
    this.goToMentionButtonShowShowPrivate = value;
    this.cd.detectChanges();
  }

  get goToMentionButtonShow(): boolean {
    return this.goToMentionButtonShowShowPrivate;
  }

  set messageState(value: MessagesStateInterface) {
    this.messageStatePrivate = value;
    this.cd.detectChanges();
  }

  get messageState(): MessagesStateInterface {
    return this.messageStatePrivate;
  }

  public trackByFn(index): number {
    return index;
  }

  public parseHtmlCode(): void {

    const regexp = new RegExp(/<span class="mention" data-mention="/g);

    let string: string = this.form.controls.messageContent.value;

    const mentionIds = [];

    const result = string.match(regexp);

    if (!result || !result.length) { return; }

    result.forEach((item) => {

      const indexStart = string.indexOf(`<span class="mention" data-mention="`);

      if (indexStart >= 0) {

        const indexUserIdEnd = string.slice(indexStart + `<span class="mention" data-mention="`.length).indexOf(`">@`);

        if (indexUserIdEnd >= 0) {
          const men = string.slice(indexStart + `<span class="mention" data-mention="`.length, indexStart + `<span class="mention" data-mention="`.length + indexUserIdEnd);
          mentionIds.push(men);
        }

        const substring: string = `</span>`;
        const mentionEnd: number = string.slice(indexStart).indexOf(substring) + substring.length

        const repl = string.slice(indexStart, indexStart + mentionEnd);

        string = string.replace(repl, '');
      }

    });

    if (mentionIds && mentionIds.length) {

      this.subscriptions.add(
        this.form.controls.messageContent.valueChanges
          .subscribe((value) => {

            const messagesStateCopy = appState.getValue().messages.getValue();

            const text = mentionIds.reduce((accum, item) => {
              return `${accum}<oid:${item}> `;
            }, messagesStateCopy.messageContent.getValue().text);

            appState.getValue().messages.getValue().messageContent.next({ text: text });
          })
      );

      this.form.controls.messageContent.setValue(string);
    }
  }

  public goToQuote(state: any): void {
    let searchDate: number = state.selectedMessageList[0].replyMessage.dateTime;

    const index: number = this.messages.findIndex(message => message.dateTime === searchDate);

    if (index >= 0) {

      if (this.messagesElement.nativeElement.children[index].offsetTop >= 0) {
        this.messagesElement.nativeElement.scrollTop = this.messagesElement.nativeElement.children[index].offsetTop;
      }

      const messagesStateCopy: any = appState.getValue().messages.getValue();
      messagesStateCopy.action = ActionEnum.default;
      messagesStateCopy.selectedMessageList = [];
      appState.getValue().messages.next(messagesStateCopy);
      return;
    }

    this.subscriptions.add(
      this.chatsService.getChatMessages({ scId: this.scId, chatId: this.chatId, filter: {
          youngerThan: searchDate,
          olderThan: this.messages[0].dateTime,
          scId: this.scId,
        }})
        .pipe(
          catchError((err) => {
            const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
            this.snackBar.open(`Ошибка, не удалось получить сообщения ${ description }`, 'закрыть', toastrConfig);

            return of(null);
          })
        )
        .subscribe((messages) => {
          if (!messages) { return; }

          this.messages.unshift(...messages);

          setTimeout(() => {
            this.messagesElement.nativeElement.scrollTop = 0;

            const messagesStateCopy: any = appState.getValue().messages.getValue();
            messagesStateCopy.action = ActionEnum.default;
            messagesStateCopy.selectedMessageList = [];
            appState.getValue().messages.next(messagesStateCopy);

          }, 0);
        })
    );
  }

  public fileValid(fileToUpload): { result: boolean; errorMessage: string } {
    if (fileToUpload && fileToUpload.length) {

      let fileIndex =  fileToUpload.findIndex(file => file.size > 50000000);

      if (fileIndex >= 0) {
        return { result: false, errorMessage: ErrorTitlesEnum.FileMaxSizeError };
      }

      fileIndex = fileToUpload.findIndex(file => {
        const format: string = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase();

        const formatIndex: number = fileFormats.findIndex(item => item === format);

        if (formatIndex < 0) { return true; }
      });

      if (fileIndex >= 0) {
        return { result: false, errorMessage: ErrorTitlesEnum.FileFormatError };
      }

    }

    return;
  }

  public sendFiles(fileToUpload: File[]): void {
    const messagesState = appState.getValue().messages.getValue();

    // console.warn(messagesState);
    
    if (!messagesState.filesStorage) {
      messagesState.filesStorage = [];
    }

    let dateTime = (new Date()).getTime();

    fileToUpload.forEach((file: File) => {
      messagesState.filesStorage.push({
        scId: this.scId,
        dateTime: ++dateTime,
        id: UuidClass.uuidv4(),
        status: StatusEnum.notLoaded,
        user: {
          id: -this.scId,
        },
        messageContent: file,
        type: file.type.indexOf('image') >= 0 ? 'IMAGE' : 'FILE',
      });
    });

    messagesState.fileUpload = false;

    appState.getValue().messages.next(messagesState);
    appState.next(appState.getValue());
  }

  public send(state?: MessagesStateInterface): void {  // Todo: разбить

    if (!state && this.form.invalid && !this.fileToUpload?.length) { return; }

    if (this.form.controls.messageContent.disabled) {return;}
    
    const fileValid = this.fileValid(this.fileToUpload);

    if (fileValid && !fileValid.result) {
      this.enterButtonActive = false;
      alert(fileValid.errorMessage);
      return;
    }

    if (this.fileToUpload && this.fileToUpload?.length) {
      const fileToUploadCopy = [...this.fileToUpload];
      this.sendFiles(fileToUploadCopy);
      this.fileToUpload = [];
      return;
    }

    const copyMessagesState = state ? state : appState.getValue().messages.getValue();

    const params: any = {
      chatId: this.chatId,
      scId: this.scId,
    };

    const body: any = {
      scId: this.scId,
      chatId: this.chatId,
      user: {
        id: -this.scId,
      },
    };

    if (Array.isArray(copyMessagesState.selectedMessageList) && copyMessagesState.selectedMessageList.length) {

      if (copyMessagesState.action === ActionEnum.editMessage) {

        params.timeId = copyMessagesState.selectedMessageList[0].timeId || copyMessagesState.selectedMessageList[0].dateTime;

        this.parseHtmlCode();

        const message = appState.getValue().messages.getValue().messageContent.getValue().text;

        body.id = copyMessagesState.selectedMessageList[0].id;
        body.dateTime = params.timeId;
        body.type = 'TEXT';
        body.messageContent = {
          text: message,
        };
        body.mentionedUsers = copyMessagesState.selectedMessageList[0].mentionedUsers;
        body.replyMessage = copyMessagesState.selectedMessageList[0].replyMessage;

        this.subscriptions.add(this.chatsService.editMessage(params, body)
            .pipe(
              tap(() => this.loading = true),
              switchMap((value: any) => {
                this.snackBar.open('Сообщение отредактировано', 'закрыть', toastrConfig);

                copyMessagesState.action = ActionEnum.default;
                copyMessagesState.selectedMessageList = [];
                this.form.controls.messageContent.setValue('');
                appState.getValue().messages.next(copyMessagesState);

                return of(value);
              }),
              catchError((err) => {
                if (err.error && err.error.code === 'REGEXP_ERROR') {
                  alert(ErrorTitlesEnum.InvalidExpression);
                  return of(null);
                }

                if (copyMessagesState.selectedMessageList[0].status === StatusEnum.unsent) {

                  const indexMessage = copyMessagesState.unsentMessages.findIndex((message) => {
                    return message.id === copyMessagesState.selectedMessageList[0].id && message.status === copyMessagesState.selectedMessageList[0].status;
                  });

                  if (indexMessage >= 0) {
                    copyMessagesState.unsentMessages[indexMessage].messageContent.text = message;
                    copyMessagesState.unsentMessages[indexMessage].htmlCodeMessage = this.form.controls.messageContent.value;
                    copyMessagesState.selectedMessageList = [];
                    copyMessagesState.action = ActionEnum.default;
                    this.form.controls.messageContent.setValue('');
                    appState.getValue().messages.next(copyMessagesState);
                  }

                  return of([]);

                } else {

                  body.status = StatusEnum.unsent;
                  copyMessagesState.unsentMessages.push(body);
                }

                const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
                this.snackBar.open(`Ошибка, редактирование не удалось ${ description }`, 'закрыть', toastrConfig);

                return of([]);
              }),
              debounceTime(300),
            )
            .subscribe((value: any) => {
              if (!value) { return; }

              this.loading = false;
            })
        );

        return;

      } else if (copyMessagesState.action === ActionEnum.replyMessage) {

        const htmlCodeMessage = this.form.controls.messageContent.value;

        this.parseHtmlCode();

        const message = appState.getValue().messages.getValue().messageContent.getValue().text;

        body.messageContent = {
          text: `${message} <oid:${appState.getValue().messages.getValue().selectedMessageList[0].user.id}>`,
          mention: true,
        };
        body.replyMessage = copyMessagesState.selectedMessageList[0];
        body.replyMessage.dateTime = copyMessagesState.selectedMessageList[0].timeId || copyMessagesState.selectedMessageList[0].dateTime;
        body.type = 'TEXT';

        this.subscriptions.add(this.chatsService.sendMessage(params, body)
            .pipe(
              tap(() => this.loading = true),
              catchError((err) => {
                if (err.error && err.error.code === 'REGEXP_ERROR') {
                  alert(ErrorTitlesEnum.InvalidExpression);
                  return of(null);
                }

                const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
                this.snackBar.open(`Ошибка, сообщение не отправлено ${ description }`, 'закрыть', toastrConfig);

                if (!copyMessagesState.unsentMessages) {
                  copyMessagesState.unsentMessages = [];
                }

                const currentDate: Date = new Date();
                body.dateTime = currentDate.getTime();
                body.id = copyMessagesState.unsentMessages.length;
                body.status = StatusEnum.unsent;
                body.htmlCodeMessage = htmlCodeMessage;

                copyMessagesState.action = ActionEnum.default;

                copyMessagesState.unsentMessages.push(body);

                appState.getValue().messages.next(copyMessagesState);
                appState.next(appState.getValue());

                return of([]);
              }),
              debounceTime(300),
            )
            .subscribe((value: any) => {
              if (!value) { return; }

              this.form.controls.messageContent.setValue('');
              this.loading = false;
              this.resetMessagesState();
            })
        );

        return;

      } else if (copyMessagesState.selectedMessageList[0].status === StatusEnum.unsent) {

        const indexMessage = copyMessagesState.unsentMessages.findIndex((message) => {
          return message.id === copyMessagesState.selectedMessageList[0].id && message.status === copyMessagesState.selectedMessageList[0].status;
        });

        if (indexMessage < 0) {
          this.snackBar.open(`Ошибка, сообщение по прежнему не отправлено`, 'закрыть', toastrConfig);
          return;
        }

        body.dateTime = copyMessagesState.unsentMessages[indexMessage].dateTime;
        body.messageContent = {
          text: copyMessagesState.unsentMessages[indexMessage].messageContent.text,
        };
        body.type = 'TEXT';
        body.replyMessage = copyMessagesState.unsentMessages[indexMessage].replyMessage;

        this.subscriptions.add(this.chatsService.sendMessage(params, body)
            .pipe(
              tap(() => this.loading = true),
              switchMap((value: any) => {
                this.snackBar.open('Сообщение отправлено', 'закрыть', toastrBottomConfig);

                copyMessagesState.action = ActionEnum.default;
                copyMessagesState.unsentMessages.splice(indexMessage, 1);
                copyMessagesState.selectedMessageList = [];

                appState.getValue().messages.next(copyMessagesState);
                appState.next(Object.assign({}, appState.getValue()));

                return of(value);
              }),
              catchError((err) => {
                if (err.error && err.error.code === 'REGEXP_ERROR') {
                  alert(ErrorTitlesEnum.InvalidExpression);
                  return of(null);
                }

                const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
                this.snackBar.open(`Ошибка, сообщение по прежнему не отправлено ${ description }`, 'закрыть', toastrConfig);

                copyMessagesState.action = ActionEnum.default;
                copyMessagesState.selectedMessageList = [];

                appState.getValue().messages.next(copyMessagesState);

                return of([]);
              }),
              debounceTime(300),
            )
            .subscribe((value: any) => {
              if (!value) { return; }

              this.loading = false;
            })
        );

        return;
      }

    } else {

      const htmlCodeMessage = this.form.controls.messageContent.value;

      this.parseHtmlCode();

      const message = appState.getValue().messages.getValue().messageContent.getValue().text;

      body.messageContent = {
        text: message,
      };
      body.type = 'TEXT';

      this.subscriptions.add(this.chatsService.sendMessage(params, body)
          .pipe(
            tap(() => this.loading = true),
            switchMap((value: any) => {
              
              this.snackBar.open('Сообщение отправлено', 'закрыть', toastrBottomConfig);

              copyMessagesState.action = ActionEnum.default;
              copyMessagesState.selectedMessageList = [];

              // console.warn(copyMessagesState);
              
              appState.getValue().messages.next(copyMessagesState);
              // console.warn(appState.getValue());
              return of(value);
            }),
            catchError((err) => {

              if (err.error && err.error.code === 'REGEXP_ERROR') {
                alert(ErrorTitlesEnum.InvalidExpression);
                return of(null);
              }

              const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
              this.snackBar.open(`Ошибка, сообщение не отправлено ${ description }`, 'закрыть', toastrConfig);

              if (!copyMessagesState.unsentMessages) {
                copyMessagesState.unsentMessages = [];
              }

              const currentDate: Date = new Date();

              body.htmlCodeMessage = htmlCodeMessage;
              body.dateTime = currentDate.getTime();
              body.id = copyMessagesState.unsentMessages.length;
              body.status = StatusEnum.unsent;

              copyMessagesState.unsentMessages.push(body);

              appState.getValue().messages.next(copyMessagesState);

              return of([]);
            }),
            debounceTime(300),
          )
          .subscribe((value: any) => {
            if (!value) { return; }

            this.form.controls.messageContent.setValue('');
            this.loading = false;
          })
      );
    }
  }

  public replayMessage(): void {
    const message = appState.getValue().messages.getValue();

    if (message.selectedMessageList.length !== 1) { return; }

    message.action = ActionEnum.replyMessage;
    appState.getValue().messages.next(message);
  }

  public handleFileInput(files: FileList) {

    if (!files || !files.length) { return; }

    if (!this.fileSubscribe) {

      this.fileSubscribe = new Subject<any>();

      this.subscriptions.add(
        this.fileSubscribe
          .subscribe((value) => {
            if ((!value || !value.filesInfo || !value.filesInfo.length) && !this.form.controls.messageContent.value) {
              this.enterButtonActive = false;
            }
          })
      )

    }

    this.fileToUpload = Array.from(files);

    this.enterButtonActive = true;

    const messagesStateCopy = appState.getValue().messages.getValue();
    messagesStateCopy.fileUpload = true;
    appState.getValue().messages.next(messagesStateCopy);
  }

  public resetMessagesState(): void {
    const messagesStateCopy: MessagesStateInterface = appState.getValue().messages.getValue();
    messagesStateCopy.action = ActionEnum.default;
    messagesStateCopy.selectedMessageList = [];
    this.form.controls.messageContent.setValue('');

    appState.getValue().messages.next(messagesStateCopy);
  }

  public parseMessages(unsentMessages: UnsentMessagesInterface[], messages: SelectedMessageListInterface[]): any {
    let sortMessages: any;

    if (!Array.isArray(unsentMessages) || !unsentMessages.length ) {
      sortMessages = messages.sort((a: any, b: any) => {
        return a.dateTime - b.dateTime;
      });
    } else {
      sortMessages = [...messages, ...unsentMessages].sort((a: any, b: any) => {
        return a.dateTime - b.dateTime;
      });
    }

    return sortMessages.filter((item, index) => sortMessages.findIndex(current => current.dateTime === item.dateTime) === index);
  }

  public deleteMessages(messageState?: MessagesStateInterface): void {
    if (!messageState) {
      messageState = appState.getValue().messages.getValue();
    }

    const selectedMessageListCopy: any = [...messageState.selectedMessageList];

    let errorsCount: number = 0;
    let subjectsCount: number = 0; // Todo: метод не принимает массив

    this.loading = true;

    const messagesCopy = [...this.messages];

    messageState.selectedMessageList.forEach((item: SelectedMessageListInterface, index) => {

      if (item.status === StatusEnum.unsent) {

        selectedMessageListCopy.splice(index, 1);

        const timeId: number = item.timeId || item.dateTime;

        const indexUnsentMessage = messageState.unsentMessages.findIndex(message => message.dateTime === timeId && message.status === item.status);
        if (indexUnsentMessage >= 0) {
          messageState.unsentMessages.splice(indexUnsentMessage, 1);
        }

        const indexMessage = this.messages.findIndex(message => message.dateTime === timeId && message.status === item.status);
        if (indexMessage >= 0) {
          messagesCopy.splice(indexMessage, 1);
        }

        if (index !== messageState.selectedMessageList.length - 1) { return; }

        this.messages = messagesCopy;

        let message = 'Сообщение удалено';

        this.snackBar.open(message, 'закрыть', toastrBottomConfig);

        this.resetDeleteAction();

        this.loading = false;

      } else {
        this.subscriptions.add(
          this.chatsService.deleteMessage({ timeId: item.dateTime || item.timeId, scId: +this.scId, chatId: this.chatId })
            .pipe(
              catchError((err) => {
                ++ errorsCount;
                return of([]);
              }),
            )
            .subscribe((value) => {
              ++ subjectsCount;

              if (subjectsCount !== messageState.selectedMessageList.length) {
                return;
              }

              let message = 'Сообщение удалено у всех';

              if (errorsCount > 0) {
                message = `Ошибка: количество неудаленных сообщений ${ errorsCount }`;
              }

              this.snackBar.open(message, 'закрыть', errorsCount ? toastrConfig : toastrBottomConfig);

              this.resetDeleteAction();

              this.loading = false;
            })
        )
      }
    });
  }

  public resetDeleteAction() {
    const copyMessagesState = appState.getValue().messages.getValue();

    copyMessagesState.action = ActionEnum.default;
    copyMessagesState.selectedMessageList = [];
    copyMessagesState.messageCheckboxOn = false;

    appState.getValue().messages.next(copyMessagesState);
  }

  public subscribeAppState(): void {
    this.subscriptions.add(appState
      .pipe(
        tap(() => this.loading = true),
        switchMap((state) => {
          if (this.subscribeIntervalId) {
            clearInterval(this.subscribeIntervalId);
          }

          if (!state.filters || !state.filters.getValue().chatFilter || !state.filters.getValue().chatFilter.checkChatId.getValue()) {
            console.error('не указан chatFilter.checkChatId в appState');
            return throwError(new Error('не удалось определить чат'));
          }

          this.chatId = state.filters.getValue().chatFilter.checkChatId.getValue();

          const filtersStateCopy = appState.getValue().filters.getValue();

          switch(filtersStateCopy.currentDisplayList.getValue()) {
            case CurrentDisplayList.message: {
              return this.chatsService.getChatMessages({ chatId: this.chatId, filter: this.search.getValue() });
            }
            case CurrentDisplayList.poll: {
              return this.chatsService.getPolls({ scId: this.scId, chatId: this.chatId, filter: this.search.getValue()});
            }
          }

        }),
        catchError((err) => {

          const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
          this.snackBar.open(description ? `Ошибка сервера ${ description }` : 'Неизвестная ошибка, проверьте соединение', 'закрыть', toastrConfig);

          clearInterval(this.subscribeIntervalId);

          this.subscribeIntervalId = setInterval(() => {
            this.subscribeAppState();
          }, 4000);

          return of(null);
        }),
        debounceTime(300),
      )
      .subscribe((messages) => {
        if (!messages) { return; }

        const currentDisplayList = appState.getValue().filters.getValue().currentDisplayList.getValue();

        switch (currentDisplayList) {

          case CurrentDisplayList.message: {

            let filesStorage = appState.getValue().messages.getValue().filesStorage;

            if (filesStorage && filesStorage.length) {

              filesStorage.forEach((file, indexFile: number) => {

                const index: number = this.messages.findIndex(item => item.id === file.id);

                if (index >= 0 && file.status === StatusEnum.loaded) {

                  this.messages.splice(index, 1);
                  appState.getValue().messages.getValue().filesStorage.splice(indexFile, 1);

                }

              });

            }

            filesStorage = appState.getValue().messages.getValue().filesStorage;

            if (filesStorage && filesStorage.length) {
              messages = [...messages, ...filesStorage];
            }

            messages = [...messages, ...this.messages];

            messages = messages.filter((item, index) => messages.findIndex(current => current.dateTime === item.dateTime) === index);

            this.messages = this.parseMessages(appState.getValue().messages.getValue().unsentMessages, messages);

            break;
          }

          case CurrentDisplayList.poll: {

            const messagesCopy = this.messages.filter(item => item.type.toLowerCase() === CurrentDisplayList.poll);

            const polls = [...messagesCopy, ...messages.filter(item => item.type.toLowerCase() === CurrentDisplayList.poll)];

            this.messages = polls.filter((item, index) => polls.findIndex(poll => poll.id === item.id) === index);

            break;
          }
        }

        this.loading = false;
      })
    );
  }

  public download(): void {
    const messagesStateCopy = appState.getValue().messages.getValue();

    if (!Array.isArray(messagesStateCopy.selectedMessageList) || !messagesStateCopy.selectedMessageList.length) { return; }

    const selectedMessageList = this.messageState.selectedMessageList.filter(select => this.fileFormats.findIndex(format => select.type === format) >= 0);
    if (!selectedMessageList.length) { return; }

    this.subscriptions.add(
      from(selectedMessageList)
        .pipe(
          tap(()=>console.warn('Мы тут')),
          map((selectMessage: SelectedMessageListInterface) => this.fileService.fileDownload({scId: this.scId, fileUrl: selectMessage.messageContent.url})),
          mergeMap(request => request),
          toArray(),
          catchError((err) => {
            const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
            this.snackBar.open(description ? `Ошибка, не удалось загрузить файлы ${ description }` : 'Неизвестная ошибка, проверьте соединение', 'закрыть', toastrConfig);
            return of(null);
          }),
        )
        .subscribe((files) => {
          if (!files) { return; }

          files.forEach((file: { responseText: string; }, index: number) => {
            if (file && file.responseText) {
              DownloadComponent.saveFile(file.responseText, messagesStateCopy.selectedMessageList[index].messageContent.mimeType, messagesStateCopy.selectedMessageList[index].messageContent.originalFileName);
            }
          });

          messagesStateCopy.selectedMessageList = [];
          messagesStateCopy.messageCheckboxOn = false;

          appState.getValue().messages.next(messagesStateCopy);
        })
    );
  }

  public complain(): void {

  }

  public getStateMessagesElement(): MainContentDOMElementStateInterface {
    if (!this.messagesElement || !this.messagesElement.nativeElement) { return; }

    const el: any = this.messagesElement.nativeElement;
    const elScrollHeight = Math.max(el.scrollHeight, el.offsetHeight, el.clientHeight);

    return {
      scrollHeight: elScrollHeight,
      scrollTop: el.scrollTop,
      clientHeight: el.clientHeight,
    };
  }

  public scrollToBottom(): void {

    if (!this.messagesElement || !this.messagesElement.nativeElement) { return; }

    const stateMessagesElement: MainContentDOMElementStateInterface = this.getStateMessagesElement();

    try {
      this.messagesElement.nativeElement.scrollTop = stateMessagesElement.scrollHeight;
    } catch(err) { }

    this.goToBottomButtonShow = this.goToMentionButtonShow = false;

    this.clearChatMentionsMessages(this.chatId);
  }

  public clearChatMentionsMessages(chatId: number): void {
    if (!appState.getValue().messages || !appState.getValue().messages.getValue().mentionsMessages ||
      !appState.getValue().messages.getValue().mentionsMessages.getValue()[chatId]) { return; }

    const mentionsMessages = appState.getValue().messages.getValue().mentionsMessages.getValue();

    mentionsMessages[chatId] = [];

    appState.getValue().messages.getValue().mentionsMessages.next(mentionsMessages);
  }

  public scrollToMention(): void {

    const mentionsMessagesStateCopy = appState.getValue().messages.getValue().mentionsMessages.getValue();

    let searchDate: number = mentionsMessagesStateCopy[this.chatId][0].dateTime;

    const index: number = this.messages.findIndex(message => message.dateTime === searchDate);

    if (index >= 0) {

      if (this.messagesElement.nativeElement.children[index].offsetTop >= 0) {
        this.messagesElement.nativeElement.scrollTop = this.messagesElement.nativeElement.children[index].offsetTop;
      }

      const mentionsMessagesStateCopy =  appState.getValue().messages.getValue().mentionsMessages.getValue();
      const mentionsMessages: MessageInterface[] = mentionsMessagesStateCopy[this.chatId];
      mentionsMessages.splice(0, 1);

      mentionsMessagesStateCopy[this.chatId] = mentionsMessages;

      appState.getValue().messages.getValue().mentionsMessages.next(mentionsMessagesStateCopy);

      const params = {chatId: this.chatId, scId: this.scId, timeId: searchDate};

      const readSubscribe: Subscription = this.chatsService.readMessage(params, params)
        .pipe(
          catchError((err) => {
            console.error(err);

            return of(null);
          }),
        )
        .subscribe((value) => {
          readSubscribe.unsubscribe();
        });

      return;
    }

  }

  public scrollHandler($event: WheelEvent | any): void {
    const stateMessagesElement: MainContentDOMElementStateInterface = this.getStateMessagesElement();

    if (!this.messages || !this.messages.length) { return; }

    if (stateMessagesElement.scrollTop === 0) {

      const oldStateSearch = this.search.getValue();
      oldStateSearch.olderThan = this.messages[0].dateTime;
      delete oldStateSearch.youngerThan;
      oldStateSearch.limit = 30;

      this.search.next(oldStateSearch);

      appState.next(appState.getValue());

    } else if (stateMessagesElement.scrollTop + stateMessagesElement.clientHeight === stateMessagesElement.scrollHeight) {

      this.goToBottomButtonShow = this.goToMentionButtonShow = false;

      const mentionsMessagesStateCopy = appState.getValue().messages.getValue().mentionsMessages.getValue();
      mentionsMessagesStateCopy[this.chatId] = [];

      appState.getValue().messages.getValue().mentionsMessages.next(mentionsMessagesStateCopy);

      const oldStateSearch = this.search.getValue();
      oldStateSearch.youngerThan = this.messages[this.messages.length - 1].dateTime;
      delete oldStateSearch.olderThan;
      oldStateSearch.limit = 30;

      this.search.next(oldStateSearch);

      appState.next(appState.getValue());
    }

    $event.stopImmediatePropagation();
    $event.stopPropagation();
    $event.preventDefault();
  }

  public initScrollSubscribe(): void {

    if (!this.messagesElement || !this.messagesElement.nativeElement) { return; }

    this.subscriptions.add(
      fromEvent(this.messagesElement.nativeElement, 'DOMMouseScroll')
        .pipe(debounceTime(300))
        .subscribe(($event: WheelEvent | any) => {

          this.scrollHandler($event);
        })
    );

    this.subscriptions.add(
      fromEvent(this.messagesElement.nativeElement, 'mousewheel')
        .pipe(debounceTime(300))
        .subscribe(($event: WheelEvent | any) => {

          this.scrollHandler($event);
        })
    );
  }

  static setChatMentions(chatId): void {

    if (!appState.getValue().messages.getValue().mentionsMessages) {

      appState.getValue().messages.getValue().mentionsMessages = new BehaviorSubject<{[key: string] : MessageInterface[]}>({ [chatId]: [] });

    } else if (!appState.getValue().messages.getValue().mentionsMessages.getValue()[chatId]) {

      const mentionsMessagesStateCopy = appState.getValue().messages.getValue().mentionsMessages.getValue();

      mentionsMessagesStateCopy[chatId] = [];
      appState.getValue().messages.getValue().mentionsMessages.next(mentionsMessagesStateCopy);

    }

  }

  public subscribeSocket(): void {

    const mentionsMessages = appState.getValue().messages.getValue().mentionsMessages;

    if (mentionsMessages && mentionsMessages.getValue()[this.chatId]) { return; }

    MessageComponent.setChatMentions(this.chatId);
    
    this.subscriptions.add(this.socketService.connect(this.chatId)
      .pipe(
        switchMap((value: SocketInterface) => {
          
          if (!value.open) {
            console.error(value.message);
            return of(null);
          }

          return this.socketService.emit();
        }),
        catchError((err) => {
          console.error(err);
          return of(null);
        })
      )
      .subscribe((value: SocketInterface) => {
        
        if (!value || !value.data) { return; }

        const socketMessage: SocketMessageInterface = JSON.parse(value.data);

        switch (socketMessage.type) {
          case 'ONLINE': { return; }
          case 'TEXT': {
            const messagesCopy = [...this.messages];

            if (socketMessage.updated) {
              const index = messagesCopy.findIndex(item => item.id === socketMessage.id);

              if (index < 0) { return; }

              messagesCopy.splice(index, 1, socketMessage);

            } else {

              messagesCopy.push(socketMessage);

            }

            if (Math.abs(socketMessage.user.id) === this.scId) {

              setTimeout(() => {
                this.scrollToBottom();
              }, 0);

            }

            this.messages = this.parseMessages(appState.getValue().messages.getValue().unsentMessages, messagesCopy);

            let socketMessageCopy = null;

            if (socketMessage.reply) {

              if (Math.abs(socketMessage.replyMessage.user.id) === this.scId) {

                socketMessageCopy = socketMessage;

              } else if (Array.isArray(socketMessage.mentionedUsers) && Math.abs(socketMessage.user.id) !== this.scId) {

                const index = socketMessage.mentionedUsers.findIndex(user => Math.abs(user.id) === this.scId);

                if (index >= 0) {

                  socketMessageCopy = socketMessage;

                }

              }

            } else if (socketMessage.messageContent.mention) {

              if (Array.isArray(socketMessage.mentionedUsers) && socketMessage.mentionedUsers.findIndex(user => Math.abs(user.id) === this.scId) >= 0) {

                socketMessageCopy = socketMessage;

              }

            }

            if (socketMessageCopy) {

              const mentionsMessagesStateCopy =  appState.getValue().messages.getValue().mentionsMessages.getValue();
              const mentionsMessages: MessageInterface[] = mentionsMessagesStateCopy[this.chatId];

              mentionsMessages.push(socketMessage);

              mentionsMessagesStateCopy[this.chatId] = mentionsMessages;

              appState.getValue().messages.getValue().mentionsMessages.next(mentionsMessagesStateCopy);

            }

            break;
          }
          case 'IMAGE': {
            const messagesCopy = [...this.messages];

            if (socketMessage.updated) {
              const index = messagesCopy.findIndex(item => item.id === socketMessage.id);

              if (index < 0) { return; }

              messagesCopy.splice(index, 1, socketMessage);

            } else {

              messagesCopy.push(socketMessage);

              if (Math.abs(socketMessage.user.id) === this.scId) {

                setTimeout(() => {
                  this.scrollToBottom();
                }, 0);

              }

            }

            this.messages = this.parseMessages(appState.getValue().messages.getValue().unsentMessages, messagesCopy);
            break;
          }
          case 'FILE': {
            const messagesCopy = [...this.messages];

            if (socketMessage.updated) {
              const index = messagesCopy.findIndex(item => item.id === socketMessage.id);

              if (index < 0) { return; }

              messagesCopy.splice(index, 1, socketMessage);

            } else {

              messagesCopy.push(socketMessage);

              if (Math.abs(socketMessage.user.id) === this.scId) {

                setTimeout(() => {
                  this.scrollToBottom();
                }, 0);

              }

            }

            this.messages = this.parseMessages(appState.getValue().messages.getValue().unsentMessages, messagesCopy);
            break;
          }
          case 'REMOVED': {
            if (!socketMessage.id) {
              return;
            }

            const messagesCopy = [...this.messages];

            const index = messagesCopy.findIndex(item => item.id === socketMessage.id);

            if (index < 0) { return; }

            messagesCopy.splice(index, 1);

            this.messages = this.parseMessages(appState.getValue().messages.getValue().unsentMessages, messagesCopy);

            return;
          }
          case 'REMOVED_BY_MODERATOR': {

            if (!socketMessage.id) {
              return;
            }

            const messagesCopy = [...this.messages];

            const index = messagesCopy.findIndex(item => item.id === socketMessage.id);

            if (index < 0) { return; }

            messagesCopy[index].type = socketMessage.type;
            delete messagesCopy[index].messageContent;

            this.messages = this.parseMessages(appState.getValue().messages.getValue().unsentMessages, messagesCopy);

            return;
          }
          case 'POLL_UPDATE': {
            const index = this.messages.findIndex(item => item.messageContent && item.messageContent.id && item.messageContent.id === socketMessage.messageContent.id);

            if (index < 0) { return; }

            this.messages[index].messageContent = socketMessage.messageContent;

            const messageCopy = this.messages[index];

            this.messages.splice(index, messageCopy);

            this.messages = [...this.messages];

            return;
          }
          default: {
            break;
          }
        }

        setTimeout(() => {
          const stateMessagesElement: MainContentDOMElementStateInterface = this.getStateMessagesElement();

          if (stateMessagesElement.scrollTop + stateMessagesElement.clientHeight < stateMessagesElement.scrollHeight) {

            this.goToBottomButtonShow = true;

          }
        }, 0);

      })
    );

  }

  public ngOnInit(): void {
    this.scId = +localStorage.getItem('SC_ID');

    if (!this.scId) { return; }

    this.form = this.fb.group({
      messageContent: [{value: '', disabled: this.chatsService.userAdmin}, [Validators.required, Validators.max(1000)]],
    });

    this.enterButtonActive = this.downloadButtonShow = false;

    this.subscriptions.add(
      this.form.controls.messageContent.valueChanges
        .subscribe((value) => {
          this.enterButtonActive = !!value;
        })
    );

    this.messages = [];
    this.loading = this.goToBottomButtonShow = this.goToMentionButtonShow = false;

    this.subscribeAppState();

    if (!this.chatsService.userAdmin) {
    this.subscriptions.add(
      this.chatsService.getMentionList({chatId: this.chatId, filter: {scId: this.scId}})
        .pipe(
          catchError((err) => {
            const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
            this.snackBar.open(description ? `Ошибка, не удалось получить упоминания ${ description }` : 'Неизвестная ошибка, проверьте соединение', 'закрыть', toastrConfig);

            return of(null);
          })
        )
        .subscribe((mentions) => {

          if (!mentions || !mentions.length) { return; }

          const mentionsMessagesStateCopy =  appState.getValue().messages.getValue().mentionsMessages.getValue();
          const mentionsMessages: MessageInterface[] = mentionsMessagesStateCopy[this.chatId];

          mentionsMessages.push(...mentionsMessages);

          mentionsMessagesStateCopy[this.chatId] = mentionsMessages;

          appState.getValue().messages.getValue().mentionsMessages.next(mentionsMessagesStateCopy);

        })
    );
    }

    this.subscriptions.add(
      appState.getValue().filters
        .subscribe((filters) => {

          this.subscribeSocket();

          this.currentDisplayList = filters.currentDisplayList.getValue();

          this.messages = [];
          const messagesStateCopy = appState.getValue().messages.getValue();
          messagesStateCopy.selectedMessageList = [];
          appState.getValue().messages.next(messagesStateCopy);

          this.search.next({
            olderThan: (new Date()).getTime(),
            limit: 30,
            scId: +localStorage.getItem('SC_ID'),
          });
          appState.next(appState.getValue());
        })
    );

    this.messageState = appState.getValue().messages.getValue();

    this.subscriptions.add(appState.getValue().messages
      .subscribe((state: MessagesStateInterface) => {

        switch (state.action) {
          case ActionEnum.deleteMessage: {
            this.deleteMessages(state);
            return;
          }
          case ActionEnum.sendMessage: {
            this.send(state);
            return;
          }
          case ActionEnum.goToQuote: {
            this.goToQuote(state);
            return;
          }
        }

        this.messageState = state;

        const index = this.messageState.selectedMessageList.findIndex(select => this.fileFormats.findIndex(format => select.type === format) >= 0);
        this.downloadButtonShow = (index >= 0);

        this.messages = this.parseMessages(appState.getValue().messages.getValue().unsentMessages, this.messages);
      })
    );

    this.subscriptions.add(
      appState.getValue().messages.getValue().mentionsMessages
        .subscribe((mentionsMessages) => {

          const stateMessagesElement: MainContentDOMElementStateInterface = this.getStateMessagesElement();

          if (stateMessagesElement.scrollTop + stateMessagesElement.clientHeight < stateMessagesElement.scrollHeight) {

            this.goToBottomButtonShow = true;

            this.goToMentionButtonShow = !(!mentionsMessages[this.chatId] || !mentionsMessages[this.chatId].length);

          } else {

            this.goToMentionButtonShow = this.goToBottomButtonShow = false;

          }
        })
    );

  }

  public ngAfterViewInit(): void {
    const messagesStateCopy: MessagesStateInterface = appState.getValue().messages.getValue();

    this.initScrollSubscribe();

    if (!Array.isArray(messagesStateCopy.excludedDOMElements)) {
      messagesStateCopy.excludedDOMElements = [];
    }

    messagesStateCopy.excludedDOMElements.push(this.enterButton);

    appState.getValue().messages.next(messagesStateCopy);

    const mentionsMessages = appState.getValue().messages.getValue().mentionsMessages;

    if (!mentionsMessages || !mentionsMessages.getValue()[this.chatId].length) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 1000);
    }
  }

  public ngOnDestroy(): void {
    appState.getValue().messages.getValue().mentionsMessages.next({});

    this.socketService.disconnect();

    this.subscriptions.unsubscribe();

    const copyMessagesState = appState.getValue().messages.getValue();
    copyMessagesState.selectedMessageList = [];
    copyMessagesState.messageCheckboxOn = false;

    const index = copyMessagesState.excludedDOMElements.findIndex(item => item === this.enterButton);
    if (index >= 0) {
      copyMessagesState.excludedDOMElements.splice(index, 1);
    }

    appState.getValue().messages.next(copyMessagesState);
  }

}
