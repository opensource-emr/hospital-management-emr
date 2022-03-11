import { Injectable, Directive } from "@angular/core";

import { BillingDLService } from "../../billing/shared/billing.dl.service";
import { LabsDLService } from "./labs.dl.service";
import { CoreDLService } from "../../core/shared/core.dl.service";
import { LabTestRequisition } from "./lab-requisition.model";
import { BillItemRequisition } from "../../billing/shared/bill-item-requisition.model";
import {
  PatientLabSample,
  LabTestSpecimenModel,
} from "../shared/lab-view.models";
import { LabTestComponent } from "./lab-component.model";
import { SecurityService } from "../../security/shared/security.service";
import * as moment from "moment/moment";
import * as _ from "lodash";

import { CommonFunctions } from "../../shared/common.functions";
import { LabReport } from "./lab-report";
import { LabReportVM } from "../reports/lab-report-vm";
import { PatientsDLService } from "../../patients/shared/patients.dl.service";
import { VisitDLService } from "../../appointments/shared/visit.dl.service";
import { InPatientLabTest } from "./InpatientLabTest";
import { LabEmailModel } from "./lab-email.model";
//Note: mapping is done here by blservice, component will only do the .subscribe().
@Injectable()
export class LabsBLService {
  constructor(
    public labDLService: LabsDLService,
    public billingDLService: BillingDLService,
    public patientDLService: PatientsDLService,
    public securityService: SecurityService,
    public visitDLService: VisitDLService,
    public coreDlService: CoreDLService
  ) { }
  //getting the labtest, labgroup and labcategory
  public GetAllLabTests() {
    return this.labDLService.GetAllLabTests().map((res) => {
      return res;
    });
  }
  // getting the lab-templates
  public GetAllReportTemplates() {
    return this.labDLService.GetAllReportTemplates().map((res) => {
      return res;
    });
  }

  //getting the requsitions...(used in requsition.component)
  public GetLabRequisition(frmdate, todate) {
    return this.labDLService.GetLabRequisition(frmdate, todate).map((res) => {
      return res;
    });
  }
  public GetPrintIdfromTestComponentResult() {
    return this.labDLService.GetPrintIdfromTestComponentResult().map((res) => {
      return res;
    });
  }

  //Getting the test along with SampleCode on CollectSample Page
  GetLabSamplesWithCodeByPatientId(
    patientId: number,
    visitType: string,
    runNumberType: string,
    requisitionId: number,
    wardName: string,
    isUnderInsurance: boolean
  ) {
    return this.labDLService
      .GetLabSamplesWithCodeByPatientId(
        patientId,
        visitType,
        runNumberType,
        requisitionId,
        wardName, isUnderInsurance
      )
      .map((res) => {
        return res;
      });
  }

  //getting latest Sample code
  GetLatestSampleCode(
    visitType: string,
    sampleDate: string,
    runNumberType: string,
    patId: number, underInsurance: boolean
  ) {
    return this.labDLService
      .GetLatestSampleCode(visitType, sampleDate, runNumberType, patId, underInsurance)
      .map((res) => {
        return res;
      });
  }

  //getting Pending Lab results  whose labOrder is not final and sample code is not null..(used in lab-tests-pending-lab-results.component)
  public GetPendingLabResults(frmdate, todate, catIdList: Array<number> = []) {
    var catListStr = JSON.stringify(catIdList);
    return this.labDLService.GetPendingLabResults(frmdate, todate, catListStr).map((res) => {
      return res;
    });
  }

  public GetPendingLabResultsForWorkList(frmdate, todate, catIdList: Array<number> = []) {
    var catListStr = JSON.stringify(catIdList);
    return this.labDLService.GetPendingLabResultsForWorkList(frmdate, todate, catListStr).map((res) => {
      return res;
    });
  }

  //getting multiple template under single parent where orderstatus is final and isprint is false..(used in patient-template-list.component)
  GetPatientTemplateList(patientId: number) {
    return this.labDLService.GetPatientTemplateList(patientId).map((res) => {
      return res;
    });
  }

