import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  ServicedHousesListBuildingsInterface,
  ServicedHousesListService
} from '../../services/serviced-houses-list/serviced-houses-list.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';
import { overviewPageFilter, OverviewPageFilterInterface } from '../../constants/filter.conts';
import { appState, AppStateInterface } from '../../constants/app-state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toastrConfig } from '../../constants/notifications';

@Component({
  selector: 'arm-serviced-houses',
  templateUrl: './serviced-houses.component.html',
  styleUrls: ['./serviced-houses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicedHousesComponent implements OnInit, OnDestroy {
  private loadingPrivate: boolean = true;
  private paginationShowPrivate: boolean = false;
  private subscriptions: Subscription = new Subscription();
  private servicedHousesListPrivate: ServicedHousesListBuildingsInterface;

  public searchProvider = this.servicedHousesListService.getSearchBuildingList({managementCompanyId: 21});
  public formGroup: FormGroup;
  public items: OverviewPageFilterInterface = overviewPageFilter;
  public paginatorConfig: PaginatorInterface;
  public countSortControl: { pageSize: number } = {
    pageSize: 10,
  };
  public scId: number;

  constructor(private servicedHousesListService: ServicedHousesListService,
              private fb: FormBuilder,
              private snackBar: MatSnackBar,
              private cd: ChangeDetectorRef) {
  }

  set servicedHousesList(value: ServicedHousesListBuildingsInterface) {
    this.servicedHousesListPrivate = value;
    this.cd.detectChanges();
  }

  get servicedHousesList(): ServicedHousesListBuildingsInterface {
    return this.servicedHousesListPrivate;
  }

  set loading(value: boolean) {
    this.loadingPrivate = value;
    this.cd.detectChanges();
  }

  get loading(): boolean {
    return this.loadingPrivate;
  }

  set paginationShow(value: boolean) {
    if (this.paginationShowPrivate === value) { return; }
    this.paginationShowPrivate = value;
    this.cd.detectChanges();
  }

  get paginationShow(): boolean {
    return this.paginationShowPrivate;
  }

  public trackByFn(index): number {
    return index;
  }

  private sortDirection(val: string): string {
    const options: any[] = ['ASC'];
    return options.find(item => item === val) || '';
  }

  private sortField(val: string): string {
    const options: any[] = ['cadaster'];
    return options.find(item => item === val) || '';
  }

  public pageChanged(event: any): void {
    this.paginatorConfig.activePage = event;
    this.formGroup.controls.page.setValue(event);
  }

  public getPageSize(): number {
    switch (this.formGroup.controls.countSort.value.value) {
      case 'all': {
        return this.countSortControl.pageSize;
      }
      default: {
        this.countSortControl.pageSize = 10;
        return this.formGroup.controls.countSort.value.value;
      }
    }
  }

  public getPage(): number {
    switch (this.formGroup.controls.countSort.value.value) {
      case 'all': {
        return 0;
      }
      default: {
        return this.paginatorConfig.activePage - 1;
      }
    }
  }

  private formGroupInit(): void {
    this.formGroup = this.fb.group({
      countSort: overviewPageFilter.countSort[0],
      fieldSort: overviewPageFilter.fieldSort[0],
      search: '',
      page: 0,
    });

    if (!this.paginatorConfig) {
      this.paginatorConfig = {
        count: 0,
        pageSize: 0,
        activePage: 1,
      };
    }

    this.items = overviewPageFilter;

    this.setPaginationShow();

    this.cd.detectChanges();

    this.subscriptions.add(this.formGroup.valueChanges
      .pipe(
        tap(() => this.loading = true),
        debounceTime(500),
        switchMap((controls) => {
          return this.servicedHousesListService.getServicedHousesList({
            managementCompanyId: this.scId,
            filter: {
              search: controls.search,
              sortDirection: this.sortDirection(controls.fieldSort.value),
              sortField: this.sortField(controls.fieldSort.value),
              pageSize: this.getPageSize(),
              page: this.getPage(),
            }
          });
        }),
        catchError((err) => {
          this.loading = false;
          const description = err.status && err.statusText ? `(${err.status}: ${err.statusText})` : '';
          this.snackBar.open(`Ошибка сервера ${description}`, 'закрыть', toastrConfig);
          return of(null);
        }),
      )
      .subscribe((value: ServicedHousesListBuildingsInterface) => {
        if (!value) { return; }
        this.paginatorConfig.count = value.total;
        this.paginatorConfig.pageSize = this.formGroup.controls.countSort.value.value;
        this.loading = false;
        this.servicedHousesList = value;
        this.setPaginationShow();
      }));

    this.formGroup.patchValue({});
  }

  public openItem(building): void {
    console.log('building = ', building);
  }

  public setPaginationShow(): void {
    if (!this.paginatorConfig || !this.paginatorConfig.count || !this.paginatorConfig.pageSize || !this.servicedHousesList ||
      !this.servicedHousesList.contents || this.servicedHousesList.total <= 2 || this.formGroup.controls.countSort.value.value === 'all') {
      this.paginationShow = false;
      return;
    }

    this.paginationShow = this.servicedHousesList.contents && this.paginatorConfig.count > this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.scId = +localStorage.getItem('SC_ID');

    if (!this.scId) { return; }

    this.formGroupInit();

    this.subscriptions.add(appState
      .subscribe((state: AppStateInterface) => {
        if (!state.mainContentDOMElementState) { return; }

        const scrollHeight = state.mainContentDOMElementState.scrollHeight;
        const scrollTop = state.mainContentDOMElementState.scrollTop;
        const clientHeight = state.mainContentDOMElementState.clientHeight;

        if (scrollHeight > scrollTop + clientHeight || this.formGroup.controls.countSort.value.value !== 'all' ||
          this.servicedHousesList.contents.length === this.servicedHousesList.total) { return; }

        this.countSortControl.pageSize += 10;
        this.formGroup.patchValue({});
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

export interface PaginatorInterface {
  count: number;
  pageSize: number;
  activePage: number;
}
