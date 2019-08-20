import { Injectable, Directive } from '@angular/core';
@Injectable()
export class DicomService {
  public patientStudyId: string = "";

  constructor() { }

  public resetPatientStudyId() {
    this.patientStudyId = "";
  }


}