  GetLabTestPendingReports(frmdate, todate, catIdList: Array<number> = []) {
    var catListStr = JSON.stringify(catIdList);
    return this.labDLService
      .GetLabTestPendingReports(frmdate, todate, catListStr)
      .map((res) => {
        return res;
      });
  }

  GetLabTestFinalReports(frmdate, todate, searchtxt = "", catIdList: Array<number> = [], isForLabMaster = false) {
    var catListStr = JSON.stringify(catIdList);
    return this.labDLService
      .GetLabTestFinalReports(frmdate, todate, searchtxt, catListStr, isForLabMaster)
      .map((res) => {
        return res;
      });
  }
  GetPatientListInLabFinalReports(frmdate, todate, catIdList: Array<number> = []) {
    var catListStr = JSON.stringify(catIdList);
    return this.labDLService
      .GetPatientListInLabFinalReports(frmdate, todate, catListStr)
      .map((res) => {
        return res;
      });
  }
  GetPatientListForReportDispatch(frmdate, todate, catIdList: Array<number> = []) {
    var catListStr = JSON.stringify(catIdList);
    return this.labDLService
      .GetPatientListForReportDispatch(frmdate, todate, catListStr)
      .map((res) => {
        return res;
      });
  }

  GetFinalReportsInReportDispatchByPatId(patientId, frmdate, todate, catIdList) {
    var catListStr = JSON.stringify(catIdList);
    return this.labDLService
      .GetFinalReportsInReportDispatchByPatId(patientId, frmdate, todate, catListStr)
      .map((res) => {
        return res;
      });
  }

  GetPatientList(frmdate, todate, catIdList: Array<number> = []) {
    var catListStr = JSON.stringify(catIdList);
    return this.labDLService
      .GetPatientList(frmdate, todate, catListStr)
      .map((res) => {
        return res;
      });
  }

  GetAllLabCategory() {
    return this.labDLService.GetAllLabCategory().map((res) => {
      return res;
    });
  }

  GetTestListOfSelectedInPatient(patId: number, patVisitId: number, module: string) {
    return this.billingDLService.GetInPatientProvisionalItemList(patId, patVisitId, module).map((responseData) => {
      return responseData;
    })
  }

  //Get all Lab Data of a patient by Barcode Number
  GetAllLabDataByBarcodeNumber(barcodeNumber: number) {
    return this.labDLService
      .GetAllLabDataByBarcodeNumber(barcodeNumber)
      .map((res) => {
        return res;
      });
  }

  //Get all Lab Data of a patient by Barcode Number
  GetAllLabDataByRunNumber(formattedSampleCode: string) {
    return this.labDLService
      .GetAllLabDataByRunNumber(formattedSampleCode)
      .map((res) => {
        return res;
      });
  }

  GetAllThePatientList() {
    return this.labDLService.GetAllPatientList().map((res) => {
      return res;
    });
  }

  UpdateAllSampleCodeFormatted() {
    return this.labDLService.UpdateAllSampleCodeFormatted().map((res) => {
      return res;
    });
  }

  GetAllLabDataByPatientName(patientId: number) {
    return this.labDLService
      .GetAllLabDataByPatientName(patientId)
      .map((res) => {
        return res;
      });
  }

  GetTestListSummaryByPatientId(patientId: number, frmdate, todate, catIdList: Array<number> = []) {
    var catListStr = JSON.stringify(catIdList);
    return this.labDLService
      .GetTestListSummaryByPatientId(patientId, frmdate, todate, catListStr)
      .map((res) => {
        return res;
      });
  }

  //getting report for patient view..(used in view-report.component)
  GetReportByTemplateId(templateId: number, patientId: number) {
    return this.labDLService
      .GetReportByTemplateId(templateId, patientId)
      .map((res) => {
        return res;
      });
  }
  //getting report for patient view..(used in view-report.component)
  GetReportByRequisitionId(requisitionId: number) {
    return this.labDLService
      .GetReportByRequisitionId(requisitionId)
      .map((res) => {
        return res;
      });
  }

