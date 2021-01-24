import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DownloadComponent } from '../file/download/download.component';

@Component({
  selector: 'app-photo-preview',
  templateUrl: './photo-preview.component.html',
  styleUrls: ['./photo-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoPreviewComponent implements OnInit, AfterViewInit {
  @ViewChild('img') img: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { blobUrl: string; fileName: string; }, private dialogRef: MatDialogRef<PhotoPreviewComponent>) { }

  public ngAfterViewInit(): void {
    if (!this.img) { return; }

    this.img.nativeElement.src = this.data.blobUrl;
  }

  public close(): void {
    this.dialogRef.close();
  }

  public downloadFile(): void {
    DownloadComponent.saveAs({fileName: this.data.fileName, url: this.data.blobUrl});
  }

  public ngOnInit(): void {
  }

}
