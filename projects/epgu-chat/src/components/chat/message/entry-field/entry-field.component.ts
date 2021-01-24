import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ActionEnum,
  appState,
  MessagesStateInterface,
  UnsentMessagesInterface
} from '../../../../constants/app-state';
import { Observable, of, Subscription } from 'rxjs';
import { ChatsService } from '../../../../services/chats/chats.service';
import { catchError, switchMap } from 'rxjs/operators';
import { toastrConfig } from '../../../../constants/notifications';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor5 } from '@ckeditor/ckeditor5-angular/ckeditor';
import { sliceString } from '../../../../pipes/message-content.pipe';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'arm-entry-field',
  templateUrl: './entry-field.component.html',
  styleUrls: ['./entry-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryFieldComponent implements OnInit, AfterViewInit, OnDestroy {
  private formPrivate: FormGroup;
  private messageStatePrivate: MessagesStateInterface;
  private subscriptions: Subscription = new Subscription();
  private messagePrivate: UnsentMessagesInterface;
  private rightClickGlobalInstance: any;
  private clickGlobalInstance: any;
  private participantsPrivate: ParticipantInterface[];

  public chatId: number;
  public scId: number;
  public mentionList: any;
  public showMessageActionPrivate: boolean;
  public editor: CKEditor5.EditorConstructor = ClassicEditor;
  public editorConfig: CKEditor5.Config;

  @ViewChild('messageElement') messageElement: ElementRef;
  @ViewChild('htmlEditor') htmlEditor: ClassicEditor;

  @Input()
  set form(value: FormGroup) {
    this.formPrivate = value;
  }

  get form(): FormGroup {
    return this.formPrivate;
  }

  set showMessageAction(value: boolean) {
    this.showMessageActionPrivate = value;
    this.cd.detectChanges();
  }

  get showMessageAction(): boolean {
    return this.showMessageActionPrivate;
  }

  set messageState(value: MessagesStateInterface) {
    this.messageStatePrivate = value;
    this.cd.detectChanges();
  }

  get messageState(): MessagesStateInterface {
    return this.messageStatePrivate;
  }

  set message(value: UnsentMessagesInterface) {
    this.messagePrivate = value;
    this.cd.detectChanges();
  }

  get message(): UnsentMessagesInterface {
    return this.messagePrivate;
  }

  set participants(value: ParticipantInterface[]) {
    this.participantsPrivate = value;
    this.cd.detectChanges();
  }

  get participants(): ParticipantInterface[] {
    return this.participantsPrivate;
  }

  constructor(private cd: ChangeDetectorRef,
              private snackBar: MatSnackBar,
              private renderer: Renderer2,
              private chatsService: ChatsService) {
  }

  public hideAllCheckbox() {
    const copyMessagesState = appState.getValue().messages.getValue();

    if (!copyMessagesState.messageCheckboxOn) { return; }
    if (copyMessagesState.action !== ActionEnum.editMessage && copyMessagesState.action !== ActionEnum.replyMessage) { return; }

    copyMessagesState.messageCheckboxOn = false;

    appState.getValue().messages.next(copyMessagesState);
  }

  public getSelectMessage(state: MessagesStateInterface): Observable<any> {
    let timeId: number = state.selectedMessageList[0].timeId || state.selectedMessageList[0].dateTime;

    if (!timeId) {
      console.log('отсутствует timeId');
      return;
    }

    if (state.selectedMessageList[0].status === 'unsent') {

      const unsentMessage: UnsentMessagesInterface = state.unsentMessages.find(item => item.dateTime === timeId);
      if (!unsentMessage) { return; }

      return of([unsentMessage]);
    }
    
    return this.chatsService.getChatMessages({
      chatId: this.chatId,
      filter: {
        limit: 1,
        scId: this.scId,
        youngerThan: timeId,
        olderThan: ++timeId,
      }
    })
  }

  public editMessage(state: MessagesStateInterface): void {
    this.hideAllCheckbox();
    this.globalEventUnsubscribe();

    this.subscriptions.add(
      this.getSelectMessage(state)
        .pipe(
          catchError((err) => {
            const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
            this.snackBar.open(description ? `Ошибка сервера ${ description }` : 'Неизвестная ошибка, проверьте соединение', 'закрыть', toastrConfig);

            state.selectedMessageList = [];
            state.action = ActionEnum.default;

            appState.getValue().messages.next(state);

            return of(null);
          }),
        )
        .subscribe((messages: UnsentMessagesInterface[]) => {
          if (!messages) { return; }

          this.message = messages[0];

          this.form.controls.messageContent.setValue(this.message.htmlCodeMessage || sliceString(this.message.messageContent.text));

          setTimeout(() => {
            this.setGlobalEventSubscription();
          }, 0);
        })
    );
  }

  public replyMessage(state: MessagesStateInterface): void {
    this.hideAllCheckbox();
    this.globalEventUnsubscribe();

    this.subscriptions.add(
      this.getSelectMessage(state)
        .pipe(
          catchError((err) => {
            const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
            this.snackBar.open(description ? `Ошибка сервера ${ description }` : 'Неизвестная ошибка, проверьте соединение', 'закрыть', toastrConfig);

            state.selectedMessageList = [];
            state.action = ActionEnum.default;

            appState.getValue().messages.next(state);

            return of(null);
          }),
        )
        .subscribe((messages) => {
          if (!messages) { return; }

          this.message = messages[0];

          this.setGlobalEventSubscription();
        })
    );
  }

  public setMentionedParticipants(participant: ParticipantInterface): void {

    const messageContentText = this.form.controls.messageContent.value;

    let lastIndex: number = messageContentText.lastIndexOf('@');

    if (lastIndex < 0) { return; }

    const oldMessageString: string = messageContentText.slice(0, lastIndex);

    const newString: string = `${oldMessageString}<span class="mention" data-mention="${participant.id}">@${participant.firstName}</span>&nbsp;</p>`;

    this.form.controls.messageContent.setValue(newString);

    this.participants = [];
  }

  public setGlobalEventSubscription() {

    this.showMessageAction = true;

    const excludedDOMElements = appState.getValue().messages.getValue().excludedDOMElements || [];

    if (!this.rightClickGlobalInstance) {
      this.rightClickGlobalInstance = this.renderer.listen(document.body, 'contextmenu', (ev) => {

        this.hideAllCheckbox();

        const index = excludedDOMElements.findIndex((element: ElementRef) => {
          return element.nativeElement.contains(ev.target);
        });

        if (index >= 0 || this.messageElement.nativeElement.contains(ev.target)) { return; }

        this.globalEventUnsubscribe();
        this.showMessageAction = false;
        this.resetMessagesState();
      });
    }

    if (!this.clickGlobalInstance) {
      this.clickGlobalInstance = this.renderer.listen(document.body, 'click', (ev) => {

        const index = excludedDOMElements.findIndex((element: ElementRef) => {
          return element.nativeElement.contains(ev.target);
        });

        if (index >= 0 || this.messageElement.nativeElement.contains(ev.target)) { return; }

        this.globalEventUnsubscribe();
        this.showMessageAction = false;
        this.resetMessagesState();
      });
    }
  }

  public globalEventUnsubscribe(): void {
    if (this.rightClickGlobalInstance) { this.rightClickGlobalInstance(); }
    if (this.clickGlobalInstance) { this.clickGlobalInstance(); }

    this.rightClickGlobalInstance = null;
    this.clickGlobalInstance = null;
  }

  public resetMessagesState(): void {
    const messagesStateCopy: MessagesStateInterface = appState.getValue().messages.getValue();
    messagesStateCopy.action = ActionEnum.default;
    messagesStateCopy.selectedMessageList = [];
    this.form.controls.messageContent.setValue('');

    appState.getValue().messages.next(messagesStateCopy);
  }

  public trackByFn(index): number {
    return index;
  }

  public getParticipants(search) {

    return new Promise((res, rej) => {
      this.chatsService.getParticipants({chatId: this.chatId, filter: { search: search}})
        .pipe(
          switchMap((value: string) => {
            return of(value);
          }),
          catchError((err) => {
            return of(null);
          }),
        )
        .subscribe((value: any) => {
          if (!value || !value.items) {
            this.participants = [];
            rej();
          }

          this.participants = value.items;

          const result = value.items.map(item => `@${item.firstName}`);

          res(result);
        })
    })
  }

  public onChange( { editor }: ChangeEvent ) {
    this.participants = [];

    const innerText: string = this.htmlEditor.elementRef.nativeElement.innerText;
    const messageContentText: string = appState.getValue().messages.getValue().messageContent.getValue().text;

    if (innerText === messageContentText) { return; }

    setTimeout(() => {
      appState.getValue().messages.getValue().messageContent.next({text: this.htmlEditor.elementRef.nativeElement.innerText});
    }, 0);
  }

  public ngOnInit(): void {
    this.scId = + localStorage.getItem('SC_ID');

    if (!this.scId) { return; }

    this.participants = [];

    this.editorConfig = { toolbar: [], mention: {
        feeds: [
          {
            marker: '@',
            feed: this.getParticipants.bind(this),
            minimumCharacters: 2,
          }
        ]
      }
    };

    this.showMessageActionPrivate = false;

    this.messageState = appState.getValue().messages.getValue();

    this.subscriptions.add(
      appState.getValue().filters
        .subscribe((filters) => {
          this.chatId = filters.chatFilter.checkChatId.getValue();
        })
    );

    this.mentionList = [];

    this.subscriptions.add(appState.getValue().messages
      .subscribe((state: MessagesStateInterface) => {
        this.messageState = state;

        switch (state.action) {
          case ActionEnum.editMessage: {
            this.editMessage(state);
            return;
          }
          case ActionEnum.replyMessage: {
            this.replyMessage(state);
            return;
          }
        }
      })
    );

  }

  public ngAfterViewInit(): void {
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

    this.globalEventUnsubscribe();
  }

}

export interface ParticipantInterface {
  firstName: string;
  id: number;
  lastName: string;
}