  //getting report for printing..(used in view-report.component)
  GetReportToPrintBytemplateIdandpatientId(
    templateId: number,
    patientId: number
  ) {
    return this.labDLService
      .GetReportToPrintBytemplateIdandpatientId(templateId, patientId)
      .map((res) => {
        return res;
      });
  }
  //this is to get lab preference for the employee
  public GetEmpPreference(employeeId) {
    return this.labDLService.GetEmpPreference(employeeId).map((res) => {
      return res;
    });
  }

  public GetSampleCodeCompared(
    SampleNumber: number,
    visitType: string,
    sampleCreatedOn: string,
    RunNumberType: string,
    isUnderIns: boolean
  ) {
    return this.labDLService
      .GetSampleCodeCompared(
        SampleNumber,
        visitType,
        sampleCreatedOn,
        RunNumberType,
        isUnderIns
      )
      .map((res) => {
        return res;
      });
  }
  public GetReportFromReqIdList(requisitionIdList: Array<number>) {
    return this.labDLService
      .GetReportFromReqIdList(JSON.stringify(requisitionIdList))
      .map((res) => {
        return res;
      });
  }

  public GetReportFromListOfReqIdList(requisitionIdList: any) {
    return this.labDLService
      .GetReportFromListOfReqIdList(JSON.stringify(requisitionIdList))
      .map((res) => {
        return res;
      });
  }

  public GetDoctorsList() {
    return this.billingDLService.GetDoctorsList().map((res) => res);
  }

  public GetLabBillingItems() {
    return this.billingDLService.GetLabBillingItems().map((res) => res);
  }
  public GetInpatientList() {
    return this.patientDLService.GetInpatientList().map((res) => res);
  }
  public GetPatientVisitsProviderWise(patientId: number) {
    return this.visitDLService
      .GetPatientVisitsProviderWise(patientId)
      .map((res) => res);
  }
  public GetSpecimen(reqId: number) {
    return this.labDLService.GetSpecimen(reqId).map((res) => {
      return res;
    });
  }

  public GetLabRequisitionsFromReqIdList(requisitionIdList: Array<number>) {
    return this.labDLService
      .GetLabRequisitionsFromReqIdList(JSON.stringify(requisitionIdList))
      .map((res) => {
        return res;
      });
  }

  public GetDataOfInPatient(patId: number, visitId: number) {
    return this.labDLService.GetDataOfInPatient(patId, visitId).map((res) => {
      return res;
    });
  }

  public GetAllTestsForExternalLabs() {
    return this.labDLService.GetAllTestsForExternalLabs().map((res) => {
      return res;
    });
  }

  public GetAllTestsSendToExternalVendors() {
    return this.labDLService.GetAllTestsSendToExternalVendors().map((res) => {
      return res;
    });
  }

  //posting the requisitions in requistion table..(tests-order.component)
  PostToRequisition(labObj: Array<LabTestRequisition>) {
    let data = JSON.stringify(labObj);

    return this.labDLService.PostToRequisition(data).map((res) => {
      return res;
    });
  }

  PostToBilling(res: Array<LabTestRequisition>) {
    let currentUser: number = 1; //logged in doctor
    let billItems: Array<BillItemRequisition> = new Array<
      BillItemRequisition
    >();
    res.forEach((req) => {
      billItems.push({
        BillItemRequisitionId: 0,
        ItemId: req.LabTestId,
        RequisitionId: req.RequisitionId,
        ItemName: req.LabTestName,
        ProcedureCode: req.ProcedureCode,
        PatientId: req.PatientId,
        PatientVisitId: req.PatientVisitId,
        ServiceDepartment: "Lab",
        DepartmentName: "Lab",
        ServiceDepartmentId: 0,
        ProviderId: req.ProviderId,
        Quantity: 1,
        CreatedBy: this.securityService.GetLoggedInUser().EmployeeId,
        CreatedOn: moment().format("YYYY-MM-DD"),
        Price: 0, //check for proper price and change it later.
        AssignedTo: req.ProviderId, //need to change this later on.. sud: 20may
      });
    });
    return this.billingDLService
      .PostBillingItemRequisition(billItems)
      .map((res) => res);
  }
  PostLabReport(labReport: LabReport) {
    let data = JSON.stringify(labReport);
    return this.labDLService.PostLabReport(data).map((res) => {
      return res;
    });
  }

