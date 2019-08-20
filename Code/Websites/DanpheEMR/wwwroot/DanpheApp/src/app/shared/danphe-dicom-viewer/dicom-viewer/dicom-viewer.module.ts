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

@NgModule({
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


