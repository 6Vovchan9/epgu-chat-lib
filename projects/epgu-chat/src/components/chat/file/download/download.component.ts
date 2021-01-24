import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { SelectedMessageListInterface } from '../../../../constants/app-state';
import { FileService } from '../../../../services/file/file.service';
import { of, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PhotoPreviewComponent } from '../../photo-preview/photo-preview.component';

@Component({
  selector: 'arm-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadComponent implements OnInit, AfterViewInit {
  private loadingPrivate: boolean;
  private messagePrivate: SelectedMessageListInterface;
  private subscriptions: Subscription = new Subscription();

  public scId: number;
  public blobUrl: string;

  @ViewChild('img') img: ElementRef;

  @Input()
  set message(value: SelectedMessageListInterface) {
    this.messagePrivate = value;
    console.warn(value);
    
    this.cd.detectChanges();
  }

  get message(): SelectedMessageListInterface {
    return this.messagePrivate;
  }

  set loading(value: boolean) {
    this.loadingPrivate = value;
    this.cd.detectChanges();
  }

  get loading(): boolean {
    return this.loadingPrivate;
  }

  constructor(private cd: ChangeDetectorRef,
              private dialog: MatDialog,
              private fileService: FileService) { }

  static saveFile(data: any, fileType: string, fileName: string): void {
    let blob = new Blob([data], { type: fileType });
    DownloadComponent.saveAs({blob, fileName});
  }

  static saveAs(params: {fileName: string, blob?: any, url?: string}) {

    if (params.blob && !params.url) {
      params.url = window.URL.createObjectURL(params.blob);
    } else if (!params.blob && !params.url) {
      return;
    }

    let el = document.createElement('a');
    el.style.display = 'none';
    el.href = params.url;
    el.download = params.fileName;

    document.body.appendChild(el);
    el.click();

    document.body.removeChild(el);
  }

  public openPicture(): void {
    const dialogRef = this.dialog.open(PhotoPreviewComponent, {
      data: {
        blobUrl: this.blobUrl,
        fileName: this.message.messageContent.originalFileName,
      }
    });

    this.subscriptions.add(
      dialogRef.afterClosed()
        .subscribe(result => {

        })
    );
  }

  public downloadFile(fileUrl, mimeType, name) {
    this.subscriptions.add(
      this.fileService.fileDownload({scId: this.scId, fileUrl: fileUrl})
        .pipe(
          switchMap((value: any) => {
            if (value && value.responseText) {
              DownloadComponent.saveFile(value.responseText, mimeType, name);
            }

            return of(value);
          })
        )
        .subscribe((value) => {
        })
    );
  }

  public ngOnInit(): void {
    this.scId = +localStorage.getItem('SC_ID');
  }

  public ngAfterViewInit(): void {

    this.subscriptions.add(
      
      this.fileService.fileDownload({scId: this.scId, fileUrl: this.message.messageContent.url})
        .pipe(
          catchError((err) => {
            console.error('не удалось скачать файл');

            return of(null);
          })
        )
        .subscribe((value => {
          if (!value || !value.responseText) { return; }

          const blob = new Blob([value.responseText], { type: this.message.messageContent.mimeType });
          this.blobUrl = window.URL.createObjectURL(blob);
          this.img.nativeElement.src = this.blobUrl;
        }))
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