  VerifyAllLabTests(labReport: LabReport) {
    let data = JSON.stringify(labReport);
    return this.labDLService.VerifyAllLabTests(data).map((res) => {
      return res;
    });
  }

  VerifyAllLabTestsDirectly(requisitionIdList: Array<number>) {
    return this.labDLService
      .VerifyAllLabTestsDirectly(JSON.stringify(requisitionIdList))
      .map((res) => {
        return res;
      });
  }

  PutLabReport(labReport: LabReport) {
    let data = JSON.stringify(labReport);
    return this.labDLService.PutLabReport(data).map((res) => {
      return res;
    });
  }

  //Update IsPrinted Value in LabReport Table
  public UpdateIsPrintedFlag(
    reportId: number,
    requisitionIdList: Array<number>
  ) {
    var reqIdList = JSON.stringify(requisitionIdList);
    return this.labDLService
      .UpdateIsPrintedFlag(reportId, reqIdList)
      .map((res) => {
        return res;
      });
  }

  //posting test component in LAB_TXN_TestComponentResult table..(used in add-result.component)
  PostComponent(
    labTestComponents: Array<LabTestComponent>,
    specimenData: Array<LabTestSpecimenModel>
  ) {
    ////omiting the validators during post because it causes cyclic error during serialization in server side.

    let componentsNew = labTestComponents.map((comp) => {
      return _.omit(comp, ["ComponentValidator", "CultureAddedGroup"]);
    });

    let dataToPost = JSON.stringify(componentsNew);
    let specienToPost = JSON.stringify(specimenData);

    return this.labDLService
      .PostComponent(dataToPost, specienToPost)
      .map((res) => {
        return res;
      });
  }

  //adding the samplecode...(used in collect-sample.component)
  public PutSampleCode(patLabSample: Array<PatientLabSample>, currentUser) {
    //let reqIds = patLabSample.Tests.map(function (test) {
    //    return test.RequisitionId;
    //});
    return this.labDLService
      .PutSampleCode(patLabSample, currentUser)
      .map((res) => {
        return res;
      });
  }

  //ashim: 20Sep2018
  //update sample code using reqIdList used in view report page.
  public PutSampleCodeReqIdList(
    reqIdList: Array<number>,
    RunNumber: number,
    SampleDate: string,
    visitType: string,
    RunNumberType: string
  ) {
    return this.labDLService
      .PutSampleCodeReqIdList(
        reqIdList,
        RunNumber,
        SampleDate,
        visitType,
        RunNumberType
      )
      .map((res) => {
        return res;
      });
  }

  //Update Specimen of CUlture
  public PutSpecimen(specimen: string, reqId: number) {
    return this.labDLService.PutSpecimen(specimen, reqId).map((res) => {
      return res;
    });
  }

  //updating the labOrderStatus in requisition table..(used in add-result.component)
  PutLabOrderStatus(labTestComponents: Array<LabTestComponent>) {
    let componentsNew = labTestComponents.map((comp) => {
      return _.omit(comp, ["ComponentValidator"]);
    });

    let dataToPut = JSON.stringify(componentsNew);

    ///let data = JSON.stringify(labTestComponents);

    return this.labDLService.PutLabOrderStatus(dataToPut).map((res) => {
      return res;
    });
  }
  public PutPrintStatusForReport(requisitionlist: Array<number>, labReportId) {
    let data = JSON.stringify(requisitionlist);
    return this.labDLService
      .PutPrintStatusForReport(requisitionlist, labReportId)
      .map((responseData) => {
        return responseData;
      });
  }

  public PutCommentsOnTestRequisition(
    requisitionlist: Array<number>,
    comments
  ) {
    let data = JSON.stringify(requisitionlist);
    return this.labDLService
      .PutCommentsOnTestRequisition(requisitionlist, comments)
      .map((responseData) => {
        return responseData;
      });
  }

