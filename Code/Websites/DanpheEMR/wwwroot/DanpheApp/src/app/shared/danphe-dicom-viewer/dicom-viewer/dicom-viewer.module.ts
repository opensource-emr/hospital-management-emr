import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { DICOMViewerComponent } from './dicom-viewer.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CornerstoneDirective } from './dicom-viewer.cornerstone.directive';
import { ThumbnailDirective } from './dicom-viewer.thumbnail.directive';
import { authInterceptorProviders } from '../../token-interceptor/token-interceptor.service';

@NgModule({
  //* AuthInterceptor needed in order to inject LoginJwtToken in Request Header of every request created from this module since it is not using SharedModule
  providers: [authInterceptorProviders],
  imports: [
    FormsModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatGridListModule,
    DragAndDropModule
  ],
  declarations: [
    DICOMViewerComponent,
    CornerstoneDirective,
    ThumbnailDirective,
  ],
  exports: [
    DICOMViewerComponent,
    CornerstoneDirective,
    ThumbnailDirective
  ]
})
export class DicomViewerModule { }


