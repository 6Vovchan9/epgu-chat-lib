import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { appState } from '../../constants/app-state';

@Component({
  selector: 'arm-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  set settingsShow(value: boolean) {
    const copyAppState = appState.getValue();
    copyAppState.settingsShow = value;
    appState.next(copyAppState);
  }

  get settingsShow(): boolean {
    return appState.getValue().settingsShow;
  }

  constructor() { }

  public ngOnInit(): void {

    this.subscriptions.add();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
