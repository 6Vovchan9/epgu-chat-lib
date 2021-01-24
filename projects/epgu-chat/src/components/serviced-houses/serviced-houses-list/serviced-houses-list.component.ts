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
import { overviewPageFilter, OverviewPageFilterInterface } from '../../../constants/filter.conts';
import { EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { appState } from '../../../constants/app-state';

@Component({
  selector: 'arm-serviced-houses-list',
  templateUrl: './serviced-houses-list.component.html',
  styleUrls: ['./serviced-houses-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicedHousesListComponent implements OnInit, OnDestroy {
  private servicedHousesListPrivate: ServicedHousesListBuildingsInterface;

  private subscriptions: Subscription = new Subscription();
  public items: OverviewPageFilterInterface = overviewPageFilter;
  public checkboxOn: boolean = false;
  public checkBuildings: {[buildingIndex: number]: boolean};
  public allBuildingsCheckedPrivate: boolean;

  constructor(private cd: ChangeDetectorRef) {
  }

  @Output() activeElementEmit = new EventEmitter<string>();

  @Input()
  set servicedHousesList(value: ServicedHousesListBuildingsInterface) {
    this.servicedHousesListPrivate = value;

    if (this.checkboxOn && value && value.contents) {

      value.contents.forEach((item: ServicedHousesListBuildingsContInterface) => {
        if (this.checkBuildings[item.id]) { return; }

        this.checkBuildings[item.id] = this.allBuildingsChecked;
      });

      this.setAdState();
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

  public setAllBuildingsChecked(): void {

    this.allBuildingsChecked = !this.allBuildingsChecked;

    Object.keys(this.checkBuildings).forEach((key: string) => {
      this.checkBuildings[key] = this.allBuildingsChecked;
    });

    this.cd.detectChanges();

  }

  public setActiveElement(house): void {
    if (this.checkboxOn) { return; }

    this.activeElementEmit.emit(house);
  }

  public trackByFn(index): number {
    return index;
  }

  public checkBuilding(buildingId: number): void {

    if (this.checkBuildings.hasOwnProperty(buildingId)) {
      this.checkBuildings[buildingId] = !this.checkBuildings[buildingId];

      const index = Object.keys(this.checkBuildings).findIndex((key: string) => this.checkBuildings[key] === false);
      this.allBuildingsChecked = !(index >= 0);

      this.setAdState();

      return;
    }

    this.checkBuildings[buildingId] = true;

    this.setAdState();
  }

  public setAdState(): void {
    const adStateCopy = appState.getValue().ad.getValue();

    adStateCopy.buildings = Object.keys(this.checkBuildings).filter((key: string) => this.checkBuildings[key] === true);
    appState.getValue().ad.next(adStateCopy);
  }

  public ngOnInit(): void {

    if (appState.getValue().ad) {

      const adStateCopy = appState.getValue().ad.getValue();

      if (!adStateCopy.checkboxOn || !adStateCopy.checkboxOn.getValue()) { return; }

      this.checkBuildings = {};

      this.checkboxOn = adStateCopy.checkboxOn.getValue();

      if (Array.isArray(adStateCopy.buildings) && adStateCopy.buildings.length) {

        this.allBuildingsChecked = false;

        adStateCopy.buildings.forEach(id => this.checkBuildings[id] = true);

        this.cd.detectChanges();

      } else {

        this.allBuildingsChecked = true;

      }

      this.subscriptions.add(
        adStateCopy.checkboxOn
          .subscribe((value) => {
            this.checkboxOn = value;
          })
      );
    }

  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
