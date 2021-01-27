import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  ServicedHousesListBuildingsContInterface,
  ServicedHousesListBuildingsInterface,
  ServicedHousesListService
} from '../../../services/serviced-houses-list/serviced-houses-list.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { appState, MessageInterface } from '../../../constants/app-state';
import { toastrConfig } from '../../../constants/notifications';
import { BehaviorSubject, of, Subscription } from 'rxjs';
// import { ChatPageComponent } from '../../../pages/chats-page/chat-page/chat-page.component'; // delete
import { ChatPageComponent } from '../../../lib/chats-page/chat-page/chat-page.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatsService } from '../../../services/chats/chats.service';

@Component({
  selector: 'arm-chat-list-short',
  templateUrl: './chat-list-short.component.html',
  styleUrls: ['./chat-list-short.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ChatListShortComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private chatsListPrivate: ServicedHousesListBuildingsInterface;
  private loadingPrivate: boolean;
  private mentionsPrivate: {[key: string]: MessageInterface[]};

  public servicedHousesList: ServicedHousesListBuildingsInterface;
  public scId: string;

  constructor(private cd: ChangeDetectorRef,
              private servicedHousesListService: ServicedHousesListService,
              private chatsService: ChatsService,
              private snackBar: MatSnackBar) {}

  set chatsList(value: ServicedHousesListBuildingsInterface) {
    this.chatsListPrivate = value;
    this.cd.detectChanges();
  }

  get chatsList(): ServicedHousesListBuildingsInterface {
    return this.chatsListPrivate;
  }

  set mentions(value: {[key: string]: MessageInterface[]}) {
    this.mentionsPrivate = value;
    this.cd.detectChanges();
  }

  get mentions(): {[key: string]: MessageInterface[]} {
    return this.mentionsPrivate;
  }

  set loading(value: boolean) {
    this.loadingPrivate = value;
    this.cd.detectChanges();
  }

  get loading(): boolean {
    return this.loadingPrivate;
  }

  public setActiveChat(house: any): void {

    const appStateFiltersCopy = appState.getValue().filters.getValue();

    if (!appStateFiltersCopy.chatFilter.checkChatId) {
      appStateFiltersCopy.chatFilter.checkChatId = new BehaviorSubject<number>(house.chatId)
    } else {

      if (house.chatId === appStateFiltersCopy.chatFilter.checkChatId.getValue()) { return; }

      appStateFiltersCopy.chatFilter.checkChatId.next(house.chatId);
    }

    appState.getValue().filters.next(appStateFiltersCopy);
  }

  public sortChats(servicedHousesList, chatsList) {
    if (!Array.isArray(servicedHousesList.contents)) { return; }

    if (!chatsList || !chatsList.contents) { return; }

    const sortChatList = [];

    const filtersStateCopy = appState.getValue().filters.getValue();

    if (filtersStateCopy && filtersStateCopy.chatFilter && filtersStateCopy.chatFilter.checkChatId.getValue()) {
      const checkChatId: number = filtersStateCopy.chatFilter.checkChatId.getValue();

      chatsList.contents.forEach((item: ServicedHousesListBuildingsContInterface) => {
        if (item.chatId !== +checkChatId) {
          sortChatList.push(item);
        } else {
          sortChatList.unshift(item);
        }
      });

      chatsList.contents = sortChatList;
    }

    return chatsList;
  }

  public trackByFn(index): number {
    return index;
  }

  public ngOnInit(): void {
    this.scId = localStorage.getItem('SC_ID');

    if (!this.scId) { return; }

    this.loading = false;



    this.subscriptions.add(
      this.servicedHousesListService.getServicedHousesList({
        managementCompanyId: this.scId,
      })
        .pipe(
          tap(() => this.loading = true),
          switchMap((servicedHousesList: any) => {
            this.servicedHousesList = servicedHousesList;

            const chatParams: any = {
              scId: this.scId,
            };

            let buildingIds: number[];

            const filtersStateCopy = appState.getValue().filters.getValue();

            if (filtersStateCopy && filtersStateCopy.chatFilter && Array.isArray(filtersStateCopy.chatFilter.buildingIds)) {
              buildingIds = filtersStateCopy.chatFilter.buildingIds;
            } else if (this.servicedHousesList && Array.isArray(this.servicedHousesList.contents)) {
              buildingIds = this.servicedHousesList.contents.map((house: ServicedHousesListBuildingsContInterface) => house.id);
            }

            if (Array.isArray(buildingIds) && buildingIds.length) {
              chatParams.buildingIds = buildingIds.join();
            }
            
            return this.chatsService.getChatsList(chatParams);
          }),
          catchError((err) => {
            this.loading = false;
            const description = err.status && err.statusText ? `(${err.status}: ${err.statusText})` : '';
            this.snackBar.open(`Ошибка сервера ${description}`, 'закрыть', toastrConfig);
            return of([]);
          }),
        )
        .subscribe((chats: any) => {

          const chatsList = ChatPageComponent.getParseChatList(this.servicedHousesList, chats);
          this.chatsList = this.sortChats(this.servicedHousesList, chatsList);

          this.loading = false;

        })
    );

    this.subscriptions.add(
      appState.getValue().filters
        .subscribe((filters) => {

          if (!filters || !this.servicedHousesList || !this.chatsList) { return; }

          this.chatsList = this.sortChats(this.servicedHousesList, this.chatsList);
        })
    );
  }

  public ngAfterViewInit(): void {
    if (!appState.getValue().messages || !appState.getValue().messages.getValue().mentionsMessages) { return; }

    this.subscriptions.add(
      appState.getValue().messages.getValue().mentionsMessages
        .subscribe((mentionsMessages: {[key: string]: MessageInterface[]}) => {
          this.mentions = mentionsMessages;
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
