import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { ChatsService } from '../../../../services/chats/chats.service';
import { appState } from '../../../../constants/app-state';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';
import { ErrorTitlesEnum } from '../../../../enums/error-titles.enum';
import { toastrConfig } from '../../../../constants/notifications';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'arm-new-poll',
  templateUrl: './new-poll.component.html',
  styleUrls: ['./new-poll.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPollComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private loadingPrivate: boolean;

  public buttonDisable: boolean;
  public formGroup: FormGroup;
  public scId: number;

  constructor(private fb: FormBuilder,
              private cd: ChangeDetectorRef,
              private snackBar: MatSnackBar,
              private location: Location,
              private chatService: ChatsService) { }

  set loading(value: boolean) {
    this.loadingPrivate = value;
    this.cd.detectChanges();
  }

  get loading(): boolean {
    return this.loadingPrivate;
  }

  public addOption(): void {
    if (this.formGroup.controls.answerOptions.value.length >= 10) { return; }

    (<FormArray>this.formGroup.controls.answerOptions).push(new FormControl('', Validators.required));
  }

  public removeOption(i): void {
    if (this.formGroup.controls.answerOptions.value.length < 3) { return; }

    (<FormArray>this.formGroup.controls.answerOptions).removeAt(i);
  }

  public sendPoll(): void {
    if (this.formGroup.invalid) { return; }

    const poll = {
      question: this.formGroup.controls.question.value,
      answers: this.formGroup.controls.answerOptions.value.map((item) => {
        return {
          title: item,
        }
      }),
    }

    const filtersStateCopy = appState.getValue().filters.getValue();

    let chatId: number;

    if (!filtersStateCopy.chatFilter) {
      chatId = 32;
    } else {
      chatId = appState.getValue().filters.getValue().chatFilter.checkChatId.getValue();
    }

    const body: any = {
      scId: this.scId,
      chatId: chatId,
      type: 'POLL',
      messageContent: poll,
      user: {
        id: -this.scId,
      },
    };

    this.subscriptions.add(
      this.chatService.sendMessage({ scId: this.scId, chatId: chatId }, body)
        .pipe(
          tap(() => this.loading = true),
          debounceTime(500),
          switchMap((response) => {
            return of(response);
          }),
          catchError((err) => {
            if (err.error && err.error.code === 'REGEXP_ERROR') {
              alert(ErrorTitlesEnum.InvalidExpression);
              return of(null);
            }

            const description = err.status && err.statusText ? `(${ err.status }: ${ err.statusText })` : '';
            this.snackBar.open(`Ошибка, опрос не удалось создать ${ description }`, 'закрыть', toastrConfig);

            return of(null);
          }),
        )
        .subscribe((response) => {
          this.loading = false;

          if (!response) { return; }

          this.location.back();
        })
    );
  }

  public ngOnInit(): void {
    this.buttonDisable = true;

    this.scId = +localStorage.getItem('SC_ID');

    if (!this.scId) { return; }

    this.formGroup = this.fb.group({
      question: ['', [Validators.required, Validators.max(130)]],
      answerOptions: this.fb.array([
        ['', Validators.required],
        ['', Validators.required],
      ]),
    });

    this.subscriptions.add(
      this.formGroup.valueChanges
        .subscribe((value) => {

          this.buttonDisable = this.formGroup.invalid;

        })
    );

    this.loading = false;
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
