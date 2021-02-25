import { Injectable, Directive } from '@angular/core';
import { DoctorsDLService } from './doctors.dl.service';
import { ClinicalDLService } from '../../clinical/shared/clinical.dl.service';
import * as _ from 'lodash';
import { Visit } from '../../appointments/shared/visit.model';
import { NursingDLService } from '../../nursing/shared/nursing.dl.service';
//Note: mapping is done here by blservice, component will only do the .subscribe().
@Injectable()
export class DoctorsBLService {

  constructor(public doctorsDlService: DoctorsDLService, public nursingDLService: NursingDLService,
        public clinicalDLService: ClinicalDLService) {

    }

    public GetTodaysVisits() {
        return this.doctorsDlService.GetTodaysVisits()
            .map(res => res);
    }

    public GetTodaysVisitsList(today: string) {
        return this.doctorsDlService.GetTodaysVisitsList(today)
            .map(res => res);
    }

    public GetPastVisits(fromDate: string, toDate: string) {
        return this.doctorsDlService.GetPastVisits(fromDate, toDate)
            .map(res => res);
    }

    public GetDepartMent(employeeId: number) {
        return this.doctorsDlService.GetDepartMent(employeeId)
            .map(res => res);
    }
    public GetVisitType() {
        return this.doctorsDlService.GetVisitType()
            .map(res => res);
    }

    public GetDocDeptVisits(fromDate: string, toDate: string) {
        return this.doctorsDlService.GetDocDeptVisits(fromDate, toDate)
            .map(res => res);
    }

    GetPatientPreview(patientId: number, patientVisitId: number) {
        return this.doctorsDlService.GetPatientPreview(patientId, patientVisitId)
            .map(res => res);
    }

    GetPatientOtherRequests(patientId: number, patientVisitId: number) {
        return this.doctorsDlService.GetPatientOtherRequests(patientId, patientVisitId)
            .map(res => res);
    }
    public PutActiveMedical(currentActiveMedical) {
        var temp = _.omit(currentActiveMedical, ['ActiveMedicalValidator']);
        let data = JSON.stringify(temp);
        let reqType = 'activemedical';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
    }
    //re-assign provider id for given patient visit .s
    public SetReassignedProvider(patVisit: Visit) {
        var temp = _.omit(patVisit, ['VisitValidator']);
        let data = JSON.stringify(temp);
        return this.doctorsDlService.SetReassignedProvider(data)
            .map(res => res);
    }
    public ChangeProvider(temp) {
        let data = JSON.stringify(temp);
        return this.doctorsDlService.ChangeProvider(data)
            .map(res => res);
    }
    public ConcludeVisit(visitid) {
        return this.doctorsDlService.ConcludeVisit(visitid)
            .map(res => res);
  }

  public AddComplaints(chiefComplains) {
    return this.nursingDLService.AddNewComplaint(chiefComplains).map((responseData) => {
      return responseData;
    })
  }

  public GetComplaints(patVisitId) {
    return this.nursingDLService.GetComplaints(patVisitId).map((responseData) => {
      return responseData;
    })
  }

  public UpdateComplaint(complain) {
    return this.nursingDLService.UpdateComplaint(complain).map((responseData) => {
      return responseData;
    });
  }
}
