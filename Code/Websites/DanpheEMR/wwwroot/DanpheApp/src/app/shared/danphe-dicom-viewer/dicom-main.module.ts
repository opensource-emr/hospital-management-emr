import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, ActivatedRoute } from '@angular/router'
import { DicomLoadStudyComponent } from './dicom-load-study/dicom-load-study.component';
import { DicomViewerModule } from './dicom-viewer/dicom-viewer.module';
import { DicomService } from './shared/dicom.service';

@NgModule({
  declarations: [
    DicomLoadStudyComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    MatProgressSpinnerModule,
    DicomViewerModule,
    HttpClientModule
  ],
  providers: [DicomService,
    {
      provide: ActivatedRoute,
    }
  ],
  exports: [DicomLoadStudyComponent],
  bootstrap: [DicomLoadStudyComponent]
})
export class DicomMainModule { }
