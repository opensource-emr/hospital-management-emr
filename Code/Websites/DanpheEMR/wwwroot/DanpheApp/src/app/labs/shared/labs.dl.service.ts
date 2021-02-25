import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonFunctions } from "../../shared/common.functions";
import { LabReportVM } from '../reports/lab-report-vm';

@Injectable()
export class LabsDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) {
  }

  //getting the labtest, labgroup and labcategory
  public GetAllLabTests() {
    return this.http.get<any>("/api/Lab?reqType=allLabTests", this.options)
  }
  //getting the lab templates.
  public GetAllReportTemplates() {
    return this.http.get<any>("/api/Lab?reqType=all-report-templates", this.options)
  }

  //getting the requsitions.
  public GetLabRequisition() {
    return this.http.get<any>("/api/Lab?reqType=labRequisition", this.options)
  }

  //getting latest Sample code
  public GetLatestSampleCode(visitType: string, sampleDate: string, runNumberType: string, patId: number) {
    return this.http.get<any>("/api/Lab?reqType=latest-samplecode&visitType=" + visitType + '&SampleDate=' + sampleDate +
      '&runNumberType=' + runNumberType + '&patientId=' + patId, this.options)
  }

  public GetPrintIdfromTestComponentResult() {
    return this.http.get<any>("/api/Lab?reqType=GetPrintIdfromTestComponentResult", this.options)
  }


  //public GetTemplateStoragePath() {
  //    return this.http.get<any>("/api/Lab?reqType=GetTemplateStoragePath", this.options)
  //}

  // gets lab samples with billstatus='paid' and orderstatus not final in Lab Sample collect Page
  public GetLabSamplesWithCodeByPatientId(patientId: number, visitType: string, runNumberType: string, requisitionId: number, wardName: string) {
    return this.http.get<any>("/api/Lab?patientId=" + patientId + "&reqType=LabSamplesWithCodeByPatientId&visitType=" + visitType + "&runNumberType=" + runNumberType + "&requisitionId=" + requisitionId + "&wardName=" + wardName, this.options);
  }

  // gets lab samples with billstatus='paid' and orderstatus not final. ///Not Used Modified to GetLabSamplesWithCodeByPatientId
  public GetLabSamplesByPatientId(patientId: number, visitType: string) {
    return this.http.get<any>("/api/Lab?patientId=" + patientId + "&reqType=LabSamplesByPatientId&visitType=" + visitType, this.options);
  }

  //getting report for patient view..(used in view-report.component)
  public GetReportByTemplateId(templateId: number, patientId: number) {
    return this.http.get<any>("/api/Lab?reqType=viewReport&patientId=" + patientId + "&templateId=" + templateId, this.options)
  }

  //getting report for patient view by requisition id..(used in patient overview - lab-view report)
  public GetReportByRequisitionId(requisitionId: number) {
    return this.http.get<any>("/api/Lab?reqType=viewReportFromReqId&requisitionId=" + requisitionId, this.options)
  }

  //getting report for patient view..(used in view-report.component)
  public GetReportByPatientVisitId(patientVisitId: number) {
    return this.http.get<any>("/api/Lab?reqType=viewReport-visit&patientVisitId=" + patientVisitId, this.options)
  }
  public GetPatientReport(patientId: number) {
    return this.http.get<any>("/api/Lab?reqType=viewReport-patient&patientId=" + patientId, this.options)
  }

  //getting report for printing..(used in view-report.component)
  GetReportToPrintBytemplateIdandpatientId(templateId: number, patientId: number) {
    return this.http.get<any>("/api/Lab?patientId=" + patientId + "&templateId=" + templateId, this.options)
  }
  //getting report for lab results which have pending results..(used in pendinding-lab-results.component)
  public GetPendingLabResults() {
    return this.http.get<any>("/api/Lab?reqType=pendingLabResults", this.options);

  }
  //getting report for pending templates in a single patient where isprint is false..(used in patient-template-list.component)
  public GetPatientTemplateList(patientId: number) {
    return this.http.get<any>("/api/Lab?patientId=" + patientId + "&reqType=patientTemplateList", this.options)
  }

  public GetLabTestPendingReports(frmdate, todate) {
    return this.http.get<any>("/api/Lab?&reqType=pending-reports&FromDate=" + frmdate + "&ToDate=" + todate, this.options)
  }
  public GetLabTestFinalReports(frmdate, todate, searchtxt) {
    return this.http.get<any>("/api/Lab?reqType=final-reports&FromDate=" + frmdate + "&ToDate=" + todate + "&search=" + searchtxt, this.options)

  }
  public GetAllLabCategory() {
    return this.http.get<any>("/api/Lab?reqType=all-lab-category", this.options)

  }

  //getting report for patient view..(used in view-report.component)
  public GetRequisitionsByPatientVisitId(patientId: number, patientVisitId: number) {
    return this.http.get<any>("/api/Lab?reqType=visit-requisitions&patientId=" + patientId + "&patientVisitId=" + patientVisitId, this.options)
  }
  //getting report for patient view..(used in view-report.component)
  public GetEmpPreference(employeeId: number) {
    return this.http.get<any>("/api/Lab?reqType=employeePreference&employeeId=" + employeeId, this.options)
  }
  public GetLastSampleCode(labTestSpecimen: string, requisitionId: number) {
    return this.http.get<any>("/api/Lab?reqType=lastSampleCode&labTestSpecimen=" + labTestSpecimen + "&requisitionId=" + requisitionId, this.options)
  }

  //getting sample code compared --yub 1st sept '18'
  public GetSampleCodeCompared(SampleNumber: number, visitType: string, sampleCreatedOn: string, RunNumberType: string) {
    return this.http.get<any>("/api/Lab?reqType=check-samplecode&SampleCode=" + SampleNumber
      + '&visitType=' + visitType
      + '&SampleDate=' + sampleCreatedOn + '&runNumberType=' + RunNumberType, this.options)
  }

  public GetReportFromReqIdList(requisitionIdList: string) {
    return this.http.get<any>("/api/Lab?reqType=labReportFromReqIdList&requisitionIdList=" + requisitionIdList, this.options)

  }
  public GetTestListOfSelectedInPatient(patId: number, patVisitId: number, module:string) {
    return this.http.get<any>("/api/Billing?reqType=inPatientProvisionalItemList&patientId=" + patId + "&visitId=" + patVisitId + "&module=" +module, this.options)
  }

  public GetSpecimen(reqId: number) {
    return this.http.get<any>("/api/Lab?reqType=getSpecimen&requisitionId=" + reqId, this.options);
  }

  public GetAllLabDataByBarcodeNumber(barCodeNumber: number) {
    return this.http.get<any>("/api/Lab?reqType=allLabDataFromBarCodeNumber&barCodeNumber=" + barCodeNumber, this.options);
  }

  public GetAllLabDataByRunNumber(formattedSampleCode: string) {
    return this.http.get<any>("/api/Lab?reqType=allLabDataFromRunNumber&formattedSampleCode=" + formattedSampleCode, this.options);
  }

  public GetAllLabDataByPatientName(patientId: number) {
    return this.http.get<any>("/api/Lab?reqType=allLabDataFromPatientName&patientId=" + patientId, this.options);
  }

  public GetLabRequisitionsFromReqIdList(requisitionIdList: string) {
    return this.http.get<any>("/api/Lab?reqType=labRequisitionFromRequisitionIdList&requisitionIdList=" + requisitionIdList, this.options);
  }
  public GetDataOfInPatient(patId: number, patVisitId: number) {
    return this.http.get<any>("/api/Visit?reqType=patientCurrentVisitContext&patientId=" + patId + "&visitId=" + patVisitId, this.options)
  }
  public GetAllPatientList() {
    return this.http.get<any>("/api/Patient", this.options);
  }
  public GetAllTestsForExternalLabs(){
    return this.http.get<any>("/api/Lab?reqType=allTestListForExternalLabs", this.options);
  }
  public GetAllTestsSendToExternalVendors(){
    return this.http.get<any>("/api/Lab?reqType=allTestListSendToExternalLabs", this.options);
  }

  public UpdateAllSampleCodeFormatted() {
    return this.http.put<any>("/api/Lab?reqType=SampleCodeFormatted", this.options);
  }


  //posting the requisitions in requistion table
  public PostToRequisition(requisitionObjString: string) {
    let data = requisitionObjString;// CommonFunctions.EncodeRequestDataString(requisitionObjString);
    return this.http.post<any>("/api/Lab?reqType=addNewRequisitions", data, this.options);

  }
  public PostFromBillingToRequisition(requisitionObjString: string) {
    let data = requisitionObjString;// CommonFunctions.EncodeRequestDataString(requisitionObjString);
    return this.http.post<any>("/api/Lab?reqType=FromBillingToRequisition", data, this.options);

  }
  //posting test component in LAB_TXN_TestComponentResult table..(used in add-result.component)
  public PostComponent(labTestComponents: string, specimenData: string) {
    let data = labTestComponents;// CommonFunctions.EncodeRequestDataString(labTestComponents);
    return this.http.post<any>("/api/Lab?reqType=AddComponent&specimenData=" + specimenData, data, this.options);

  }
  public PostLabReport(labReport: string) {
    return this.http.post<any>("/api/Lab?reqType=add-labReport", labReport, this.options);
  }
  public VerifyAllLabTests(labReport: string) {
    return this.http.put<any>("/api/Lab?reqType=verify-all-labtests", labReport, this.options);
  }
  public VerifyAllLabTestsDirectly(reqIdList: string) {
    return this.http.put<any>("/api/Lab?reqType=verify-all-requisitions-directly", reqIdList, this.options);
  }
  public PutLabReport(labReport: string) {
    return this.http.put<any>("/api/Lab?reqType=update-labReport", labReport, this.options);
  }
  public UpdateVendorToLabTest(requisitionIdlist: string, vendorId) {
    let data = requisitionIdlist;
    return this.http.put<any>("/api/Lab?reqType=UpdateVendorIdToLabTestRequisition" + '&vendorId=' + vendorId, data, this.options);
  }

  // Update IsPrinted Value in LabReport Table
     public UpdateIsPrintedFlag(reportId: number, reqListStr: string) {
      return this.http.put<any>("/api/Lab?reqType=update-reportPrintedFlag&reportId=" + reportId +'&requisitionIdList=' + reqListStr , this.options);
    }

  //adding the samplecode
  public PutSampleCode(req, CurrentUser: number) {
    return this.http.put<any>("/api/Lab?reqType=updateSampleCode&CurrentUser=" + CurrentUser, req, this.options);
  }
  //ashim: 20Sep2018
  //updating sample code from view report page.
  public PutSampleCodeReqIdList(reqIdList: Array<number>, RunNumber: number, SampleDate: string, visitType: string, RunNumberType: string) {
    let data = JSON.stringify(reqIdList);
    return this.http.put<any>("/api/Lab?reqType=updae-sample-code-reqId&RunNumber=" + RunNumber
      + '&SampleDate=' + SampleDate + '&visitType=' + visitType + '&runNumberType=' + RunNumberType, data, this.options);
  }

  //Updating Specimen in Culture Report
  public PutSpecimen(specimen: string, reqId: number) {
    return this.http.put<any>("/api/Lab?reqType=update-specimen&ReqId=" + reqId
      + '&Specimen=' + specimen, this.options);
  }


  //updating the labOrderStatus in requisition table..(used in add-result.component)
  public PutLabOrderStatus(data) {
    return this.http.put<any>("/api/Lab?reqType=updateLabOrderStatus&", data, this.options)
  }


  public PutLabBillStatus(requistionIds, billstatus) {
    let data = requistionIds;
    return this.http.put<any>("/api/Lab?reqType=updateBillStatus&billstatus=" + billstatus, data, this.options)
  }

  public PutPrintStatusForReport(requisitionIdlist: Array<number>, labReportId) {
    let data = (requisitionIdlist);
    return this.http.put<any>("/api/Lab?reqType=UpdatePrintStatusForReport" + '&labReportId=' + labReportId, data, this.options);
  }


  public PutCommentsOnTestRequisition(requisitionIdlist: Array<number>, comments) {
    let data = (requisitionIdlist);
    return this.http.put<any>("/api/Lab?reqType=UpdateCommentsOnTestRequisition" + '&comments=' + comments, data, this.options);
  }

  public UndoSampleCode(requisitionIdlist: Array<number>) {
    let data = (requisitionIdlist);
    return this.http.put<any>("/api/Lab?reqType=undo-samplecode", data, this.options);
  }

  // to update the lab result
  public PutLabTestResult(labTestComponents, specimenData: string) {
    let data = (labTestComponents);
    return this.http.put<any>("/api/Lab?reqType=EditLabTestResult&specimenData=" + specimenData, data, this.options);
  }

  public PutDoctor(id: number, reqId: number[]) {
    let data = JSON.stringify(reqId);
    return this.http.put<any>('/api/Lab?reqType=UpdateDoctor' + '&id=' + id, data, this.options);
  }

  public PutDoctorNameInLabReport(LabReportId: number, doctorName: string) {
    return this.http.put<any>('/api/Lab?reqType=UpdateDoctorNameInLabReport' + '&id=' + LabReportId, doctorName, this.options);
  }

  public ChangeLabTestOfSamePrice(requisitionId: number, data) {
    return this.http.put<any>('/api/Lab?reqType=ChangeLabTestWithSamePrice' + '&requisitionid=' + requisitionId, data, this.options);
  }

  public CancelInpatientCurrentLabTest(data) {
    return this.http.put<any>('/api/Lab?reqType=cancelInpatientLabTest', data, this.options);
  }

  public CancelLabItem(data){
    return this.http.put<any>('/api/Billing?reqType=cancelInpatientItemFromWard', data, this.options);
  }

  //sud: 4-Nov-2018--to send lab sticker to server for file creation.
  public PostLabStickerHTML(printerName: string, fileName: string, stickerHtmlContent: string, numOfCopies: number) {
    return this.http.post<any>("/api/Lab?reqType=saveLabSticker&PrinterName=" + printerName + "&fileName=" + fileName  + "&numOfCopies=" + numOfCopies, stickerHtmlContent, this.options);
    }

  // this.http.post<any>("/api/Billing?reqType=saveHTMLfile&PrinterName=" + PrinterName + "&FilePath=" + filePath, printableHTML, this.options)
  //.map(res => res).subscribe(res => {
  //    if (res.Status = "OK") {
  //        this.timerFunction();
  //    }
  //    else {
  //        this.loading = false;
  //        this.showLoading = false;
  //    }
  //});

  //delete ASAP
  //getting the data from requisition and labtest(component) to add
  //in the labresult service ....(used in collect-sample.component)
  //public GetLabTestsAndRequisitionBySampleCode(SampleCode: number) {
  //    return this.http.get<any>("/api/Lab?reqType=labTestsAndRequBySampleCode&SampleCode=" + SampleCode, this.options);
  //}
  //getting the data from requisition and labtest(component) to add
  //in the labresult service ....(used in collect-sample.component)
  //public GetLabTestsAndRequisitionByPatientIdandTemplateId(TemplateId: number, PatientId: number, sCode: number, sDate: number) {
  //    return this.http.get<any>("/api/Lab?reqType=LabTestsAndRequisitionByPatientIdandTemplateId&patientId=" + PatientId + "&templateId=" + TemplateId + "&SampleCode=" + sCode + "&SampleDate=" + sDate, this.options);
  //}

  //getting list of patient report whos labOrder is final and isprint is not true..(used in list-report.component)
  //public GetListPatientWithReport() {
  //    return this.http.get<any>("/api/Lab?reqType=listPatientWithReport", this.options);
  //}

  //getting list of patient report whos labOrder is final..(used in list-report.component)
  //public GetListAllPatientsReport() {
  //    return this.http.get<any>("/api/Lab?reqType=ViewAllReportPatientWise", this.options);
  //}

  //getting report for patient view..(all the reports from the beginning)
  //public GetAllReportByTemplateId(templateId: number, patientId: number, labReportId: number) {
  //    return this.http.get<any>("/api/Lab?reqType=viewallReport&patientId=" + patientId + "&templateId=" + templateId + "&labReportId=" + labReportId, this.options)
  //}

  //getting report for all the templates against that patient..(all the reports contained against that patient)
  //public GetViewAllReportsTemplate(patientId: number) {
  //    return this.http.get<any>("/api/Lab?patientId=" + patientId + "&reqType=viewAllReportTemplate", this.options)
  //}

  ////start: sud: 22Jun'18--for view-report new implementation  [Needs Revision]
  //public GetLabReport_New_Temp(labReportId: number) {
  //    return this.http.get<any>("/api/Lab?reqType=view-report-new&labReportId=" + labReportId, this.options)
  //}
  ////end: sud: 22Jun'18--for view-report new implementation  [Needs Revision]

  //start: sud:16May'19--for lab-external vendors.
  GetLabVendors() {
    return this.http.get<any>("/api/LabSetting?reqType=lab-vendors-list", this.options);
  }

  //end: sud:16May'19--for lab-external vendors.

}
