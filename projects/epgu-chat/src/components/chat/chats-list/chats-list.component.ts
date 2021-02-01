import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatsService} from '../../../services/chats/chats.service';
import {
  ServicedHousesListBuildingsContInterface,
  ServicedHousesListBuildingsInterface,
  ServicedHousesListService
} from '../../../services/serviced-houses-list/serviced-houses-list.service';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';
import { toastrConfig } from '../../../constants/notifications';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LibDropdownInterface } from '../../../interfaces/intarfaces';
// import { ChatPageComponent } from '../../../pages/chats-page/chat-page/chat-page.component';
import { ChatPageComponent } from '../../../lib/chats-page/chat-page/chat-page.component';
import { appState, AppStateInterface } from '../../../constants/app-state';

@Component({
  selector: 'arm-chats-list',
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ChatsListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private loadingPrivate: boolean;
  private chatsListPrivate: ServicedHousesListBuildingsInterface;
  private parseServicedHousesListPrivate: LibDropdownInterface[];

  public servicedHousesList: ServicedHousesListBuildingsInterface;
  public formGroup: FormGroup;
  public scId: string;

  constructor(public chatsService: ChatsService,
              private servicedHousesListService: ServicedHousesListService,
              private fb: FormBuilder,
              private snackBar: MatSnackBar,
              private router: Router,
              private cd: ChangeDetectorRef) {}

  set parseServicedHousesList(value: LibDropdownInterface[]) {
    this.parseServicedHousesListPrivate = value;
    this.cd.detectChanges();
  }

  get parseServicedHousesList(): LibDropdownInterface[] {
    return this.parseServicedHousesListPrivate;
  }

  set chatsList(value: ServicedHousesListBuildingsInterface) {
    this.chatsListPrivate = value;
  }

  get chatsList(): ServicedHousesListBuildingsInterface {
    return this.chatsListPrivate;
  }

  set loading(value: boolean) {
    this.loadingPrivate = value;
    this.cd.detectChanges();
  }

  get loading(): boolean {
    return this.loadingPrivate;
  }

  private formGroupInit(): void {
    if (!this.scId) {
      console.error('непоределен УК id');
      return;
    }

    this.formGroup = this.fb.group({
      servicedHousesList: [this.parseServicedHousesList],
    });

    this.subscriptions.add(this.formGroup.valueChanges
      .pipe(
        tap(() => this.loading = true),
        debounceTime(500),
        switchMap((controls) => {
          const buildingIds: number[] = this.servicedHousesList.contents.map(item => item.id);

          const filtersStateCopy: any = appState.getValue().filters.getValue();

          if (!filtersStateCopy.chatFilter) {
            filtersStateCopy.chatFilter = {};
          }

          filtersStateCopy.chatFilter.buildingIds = buildingIds;

          appState.getValue().filters.next(filtersStateCopy);

          return this.chatsService.getChatsList({
            buildingIds: buildingIds.join(),
            scId: this.scId,
          });
        }),
        catchError((err) => {
          this.loading = false;
          const description = err.status && err.statusText ? `(${err.status}: ${err.statusText})` : '';
          this.snackBar.open(`Ошибка сервера ${description}`, 'закрыть', toastrConfig);
          return of(null);
        }),
      )
      .subscribe((chatList: {buildingId: number}[]) => {
        if (!chatList) { return; }

        this.chatsList = ChatPageComponent.getParseChatList(this.servicedHousesList, chatList);
        this.loading = false;
      }));

    this.formGroup.patchValue({});
  }

  public openItem(house): void {
    const filtersStateCopy: any = appState.getValue().filters.getValue();

    if (!filtersStateCopy.chatFilter.checkChatId) {
      filtersStateCopy.chatFilter.checkChatId = new BehaviorSubject<number>(house.chatId)
    } else {
      filtersStateCopy.chatFilter.checkChatId.next(house.chatId);
    }

    appState.getValue().filters.next(filtersStateCopy);
    
    let lastPath = window.location.pathname;

    // this.router.navigate([`management-company/chats/${house.chatId}`]); // было
    this.router.navigate([`${lastPath}${lastPath.endsWith('/') ? '' : '/'}${house.chatId}`]);
    // this.router.navigate([`/${house.chatId}`]);
  }

  public trackByFn(index): number {
    return index;
  }

  public ngOnInit(): void {
    this.loadingPrivate = false;
    this.scId = localStorage.getItem('SC_ID');

    if (!this.scId) {
      console.error('непоределен УК id');
      return;
    }

    this.subscriptions.add(
      this.servicedHousesListService.getServicedHousesList({
        managementCompanyId: this.scId,
      })
        .pipe(
          // tap(() => {
          //   console.warn('Hello Bro1');
            
          // }),
          tap(() => this.loading = true),
          catchError((err) => {
            // console.warn(err);
            
            this.loading = false;
            const description = err.status && err.statusText ? `(${err.status}: ${err.statusText})` : '';
            this.snackBar.open(`Ошибка сервера ${description}`, 'закрыть', toastrConfig);
            return of(null);
          }),
        )
        .subscribe((value: ServicedHousesListBuildingsInterface) => {
          if (!value) { return; }

          this.servicedHousesList = value;

          this.parseServicedHousesList = value.contents.map((item: ServicedHousesListBuildingsContInterface) => {
            return {
              id: item.id,
              text: item.address,
            };
          });

          this.formGroupInit();
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
