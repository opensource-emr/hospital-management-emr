import { Injectable, Directive } from '@angular/core';
import { VisitDLService } from '../../appointments/shared/visit.dl.service';
import { ImagingDLService } from '../../radiology/shared/imaging.dl.service';
import { LabsDLService } from '../../labs/shared/labs.dl.service';
import { BillingDLService } from '../../billing/shared/billing.dl.service';
import { Employee } from "../../employee/shared/employee.model";
import { BillingDeposit } from '../../billing/shared/billing-deposit.model';
import { Visit } from '../../appointments/shared/visit.model';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DischargeSummary } from '../../adt/shared/discharge-summary.model';
import { DischargeSummaryDLService } from './discharge-summary.dl.service';
import { PatientCertificate } from './patient-certificate.model';

@Injectable()
export class DischargeSummaryBLService {
  public currencyUnit: string = "";

  constructor(public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public dischargeSummaryDLService: DischargeSummaryDLService,
    public imagingDLService: ImagingDLService,
    public labsDLService: LabsDLService,
    public billingDLService: BillingDLService) {
    this.GetCurrencyUnit;
  }

  public GetDischargeType() {
    return this.dischargeSummaryDLService.GetDischargeType()
      .map(res => res);
  }
  public GetDischargeConditions() {
    return this.dischargeSummaryDLService.GetDischargeConditions()
      .map(res => res);
  }
  public GetDeliveryType() {
    return this.dischargeSummaryDLService.GetDeliveryType()
      .map(res => res);
  }
  public GetBabyBirthCondition() {
    return this.dischargeSummaryDLService.GetBabyBirthCondition()
      .map(res => res);
  }
  public GetCurrentFiscalYear() {
    return this.dischargeSummaryDLService.GetCurrentFiscalYear()
      .map(res => res);
  }

  public GetCertificate(dischargeSummaryId : number, PatientId: number){
    return this.dischargeSummaryDLService.GetCertificate(dischargeSummaryId, PatientId)
    .map(res => res);
  }
  public GetDeathType(){
    return this.dischargeSummaryDLService.GetDeathType()
    .map(res => res);
  }
  public GetProviderList() {
    return this.dischargeSummaryDLService.GetProviderList()
      .map(res => { return res });
  }
  //get list of employee from Anasthetists dept
  public GetAnasthetistsEmpList() {
    return this.dischargeSummaryDLService.GetAnasthetistsEmpList()
      .map(res => { return res });
  }
  public GetLabReportByVisitId(patientVisitId: number) {
    return this.labsDLService.GetReportByPatientVisitId(patientVisitId)
      .map(res => res);
  }

  public GetAllTests() {
    return this.labsDLService.GetAllLabTests()
      .map(res => res);
  }

  public GetICDList() {
    return this.dischargeSummaryDLService.GetICDList()
      .map(res => { return res });
  }
  //gets only the requisitions made on give visits: added for temporary purpose (to display in discharge-summary, remove later if not required)  sud: 9Aug'17
  public GetLabRequestsByPatientVisit(patientId: number, patientVisitId: number) {
    return this.labsDLService.GetRequisitionsByPatientVisitId(patientId, patientVisitId)
      .map(res => res);
  }

  public GetMedicationFrequency() {
    return this.dischargeSummaryDLService.GetMedicationFrequency()
      .map(res => { return res });
  }
  public GetImagingReportsReportsByVisitId(patientVisitId: number) {
    return this.imagingDLService.GetPatientVisitReports(patientVisitId)
      .map(res => res);
  }
  public GetDischargeSummary(patientVisitId: number) {
    return this.dischargeSummaryDLService.GetDischargeSummary(patientVisitId)
      .map(res => res);
  }
  public PostDischargeSummary(dischargeSummary: DischargeSummary) {
    var tempVisitModel = _.omit(dischargeSummary, ['DischargeSummaryValidator']);
    var tempMedicines: any = tempVisitModel.DischargeSummaryMedications.map(itm => {
      return _.omit(itm, ['DischargeSummaryMedicationValidator']);
    });
    //var babies: any = tempVisitModel.BabyBirthDetails.map(itm => {
    //  return _.omit(itm, ['BabyBirthDetailsValidator']);
    //});
    //tempVisitModel.BabyBirthDetails = babies;
    tempVisitModel.DischargeSummaryMedications = tempMedicines;
    return this.dischargeSummaryDLService.PostDischargeSummary(tempVisitModel)
      .map(res => res)
  }
  public UpdateDischargeSummary(dischargeSummary: DischargeSummary) {
    //to fix serializaiton problem in server side
    if (dischargeSummary.CreatedOn)
      dischargeSummary.CreatedOn = moment(dischargeSummary.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (dischargeSummary.ModifiedOn)
      dischargeSummary.ModifiedOn = moment(dischargeSummary.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var tempVisitModel = _.omit(dischargeSummary, ['DischargeSummaryValidator']);
    var tempMedicines: any = tempVisitModel.DischargeSummaryMedications.map(itm => {
      return _.omit(itm, ['DischargeSummaryMedicationValidator']);
    });
  //  if(tempVisitModel.BabyBirthDetails){
  //  var babies: any = tempVisitModel.BabyBirthDetails.map(itm => {
  //    return _.omit(itm, ['BabyBirthDetailsValidator']);
  //  });
  //  tempVisitModel.BabyBirthDetails = babies;
  //}
    tempVisitModel.DischargeSummaryMedications = tempMedicines;
    return this.dischargeSummaryDLService.PutDischargeSummary(tempVisitModel)
      .map(res => { return res });
  }

  public GetCurrencyUnit() {
    var currParameter = this.coreService.Parameters.find(a => a.ParameterName == "Currency")
    if (currParameter)
      this.currencyUnit = JSON.parse(currParameter.ParameterValue).CurrencyUnit;
    else
      this.msgBoxServ.showMessage("error", ["Please set currency unit in parameters."]);
  }
  public PostCertificate(patientCertificate: PatientCertificate) {
    return this.dischargeSummaryDLService.PostCertificate(patientCertificate)
      .map(res => res)
  }
  public UpdateCertificate(patientCertificate: PatientCertificate){
  return this.dischargeSummaryDLService.UpdateCertificate(patientCertificate)
  .map(res => res)
}
}


