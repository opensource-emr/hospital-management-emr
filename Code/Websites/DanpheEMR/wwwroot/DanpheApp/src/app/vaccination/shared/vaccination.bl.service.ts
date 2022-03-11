import { Injectable, Directive } from "@angular/core";
import { VaccinationDLService } from "./vaccination.dl.service";
import { CoreDLService } from "../../core/shared/core.dl.service";
import * as _ from 'lodash';
import * as moment from "moment";
import { VaccinationPatient } from "./vaccination-patient.model";
import { BillingDLService } from "../../billing/shared/billing.dl.service";
import { Visit } from "../../appointments/shared/visit.model";
import * as cloneDeep from 'lodash/cloneDeep';
import { ENUM_AppointmentType,ENUM_BillingStatus,ENUM_VisitStatus,ENUM_VisitType } from "../../shared/shared-enums";


@Injectable()
export class VaccinationBLService {
  constructor(
    public vaccinationDLService: VaccinationDLService, public billingDLService: BillingDLService,
    public coreDLService: CoreDLService
  ) { }

  public GetAllVaccinationPatient() {
    return this.vaccinationDLService.GetAllVaccinationPatient().map((res) => {
      return res;
    });
  }

  public GetVaccinationPatientById(id: number) {
    return this.vaccinationDLService.GetVaccinationPatientById(id).map((res) => {
      return res;
    });
  }

  public GetLatestVaccRegistrationNumber(fiscId: number = 0) {
    return this.vaccinationDLService.GetLatestVaccRegistrationNumber(fiscId).map((res) => {
      return res;
    });
  }

  public GetAllVaccinesOfPatientByPatientId(id: number) {
    return this.vaccinationDLService.GetAllVaccinesOfPatientByPatientId(id).map((res) => {
      return res;
    });
  }

  public GetAllVaccinesListWithDosesMapped(dosesNeeded: boolean) {
    return this.vaccinationDLService.GetAllVaccinesListWithDosesMapped(dosesNeeded).map((res) => {
      return res;
    });
  }

  public GetBabyPatientList(searchText: string) {
    return this.vaccinationDLService.GetBabyPatientList(searchText).map((res) => {
      return res;
    });
  }

  public GetIntegratedVaccineReport(from, to, gender, vaccList) {
    let data = JSON.stringify(vaccList);
    return this.vaccinationDLService.GetIntegratedVaccineReport(from, to, gender, data).map((res) => {
      return res;
    });
  }

public GetAppointmentDetailsReport(from, to, appointmentType) {
    return this.vaccinationDLService.GetAppointmentDetailsReport(from, to, appointmentType)
    .map((res) => {
      return res;
    });
  }

  public GetAllFiscalYears() {
    return this.billingDLService.GetAllFiscalYears()
      .map(res => { return res });
  }

  public GetExistingVaccRegNumData(fiscId, regNum) {
    return this.vaccinationDLService.GetExistingVaccRegNumData(fiscId, regNum)
      .map(res => { return res });
  }


  public AddUpdateVaccinationPatient(model: VaccinationPatient) {
    let modelData = Object.assign({}, model);
    modelData.Age = modelData.Age + modelData.AgeUnit;
    let temp = _.omit(modelData, ['PatientValidator'])
    let data = JSON.stringify(temp);
    return this.vaccinationDLService.AddUpdateVaccinationPatient(data).map((res) => {
      return res;
    });
  }

  public AddUpdatePatientVaccineDetail(model: any) {
    let temp = _.omit(model, ['PatVaccineDetailValidator'])
    let data = JSON.stringify(temp);
    return this.vaccinationDLService.AddUpdatePatientVaccineDetail(data).map((res) => {
      return res;
    });
  }

  public UpdateVaccineRegNumberOfPatient(patId: number, regNum: number, fiscalYearId: number) {
    return this.vaccinationDLService.UpdateVaccineRegNumberOfPatient(patId, regNum, fiscalYearId).map((res) => {
      return res;
    });
  }

  public GetCastEthnicGroupList() {
    return this.vaccinationDLService.GetCastEthnicGroupList().map((res) => {
      return res;
    });
  }

  public GetMunicipality(id: number) {
    return this.vaccinationDLService.GetMunicipality(id)
      .map(res => { return res })
  }

  //sud:2-Oct'21--To get Patient+Visit Information by given VisitId.
  //Needed for Followup as well as Sticker
  public GetPatientAndVisitInfo(visitId: number) {
    return this.vaccinationDLService.GetPatientAndVisitInfo(visitId)
      .map(res => { return res })
  }

  public PostFollowupVisit(fwUpVisit: Visit) {

    
    let fwUpVisToPost = new Visit();
    fwUpVisToPost.PatientId = fwUpVisit.PatientId;
    fwUpVisToPost.DepartmentId = fwUpVisit.DepartmentId;
    fwUpVisToPost.AppointmentType = ENUM_AppointmentType.followup;
    fwUpVisToPost.VisitType = ENUM_VisitType.outpatient;
    fwUpVisToPost.VisitStatus = ENUM_VisitStatus.initiated;
    fwUpVisToPost.ParentVisitId = fwUpVisit.ParentVisitId;

    fwUpVisToPost.VisitDate = moment().format('YYYY-MM-DD');
    fwUpVisToPost.VisitTime = moment().format('HH:mm');
    fwUpVisToPost.IsActive = true;
    fwUpVisToPost.BillingStatus = ENUM_BillingStatus.free;
    fwUpVisToPost.VisitDuration = 0;

    fwUpVisToPost.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');//this will be reset from server side..
    fwUpVisToPost.CreatedBy = 0;//this will be set from server side

    //used to post billingtransaction during transfer and referral
    var tempVisitModel = _.omit(fwUpVisToPost, ['VisitValidator']);
    return this.vaccinationDLService.PostFollowupVisit(tempVisitModel);

  }

}
