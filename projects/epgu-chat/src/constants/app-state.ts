import { BehaviorSubject } from 'rxjs';
import { ElementRef } from '@angular/core';

export enum CurrentDisplayList {
  message = 'message',
  poll = 'poll',
  participants = 'participants',
  default = 'message',
}

export enum DescriptionPanelActionEnum {
  edit = 'edit',
  delete = 'delete',
  copy = 'copy',
  default = '',
}

export const appState: BehaviorSubject<AppStateInterface> = new BehaviorSubject<AppStateInterface>({
  settingsShow: true,
  mainContentDOMElementState: null,
  scId: null,
  messages: new BehaviorSubject<MessagesStateInterface>({
    messageContent: new BehaviorSubject<{text: string}>({
      text: '',
    }),
  }),
  filters: new BehaviorSubject<AppStateFiltersInterface>({
    currentDisplayList: new BehaviorSubject<CurrentDisplayList>(CurrentDisplayList.default),
  }),
  progressBar: new BehaviorSubject<{show: boolean; value: number;}>({
    show: false,
    value: 0,
  }),
  descriptionPanel: new BehaviorSubject<DescriptionPanelInterface>({
    listElement: null,
    action: DescriptionPanelActionEnum.default,
  }),
  userAgreement: new BehaviorSubject<UserAgreementInterface>({
    show: true,
    agree: false,
  }),
  navigationBar: new BehaviorSubject<{ disable: boolean }>({
    disable: false,
  }),
});

export interface AppStateInterface {
  settingsShow?: boolean;
  mainContentDOMElementState?: null | MainContentDOMElementStateInterface;
  filters: BehaviorSubject<AppStateFiltersInterface>;
  scId: number;
  descriptionPanel: BehaviorSubject<DescriptionPanelInterface>;
  messages?: BehaviorSubject<MessagesStateInterface>;
  ad?: BehaviorSubject<AdInterface>;
  emNumber?: BehaviorSubject<EmNumberInterface>;
  progressBar: BehaviorSubject<ProgressBarInterface>;
  buildingList?: BehaviorSubject<BuildingListInterface>,
  userAgreement: BehaviorSubject<UserAgreementInterface>,
  navigationBar: BehaviorSubject<{ disable: boolean }>;
}

export interface UserAgreementInterface {
  show: boolean;
  agree: boolean;
}

export interface DescriptionPanelInterface {
  listElement: any,
  action: DescriptionPanelActionEnum,
}

export interface ProgressBarInterface {
  show: boolean;
  value: number;
}

export interface BuildingListInterface {
  checkboxOn: boolean;
  buildingIds?: string[];
}

export interface AdInterface {
  heading: string;
  details?: string;
  files?: BehaviorSubject<AdFileInterface[]>;
  date?: {
    dateStart: Date,
    dateEnd: Date,
  };
  change?: boolean;
  bmId?: number;
}

export interface EmNumberInterface {
  emNumberName: string;
  emNumber?: string;
  checkboxOn?: BehaviorSubject<boolean>;
  change?: boolean;
  emNumberId?: number;
}

export interface AdFileInterface {
  value?: File | any;
  id?: string;
  loadStatus?: StatusEnum;
}

export interface MainContentDOMElementStateInterface {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
}

export interface MessagesStateInterface {
  messageCheckboxOn?: boolean;
  fileUpload?: boolean;
  selectedMessageList?: SelectedMessageListInterface[];
  unsentMessages?: UnsentMessagesInterface[];
  action?: ActionEnum;
  excludedDOMElements?: ElementRef[];
  messageContent: BehaviorSubject<MessageContentInterface>;
  filesStorage?: any[];
  replyMessage?: {
    messageContent: {
      text: string;
    };
  };
  mentionsMessages?: BehaviorSubject<{[key: string]: MessageInterface[]}>;
}

export interface AppStateFiltersInterface {
  chatFilter?: {
    buildingIds?: number[];
    checkChatId?: BehaviorSubject<number>;
  }
  currentDisplayList?: BehaviorSubject<CurrentDisplayList>;
  search?: BehaviorSubject<string>;
}

export interface SelectedMessageListInterface extends MessageInterface{
  timeId: number;
  status?: string;
}

export interface UnsentMessagesInterface extends MessageInterface{
  htmlCodeMessage: string;
  status?: string;
}

export interface SocketMessageInterface extends MessageInterface {
  type: string;
  updated: boolean;
}

export interface MessageInterface {
  id: number;
  messageContent: any, //Todo
  user: UserInterface;
  dateTime: number;
  chatId: number;
  replyMessage?: MessageInterface;
  mentionedUsers?: MessageInterface[];
  type?: string;
  reply?: boolean;
  mention?: boolean;
}

export interface UserInterface {
  id: number;
  firstName?: string;
  lastName?: string;
  userOwnRole?: string
  registrationDate?: string;
}

export interface MessageContentInterface {
  text: string;
}

export interface FileMessageContentInterface {
  id: string;
  url: string;
  mimeType: string;
  originalFileName: string;
  size: {
    sizeByte: number,
    unit: string;
    convertSize: number
  }
}

export enum ActionEnum {
  editMessage = 'editMessage',
  deleteMessage = 'deleteMessage',
  replyMessage = 'replyMessage',
  sendMessage = 'sendMessage',
  goToQuote = 'goToQuote',
  default = '',
}

export enum StatusEnum {
  unsent = 'unsent',
  loaded = 'loaded',
  notLoaded = 'notLoaded',
  default = '',
}

