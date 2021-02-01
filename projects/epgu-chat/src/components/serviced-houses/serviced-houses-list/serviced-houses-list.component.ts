import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Input, Output, OnDestroy,
} from '@angular/core';
import {
  ServicedHousesListBuildingsContInterface,
  ServicedHousesListBuildingsInterface,
} from '../../../services/serviced-houses-list/serviced-houses-list.service';
import { overviewPageFilter, MainFilterInterface } from '../../../constants/filter.conts';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { appState, AppStateInterface, BuildingListInterface } from '../../../constants/app-state';

@Component({
  selector: 'arm-serviced-houses-list',
  templateUrl: './serviced-houses-list.component.html',
  styleUrls: ['./serviced-houses-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicedHousesListComponent implements OnInit, OnDestroy {
  private servicedHousesListPrivate: ServicedHousesListBuildingsInterface;

  private subscriptions: Subscription = new Subscription();
  public items: MainFilterInterface = overviewPageFilter;
  public checkboxOn: boolean = false;
  public checkBuildings: {[buildingIndex: number]: boolean};
  public allBuildingsCheckedPrivate: boolean;

  constructor(private cd: ChangeDetectorRef) {
  }

  @Output() activeElementEmit = new EventEmitter<string>();

  @Input()
  set servicedHousesList(value: ServicedHousesListBuildingsInterface) {
    this.servicedHousesListPrivate = value;

    if (appState.getValue().buildingList && appState.getValue().buildingList.getValue().checkboxOn && value && value.contents) {

      this.checkBuildingsInit();

    }

    this.cd.detectChanges();
  }

  get servicedHousesList(): ServicedHousesListBuildingsInterface {
    return this.servicedHousesListPrivate;
  }

  set allBuildingsChecked(value: boolean) {
    this.allBuildingsCheckedPrivate = value;

    this.cd.detectChanges();
  }

  get allBuildingsChecked(): boolean {
    return this.allBuildingsCheckedPrivate;
  }

  public checkBuildingsInit(): void {

    if (!this.servicedHousesList || !this.servicedHousesList.contents || !this.servicedHousesList.contents.length) { return; }

    this.servicedHousesList.contents.forEach((item: ServicedHousesListBuildingsContInterface) => {
      if (!this.checkBuildings[item.id] && this.checkBuildings[item.id] !== false) {
        this.checkBuildings[item.id] = false;
      }
    });

    const buildingIds: string[] = appState.getValue().buildingList.getValue().buildingIds;

    
    buildingIds.forEach((buildingId: string) => {
      this.checkBuildings[buildingId] = true;
    })

    const index = Object.keys(this.checkBuildings).findIndex((key: string) => this.checkBuildings[key] !== true);

    this.allBuildingsChecked = !(index >= 0);

    this.cd.detectChanges();

    this.setBuildingListState();

  }

  public setAllBuildingsChecked(): void {

    this.allBuildingsChecked = !this.allBuildingsChecked;

    Object.keys(this.checkBuildings).forEach((key: string) => {
      this.checkBuildings[key] = this.allBuildingsChecked;
    });

    this.setBuildingListState();
  }

  public setActiveElement(house): void {
    if (this.checkboxOn) { return; }

    this.activeElementEmit.emit(house);
  }

  public checkBuilding(buildingId: number): void {

    this.checkBuildings[buildingId] = !this.checkBuildings[buildingId];

    const index = Object.keys(this.checkBuildings).findIndex((key: string) => this.checkBuildings[key] !== true);

    this.allBuildingsChecked = !(index >= 0);

    this.setBuildingListState();
  }

  public setBuildingListState(): void {
    const buildingListStateCopy = appState.getValue().buildingList.getValue();

    buildingListStateCopy.buildingIds = Object.keys(this.checkBuildings).filter((key: string) => this.checkBuildings[key] === true);
    appState.getValue().buildingList.next(buildingListStateCopy);

    this.cd.detectChanges();
  }

  public trackByFn(index): number {
    return index;
  }

  public ngOnInit(): void {

    this.checkBuildings = {};

    const appStateCopy: AppStateInterface = appState.getValue();

    if (!appState.getValue().buildingList) {

      appStateCopy.buildingList = new BehaviorSubject<BuildingListInterface>({
        checkboxOn: false,
        buildingIds: [],
      });

      appState.next(appStateCopy);
    }

    this.subscriptions.add(
      appState.getValue().buildingList
        .subscribe((value) => {

          if (this.checkboxOn === value.checkboxOn) { return; }

          this.checkboxOn = value.checkboxOn;

          this.checkBuildingsInit();

        })
    );

  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
