import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { appState, CurrentDisplayList } from '../../../constants/app-state';

@Component({
  selector: 'arm-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();

  public searchProvider: any;
  public formGroup: FormGroup;
  public currentDisplayList: string;

  constructor(private fb: FormBuilder) { }

  public setDisplayListFilter(currentDisplayList: string): void {
    if (currentDisplayList !== CurrentDisplayList.message && currentDisplayList !== CurrentDisplayList.participants && currentDisplayList !== CurrentDisplayList.poll) { return; }

    this.currentDisplayList = currentDisplayList;

    appState.getValue().filters.getValue().currentDisplayList.next(currentDisplayList);
  }

  public ngOnInit(): void {
    this.formGroup = this.fb.group({
      search: [''],
    });

    if (!appState.getValue().filters.getValue().currentDisplayList) {
      appState.getValue().filters.getValue().currentDisplayList = new BehaviorSubject(CurrentDisplayList.default);
    }

    this.currentDisplayList = appState.getValue().filters.getValue().currentDisplayList.getValue();

    if (!appState.getValue().filters.getValue().search) {
      appState.getValue().filters.getValue().search = new BehaviorSubject<string>('');
    }

    this.searchProvider = {
      search: (query) => {
        this.formGroup.controls.search.setValue(query);
        return of(null);
      },
    };

    this.subscriptions.add(
      this.formGroup.controls.search.valueChanges
      .subscribe((value) => {
        appState.getValue().filters.getValue().search.next(value);
      })
    );

  }

}
