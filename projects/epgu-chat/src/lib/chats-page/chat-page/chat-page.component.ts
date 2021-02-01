import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ServicedHousesListBuildingsInterface } from '../../../services/serviced-houses-list/serviced-houses-list.service';
import { appState, CurrentDisplayList } from '../../../constants/app-state';
import { MessageComponent } from '../../../components/chat/message/message.component';
import { ParticipantsComponent } from '../../../components/chat/participants/participants.component';
import { ChatsService } from '../../../services/chats/chats.service';

@Component({
  selector: 'arm-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private chatComponent: any;

  @ViewChild('dynamicChatComponent', { read: ViewContainerRef, static: true }) dynamicChatComponent: ViewContainerRef;

  static getParseChatList(servicedHousesList: ServicedHousesListBuildingsInterface,
                          chatList: {buildingId: number}[]): ServicedHousesListBuildingsInterface {

    if (!servicedHousesList || !servicedHousesList.contents || !chatList) { return; }

    const chatListParse: ServicedHousesListBuildingsInterface = {
      contents: [],
      total: 0,
    };

    chatList.forEach((item: {id: number; buildingId: number, address: string, createdDateTime: number, chatType: string, title: string, sc: string}) => {
      const servicedHousesListContents = servicedHousesList.contents;
      const index = servicedHousesListContents.findIndex(building => building.id === item.buildingId);

      if (index >= 0) {
        chatListParse.contents.push({
          chatId: item.id,
          id: servicedHousesListContents[index].id,
          address: servicedHousesListContents[index].address,
          cadaster: servicedHousesListContents[index].cadaster,
          createdDateTime: item.createdDateTime,
          chatType: item.chatType,
          title: item.title,
          sc: item.sc
        });
      } else {
        chatListParse.contents.push({
          chatId: item.id,
          chatType: item.chatType,
          sc: item.sc,
          title: item.title,
          address: item.address,
          createdDateTime: item.createdDateTime,
        });
      }

      ++chatListParse.total;
    });

    return chatListParse;
  }

  constructor(private activateRoute: ActivatedRoute,
              public chatsServ: ChatsService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private router: Router) {
  }

  public loadComponent(chatComponent: any): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(chatComponent);
    this.dynamicChatComponent.clear();
    const componentRef = this.dynamicChatComponent.createComponent<any>(componentFactory);
    componentRef.instance.data = chatComponent.data;
  }

  public ngOnInit(): void {

    appState.getValue().filters.getValue().currentDisplayList
      .subscribe((currentDisplayList) => {
        if (!currentDisplayList) {
          currentDisplayList = CurrentDisplayList.default;
        }

        this.chatComponent = getDynamicChatComponents(currentDisplayList);
        if (!this.chatComponent) { return; }

        this.loadComponent(this.chatComponent);

      });

    this.subscriptions.add(this.activateRoute.params
      .subscribe((params) => {
        const filtersStateCopy = appState.getValue().filters.getValue();

        if (filtersStateCopy && !filtersStateCopy.chatFilter) {
          filtersStateCopy.chatFilter = {};
        }

        if (!filtersStateCopy.chatFilter.checkChatId) {
          filtersStateCopy.chatFilter.checkChatId = new BehaviorSubject<number>(params.chatId);
        } else {
          filtersStateCopy.chatFilter.checkChatId.next(params.chatId);
        }

        appState.getValue().filters.next(filtersStateCopy);
      })
    );

    this.subscriptions.add(appState.getValue().filters
      .subscribe((filters) => {

        if (!filters || !filters.chatFilter || !filters.chatFilter.checkChatId.getValue()) { return; }

        // this.router.navigate([`management-company/chats/${filters.chatFilter.checkChatId.getValue()}`]);
        // this.router.navigate([`/${filters.chatFilter.checkChatId.getValue()}`]);
      })
    );

  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}

export function getDynamicChatComponents(componentName: string) {

  switch (componentName) {
    case CurrentDisplayList.message : {
      return MessageComponent;
    }
    case CurrentDisplayList.poll : {
      return MessageComponent;
    }
    case CurrentDisplayList.participants : {
      return ParticipantsComponent;
    }
    default: {
      return MessageComponent;
    }
  }

}
