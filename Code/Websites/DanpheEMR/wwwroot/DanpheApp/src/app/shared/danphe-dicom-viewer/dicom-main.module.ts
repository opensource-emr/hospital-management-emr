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
import { authInterceptorProviders } from '../token-interceptor/token-interceptor.service';

@NgModule({
  //* AuthInterceptor needed in order to inject LoginJwtToken in Request Header of every request created from this module since it is not using SharedModule
  providers: [DicomService,
    {
      provide: ActivatedRoute,
    }, authInterceptorProviders
  ],
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
  exports: [DicomLoadStudyComponent],
  bootstrap: [DicomLoadStudyComponent]
})
export class DicomMainModule { }
