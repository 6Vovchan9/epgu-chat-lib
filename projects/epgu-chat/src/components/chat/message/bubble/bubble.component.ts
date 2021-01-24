import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { fromEvent, of, Subject, Subscription } from 'rxjs';
import {
  ActionEnum,
  appState,
  CurrentDisplayList,
  MessagesStateInterface,
  SelectedMessageListInterface, UserInterface,
} from '../../../../constants/app-state';
import { ChatsService } from '../../../../services/chats/chats.service';
import { catchError, takeWhile } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toastrConfig } from '../../../../constants/notifications';
import { HammerGestureConfig } from '@angular/platform-browser';
import { NgxLinkifyjsService } from 'ngx-linkifyjs';

@Component({
  selector: 'arm-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BubbleComponent implements OnInit, DoCheck, OnDestroy {
  private rightClickGlobalInstance: any;
  private clickGlobalInstance: any;
  private subscriptions: Subscription = new Subscription();
  private messageStatePrivate: MessagesStateInterface;
  private messagePrivate: SelectedMessageListInterface;

  public scId: string;
  public showMenuPrivate: boolean;
  public checkBoxValue: boolean;
  public fileSubscribe: Subject<any>;
  public menuBottomPositionPrivate: boolean;
  public popularAnswerId: number;
  public fileFormats: string[] = ['FILE', 'IMAGE'];
  public alive:boolean = true;

  @ViewChild('messageElement') messageElement: ElementRef;

  @Input()
  set message(value: SelectedMessageListInterface) {

    if (value && value.type && this.fileFormats.indexOf(value.type) >= 0) {
      this.fileSubscribe = new Subject<any>();

      this.subscriptions.add(
        this.fileSubscribe
          .subscribe((value) => {

            if (!value || !value.filesInfo || !value.filesInfo.length) {

              this.message = null;
            }
          })
      );
    }
    

    this.messagePrivate = value;
    this.cd.detectChanges();

    if (!this.fileSubscribe || !value || (value.type && this.fileFormats.indexOf(value.type) < 0)) { return; }

    this.fileSubscribe.next({sender: 'parent', command: 'unload', filesInfo: [value]})
  }

  get message(): SelectedMessageListInterface {
    return this.messagePrivate;
  }

  set messageState(value: MessagesStateInterface) {
    this.messageStatePrivate = value;
    this.cd.detectChanges();
  }

  get messageState(): MessagesStateInterface {
    return this.messageStatePrivate;
  }

  set showMenu(value: boolean) {
    this.showMenuPrivate = value;
    this.cd.detectChanges();
  }

  get showMenu(): boolean {
    return this.showMenuPrivate;
  }

  set menuBottomPosition(value: boolean) {
    this.menuBottomPositionPrivate = value;
    this.cd.detectChanges();
  }

  get menuBottomPosition(): boolean {
    return this.menuBottomPositionPrivate;
  }

  constructor(private renderer: Renderer2,
              private chatsService: ChatsService,
              private snackBar: MatSnackBar,
              private cd: ChangeDetectorRef) {
  }

  public onRightClick(event) {
    event.preventDefault();

    if (appState.getValue().filters.getValue().currentDisplayList.getValue() === CurrentDisplayList.poll) { return; }

    this.showMenu = true;

    if (event.clientY < 350) {
      this.menuBottomPosition = true;
    }

    if (!this.rightClickGlobalInstance) {
      this.rightClickGlobalInstance = this.renderer.listen(document, 'contextmenu', (ev) => {

        this.hideAllCheckbox();

        if (this.messageElement.nativeElement.contains(ev.target)) { return; }

        this.rightClickGlobalInstance();
        this.rightClickGlobalInstance = null;
        this.showMenu = false;
      });
    }

    if (!this.clickGlobalInstance) {
      this.clickGlobalInstance = this.renderer.listen(document, 'click', (ev) => {
        this.clickGlobalInstance();
        this.clickGlobalInstance = null;
        this.showMenu = false;
      });
    }
  }

  public toVote(answer): void {

    const chatId: number = appState.getValue().filters.getValue().chatFilter.checkChatId.getValue();

    const params: any = {
      scId: +this.scId,
      chatId: chatId,
    };

    if (this.message.messageContent.voteAnswerId === answer.id) {
      params.pollId = this.message.messageContent.id;

      this.subscriptions.add(
        this.chatsService.deleteVote(params)
          .pipe(
            catchError((err) => {
              const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
              this.snackBar.open(`Ошибка, не удалось удалить голос ${ description }`, 'закрыть', toastrConfig);
              return of(null);
            })
          )
          .subscribe(() => {})
      );
      return;
    }

    params.answerId = answer.id;

    this.subscriptions.add(
      this.chatsService.toVote(params, params)
        .pipe(
          catchError((err) => {
            const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
            this.snackBar.open(`Ошибка, не удалось проголосовать ${ description }`, 'закрыть', toastrConfig);
            return of(null);
          }),
        )
        .subscribe(() => {})
    );

  }

  public cropText(string): string {
    if (typeof string !== 'string') { return; }

    const n = 50;

    if (string.length <= n) { return string; }

    return `${string.substr(0, n)}...`;
  }

  public hideAllCheckbox() {
    if (!appState.getValue().messages.getValue().messageCheckboxOn) { return; }

    const copyMessagesState = appState.getValue().messages.getValue();

    copyMessagesState.messageCheckboxOn = false;

    appState.getValue().messages.next(copyMessagesState);
  }

  public checkBoxChange(): void {
    const copyMessagesState: MessagesStateInterface = appState.getValue().messages.getValue();

    if (this.checkBoxValue) {
      copyMessagesState.selectedMessageList.push({
        id: this.message.id,
        messageContent: this.message.messageContent,
        user: this.message.user,
        dateTime: this.message.dateTime,
        chatId: this.message.chatId,
        timeId: this.message.dateTime,
        type: this.message.type,
      });
    } else {
      const copySelectedMessageList: SelectedMessageListInterface[] = copyMessagesState.selectedMessageList;
      const index: number = copySelectedMessageList.findIndex(item => item.id === this.message.id);

      if (index < 0) { return; }

      copySelectedMessageList.splice(index, 1);

      copyMessagesState.selectedMessageList = copySelectedMessageList;
    }

    appState.getValue().messages.next(copyMessagesState);
  }

  public messageCheckboxOn(): void {
    const copyMessagesState:MessagesStateInterface = appState.getValue().messages.getValue();

    copyMessagesState.messageCheckboxOn = true;
    copyMessagesState.selectedMessageList = [];

    appState.getValue().messages.next(copyMessagesState);
  }

  public votersNumber(): number {
    return this.message.messageContent.answers.reduce((accum, item) => {
      return accum + item.voteCount;
    }, 0);
  }

  public setMessageAction(action: string): void {
    if (!action) { return; }

    const copyMessagesState: MessagesStateInterface = appState.getValue().messages.getValue();

    if (!copyMessagesState.selectedMessageList) {
      copyMessagesState.selectedMessageList = [];
    }

    switch (action) {
      case ActionEnum.deleteMessage: {
        copyMessagesState.action = ActionEnum.deleteMessage;
        break;
      }
      case ActionEnum.replyMessage: {
        copyMessagesState.action = ActionEnum.replyMessage;
        break;
      }
      case ActionEnum.editMessage: {
        copyMessagesState.action = ActionEnum.editMessage;
        break;
      }
      case ActionEnum.sendMessage: {
        copyMessagesState.action = ActionEnum.sendMessage;
        copyMessagesState.selectedMessageList = [];
        break;
      }
      case ActionEnum.goToQuote: {

        if (!this.message.replyMessage || !this.message.replyMessage.dateTime) { return; }

        copyMessagesState.action = ActionEnum.goToQuote;
        copyMessagesState.selectedMessageList = [];
        break;
      }
      default: {
        break;
      }
    }

    copyMessagesState.selectedMessageList.push(this.message);

    appState.getValue().messages.next(copyMessagesState);
  }

  public trackByFn(index): number {
    return index;
  }

  public recalculateSurveyResults(): void {
    if (this.message && this.message.type && this.message.type === 'POLL' && this.message.messageContent && this.message.messageContent.voteAnswerId >= 0) {

      if (!Array.isArray(this.message.messageContent.answers)) { return; }

      let answers = [...this.message.messageContent.answers];

      answers.sort((a: any, b: any) => {
        return a.voteCount - b.voteCount;
      });

      this.popularAnswerId = answers[answers.length - 1].id;
    }

    this.cd.markForCheck();
  }

  public replaceOID(string, mentionedUsers): string {

    if (!Array.isArray(mentionedUsers) || !mentionedUsers.length) {
      return string;
    }

    let result: string = string;

    this.message.mentionedUsers.forEach((item: UserInterface) => {
      result = result.replace(`<oid:${item.id}>`, ` @${item.firstName} `);
    })

    return result;
  }

  public ngOnInit(): void {
    this.scId = localStorage.getItem('SC_ID');

    if (!this.scId) { return; }

    this.showMenu = this.checkBoxValue = false;

    this.messageState = appState.getValue().messages.getValue();

    this.subscriptions.add(appState.getValue().messages
      .subscribe((state: MessagesStateInterface) => {
        if (!state.selectedMessageList || !state.selectedMessageList.length) { this.checkBoxValue = false; }

        this.messageState = state;
      })
    );

    const hammerConfig = new HammerGestureConfig()
    const hammer = hammerConfig.buildHammer(this.messageElement.nativeElement);
    fromEvent(hammer, 'swipe')
      .pipe(
        takeWhile(() => this.alive))
      .subscribe((res: any) => {
        this.setMessageAction('replyMessage');
      });

    fromEvent(hammer, 'tap')
      .pipe(
        takeWhile(() => this.alive))
      .subscribe((res: any) => {
        const action: string = appState.getValue().messages.getValue().action;

        if (this.showMenu) { return; }

        this.setMessageAction('goToQuote');
      });
  }

  public ngDoCheck(): void {
    this.recalculateSurveyResults();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

    this.alive = false;

    if (this.rightClickGlobalInstance) { this.rightClickGlobalInstance(); }
    if (this.clickGlobalInstance) { this.clickGlobalInstance(); }
  }

}
