import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ServicedHousesListBuildingsContInterface,
  ServicedHousesListBuildingsInterface,
  ServicedHousesListService
} from '../../services/serviced-houses-list/serviced-houses-list.service';
import { Subscription } from 'rxjs';
import { adsPageFilter, AdsPageFilterInterface } from '../../constants/filter.conts';

@Component({
  selector: 'arm-list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFilterComponent implements OnInit {
  public scId: number;
  public items: AdsPageFilterInterface = adsPageFilter;

  private formGroupPrivate: FormGroup;
  private subscriptions: Subscription = new Subscription();
  private servicedHousesListPrivate: {id: number, text: string}[];

  constructor(private cd: ChangeDetectorRef,
              private servicedHousesListService: ServicedHousesListService) { }

  @Input()
  set formGroup(value: FormGroup) {
    this.formGroupPrivate = value;
    this.cd.detectChanges();
  }

  get formGroup(): FormGroup {
    return this.formGroupPrivate;
  }

  set servicedHousesList(value: {id: number, text: string}[]) {
    this.servicedHousesListPrivate = value;
    this.cd.detectChanges();
  }

  get servicedHousesList(): {id: number, text: string}[] {
    return this.servicedHousesListPrivate;
  }

  public ngOnInit(): void {

    this.scId = +localStorage.getItem('SC_ID');

    if (!this.scId) { return; }

    this.subscriptions.add(this.servicedHousesListService.getServicedHousesList({managementCompanyId: this.scId})
      .subscribe((val: ServicedHousesListBuildingsInterface) => {

        this.servicedHousesList = val.contents.map((item: ServicedHousesListBuildingsContInterface) => {
          return {
            id: item.id,
            text: item.address,
          };
        });

        if (this.servicedHousesList && this.servicedHousesList.length) {
          this.formGroup.controls.servicedHousesList.setValue(this.servicedHousesList);
        }
      }));

  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