  UndoSampleCode(requisitionlist: Array<number>) {
    return this.labDLService
      .UndoSampleCode(requisitionlist)
      .map((responseData) => {
        return responseData;
      });
  }

  // to update the lab result
  PutLabTestResult(
    labTestComponents: Array<LabTestComponent>,
    specimenData: Array<LabTestSpecimenModel>
  ) {
    let componentsNew = labTestComponents.map((comp) => {
      return _.omit(comp, ["ComponentValidator", "CultureAddedGroup"]);
    });
    let data = JSON.stringify(componentsNew);
    let specienToPost = JSON.stringify(specimenData);

    return this.labDLService
      .PutLabTestResult(data, specienToPost)
      .map((responseData) => {
        return responseData;
      });
  }

  //Update ReferredBy Doctor
  PutDoctor(id: number, reqList: number[]) {
    return this.labDLService.PutDoctor(id, reqList).map((res) => {
      return res;
    });
  }

  //Update ReferredByDoctor Name in LabReport Table
  PutDoctorNameInLabReport(id, doctorName) {
    return this.labDLService
      .PutDoctorNameInLabReport(id, doctorName)
      .map((res) => {
        return res;
      });
  }

  //Update labtest with aother of samePrice
  ChangeLabTestOfSamePrice(reqId: number, changedLabtest) {
    let data = JSON.stringify(changedLabtest);
    return this.labDLService
      .ChangeLabTestOfSamePrice(reqId, data)
      .map((res) => {
        return res;
      });
  }

  //To Update Tables to cancel the LabTest Request for Inpatient
  CancelInpatientCurrentLabTest(currentInpatientLabTest: InPatientLabTest) {
    let data = JSON.stringify(currentInpatientLabTest);
    return this.labDLService.CancelInpatientCurrentLabTest(data).map((res) => {
      return res;
    });
  }

  CancelLabItem(currentInpatientLabTest) {
    let data = JSON.stringify(currentInpatientLabTest);
    return this.labDLService.CancelLabItem(data).map((res) => {
      return res;
    });
  }

  SaveLabStickersHTML(
    printerName: string,
    filePath: string,
    stickerHtmlContent: string,
    numOfCopies: number
  ) {
    return this.labDLService
      .PostLabStickerHTML(
        printerName,
        filePath,
        stickerHtmlContent,
        numOfCopies
      )
      .map((res) => {
        return res;
      });
  }

  public UpdateVendorToLabTest(
    requisitionlist: Array<number>,
    vendorId: number
  ) {
    let data = JSON.stringify(requisitionlist);
    return this.labDLService
      .UpdateVendorToLabTest(data, vendorId)
      .map((responseData) => {
        return responseData;
      });
  }

  //public GetTemplateStoragePath() {
  //    return this.labDLService.GetTemplateStoragePath()
  //        .map(res => { return res })
  //}
  //delete this:ashim
  //getting multiple template under single parent where orderstatus is final..(all the reports against that patient from the beginning)
  //GetViewAllReportsTemplate(patientId: number) {
  //    return this.labDLService.GetViewAllReportsTemplate(patientId)
  //        .map(res => { return res })
  //}

  //getting the data from requisition and component to add
  //in the labresult service ....(used in collect-sample.component)
  //public GetLabTestsAndRequisitionBySampleCode(SampleCode) {
  //    return this.labDLService.GetLabTestsAndRequisitionBySampleCode(SampleCode)
  //        .map(res => {
  //            return res
  //        })
  //}
  //getting the data from requisition and component to add
  //in the labresult service ....(used in pending-lab-results.component)
  //public GetLabTestsAndRequisitionByPatientIdandTemplateId(TemplateId, PatientId, sCode, sDate) {
  //    return this.labDLService.GetLabTestsAndRequisitionByPatientIdandTemplateId(TemplateId, PatientId, sCode, sDate)
  //        .map(res => {
  //            return res
  //        })
  //}

