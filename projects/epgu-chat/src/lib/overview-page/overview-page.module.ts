import { NgModule } from '@angular/core';
import { OverviewPageRoutingModule } from './overview-page-routing.module';
import { OverviewPageComponent } from './overview-page.component';
import { ServicedHousesListComponent } from '../../components/serviced-houses/serviced-houses-list/serviced-houses-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WizardComponent } from '../../components/wizard/wizard.component';
import { SpinnerComponent } from '../../components/loading/spinner/spinner.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EpguLibModule } from 'epgu-lib';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ServicedHousesComponent } from '../../components/serviced-houses/serviced-houses.component';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { FileNamePipe } from '../../pipes/file/file-name.pipe';
import { MatIconModule } from '@angular/material/icon';
import { DownloadComponent } from '../../components/chat/file/download/download.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ListFilterComponent } from '../../components/list-filter/list-filter.component';

@NgModule({
  declarations: [
    OverviewPageComponent,
    WizardComponent,
    ServicedHousesComponent,
    ServicedHousesListComponent,
    SpinnerComponent,
    FileSizePipe,
    FileNamePipe,
    DownloadComponent,
    ListFilterComponent,
  ],
  exports: [
    ServicedHousesComponent,
    ServicedHousesListComponent,
    SpinnerComponent,
    ReactiveFormsModule,
    EpguLibModule,
    MatSnackBarModule,
    CommonModule,
    FileSizePipe,
    FileNamePipe,
    MatIconModule,
    DownloadComponent,
    MatDialogModule,
    ListFilterComponent,
  ],
  imports: [
    OverviewPageRoutingModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    EpguLibModule.forChild(),
    MatSnackBarModule,
    CommonModule,
  ]
})
export class OverviewPageModule { }