  //getting list of patient report who labOrder is final and isprint is false ..(used in list-report.component)
  //public GetListPatientWithReport() {
  //    return this.labDLService.GetListPatientWithReport()
  //        .map(res => { return res })
  //}
  //getting list of patient report who labOrder is final..(list all the patient from the beginning to view the report)
  //public GetListAllPatientsReport() {
  //    return this.labDLService.GetListAllPatientsReport()
  //        .map(res => { return res })
  //}

  //getting report for patient view..(all the reports from the beginning)
  //GetAllReportByTemplateId(templateId: number, patientId: number, labReportId) {
  //    return this.labDLService.GetAllReportByTemplateId(templateId, patientId, labReportId)
  //        .map(res => { return res })
  //}

  //GetComponentValueLookups() {
  //    let moduleName = "Lab";
  //    return this.coreDlService.GetLookups("Lab")
  //        .map(res => {
  //            return res;
  //        });
  //}

  // this can be  used in future ..<revisit by dharm 05'April'2017>
  // Updating doctors Remark in result table ..(used in view-report.component)
  //PutDoctorsRemark(labResult: Array<LabTestResult>) {
  //    let data = labResult;
  //    return this.labDLService.PutDoctorsRemark(data)
  //        .map(res => { return res })
  //}

  ////start: sud: 22Jun'18--for view-report new implementation  [Needs Revision]

  //public GetLabReport_New_Temp(labReportId) {
  //    return this.labDLService.GetLabReport_New_Temp(labReportId)
  //        .map((res) => {
  //            return res;
  //        })
  //}

  ////end: sud: 22Jun'18--for view-report new implementation  [Needs Revision]

  //start: sud:16May'19--for lab-external vendors.
  GetLabVendors() {
    return this.labDLService.GetLabVendors();
  }
  //end: sud:16May'19--for lab-external vendors.

  //activate lab
  public ActivateLab(labId: number, labName: string) {
    return this.labDLService.ActivateLab(labId, labName).map(res => {
      return res;
    });
  }

  public DeactivateLab() {
    return this.labDLService.DeactivateLab().map(res => {
      return res;
    });
  }

  public TransfertToLab(reqId: number, labTypeName: string) {
    return this.labDLService.TransfertToLab(reqId, labTypeName).map(res => {
      return res;
    });
  }

  public GetSamplesCollectedData(fromDate, toDate) {
    return this.labDLService.GetSamplesCollectedData(fromDate, toDate).map(res => {
      return res;
    });
  }

  //for SMS
  public GetSMSApplicableTest(fromDate, toDate) {
    return this.labDLService.GetSMSApplicableTest(fromDate, toDate).map(res => {
      return res;
    });
  }

  public PostSMS(reqIdList: string) {
    return this.labDLService.PostSMS(reqIdList).map(res => {
      return res;
    });
  }

  public GetSMSToBeSendMsg(reqId: string) {
    let reqIdNum = +reqId;
    return this.labDLService.GetSMSToBeSendMsg(reqIdNum).map(res => {
      return res;
    });
  }

  public GenerateSampleRunNumber(patLabSample: Array<PatientLabSample>, currentUser) {
    return this.labDLService.GenerateSampleRunNumber(patLabSample, currentUser).map(res => {
      return res;
    })
  }

  public SendPdf(doc, reqId: number) {
    //var data = JSON.stringify(doc);
    return this.labDLService.SendPdf(doc, reqId).map(res => {
      return res;
    })
  }
  public sendEmail(email: LabEmailModel) {
    let data: LabEmailModel = new LabEmailModel();
    data = Object.assign(data, email);
    var omited = _.omit(data, ['LabEmailValidator']);
    return this.labDLService.SendEmail(omited)
      .map(res => res);
  }

  uploadFile(url,patient,formData:FormData) {
    return this.labDLService
      .uploadFile(url,patient, formData)
      .map((res) => {
        return res;
      });
  }

  TeleMedLogin(url,login){
    return this.labDLService.TeleMedicineLogin(url,login).map((res)=>{
      return res;
    });
  }

  UpdateFileUploadStatus(requisitionIdList: Array<number>){
    return this.labDLService.UpdateFileUploadStatus(JSON.stringify(requisitionIdList)).map((res) =>{
      return res;
    });
  }
}
