import { Injectable, Directive } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

import { ImagingItemRequisition } from './imaging-item-requisition.model';
import { ImagingItem } from './imaging-item.model';
import { ImagingItemReport } from '../shared/imaging-item-report.model';

@Injectable()
export class ImagingDLService {
   public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public http: HttpClient) {
    }
    public GetFilmTypeData(){
        return this.http.get<any>('/api/radiology?reqType=getFilmTypeData', this.options);
    }

    //this returns a promise, the calling component can map, subscribe and do the needful
    //imaging-requistion-component
    public GetItemsByType(typeId: number) {
        return this.http.get<any>("/api/Master?type=imagingitem&inputValue=" + typeId, this.options);
    }
    //imaging-requistion-component
    //get patinet's list of requisition items
    public GetPatientImagingRequisitions(patientId: number, orderStatus: string) {
        return this.http.get<any>('/api/radiology?patientId=' + patientId + '&orderStatus=' + orderStatus
            + '&reqType=patientImagingRequisition', this.options);
    }
    //imaging-requisition.component
    //gets types of imaging in radiology
    public GetImagingTypes() {
        return this.http.get<any>('/api/radiology?reqType=getImagingTypes', this.options);
    }
    
     //gets dicom Image list
    public GetDicomImageList(PatientStudyId) {
        return this.http.get<any>('/api/radiology?reqType=get-dicom-image-list&PatientStudyId=' + PatientStudyId, this.options);
    }
    
    
    
    //imaging-report.component 
    //get requisition items using reportOrderStatus and billingStatus
    public GetImagingReqsAndReportsByStatus(reqOrderStatus: string, reportOrderStatus: string, typeList: string, fromDate:string, toDate:string) {
        return this.http.get<any>('/api/radiology?reqType=getRequisitionsList'
            + '&reqOrderStatus=' + reqOrderStatus
            + '&reportOrderStatus=' + reportOrderStatus
          + '&typeList=' + typeList + "&fromDate=" + fromDate + "&toDate=" + toDate, this.options);

      //fromDate, DateTime? toDate
    }

    //get requisition items using reportOrderStatus and billingStatus
    public GetImagingReqsAndReportsByStatus_Old(reqOrderStatus: string, reportOrderStatus: string, billingStatus: string) {
        return this.http.get<any>('/api/radiology?reqType=reqNReportListByStatus'
            + '&reqOrderStatus=' + reqOrderStatus
            + '&reportOrderStatus=' + reportOrderStatus
            + '&billingStatus=' + billingStatus, this.options);
    }

    //imaging-result.component
    //get list of reports of selected patient using orderStatus
    public GetPatientReports(patientId: number, reportOrderStatus) {
        return this.http.get<any>('/api/radiology?patientId=' + patientId
            + '&reqType=imagingResult'
            + '&reportOrderStatus=' + reportOrderStatus, this.options);
    }

    public GetPatientVisitReports(patientVisitId: number) {
        return this.http.get<any>('/api/radiology?reqType=imagingResult-visit&patientVisitId=' + patientVisitId, this.options);
    }

    //imaging-result.component
    //get list of reports of selected patient using orderStatus
    public GetAllImagingReports(reportOrderStatus: string, frmDate: string, toDate: string, typeStr: string) {
        return this.http.get<any>('/api/radiology?&reqType=allImagingReports'
          + '&reportOrderStatus=' + reportOrderStatus + "&fromDate=" + frmDate + "&toDate=" + toDate + "&typeList=" + typeStr, this.options);
    }

    //imaging-report by requisitionId
    public GetImagingReportByRequisitionId(requisitionId: number) {
        return this.http.get<any>('/api/radiology?&reqType=imagingReportByRequisitionId'
            + '&requisitionId=' + requisitionId, this.options);
    }
    //gets the types of imaging items
    public GetImagingType() {
        return this.http.get<any>('/api/radiology?reqType=getImagingType', this.options);
    }
    //getting report for patient view..(used in view-report.component)
    public GetEmpPreference(employeeId: number) {
        return this.http.get<any>("/api/radiology?reqType=employeePreference&employeeId=" + employeeId, this.options)
    }
    //get ReportText, imageNames, imageFolderpath by Id from imgRequisition or imgReport table
    public GetImagingReportContent(isRequisitionReport, id) {
        try {
            return this.http.get<any>("/api/radiology?reqType=reportDetail&isRequisitionReport=" + isRequisitionReport + "&id=" + id, this.options)
        } catch (exception) {
            throw exception;
        }
    }
    //public GetReportingDoctor(imagingTypeId: number) {
    //    return this.http.get<any>("/api/radiology?reqType=reporting-doctor&imagingTypeId=" + imagingTypeId, this.options)
    //}
    public GetAllReportTemplates() {
        return this.http.get<any>("/api/radiology?reqType=all-report-templates", this.options)
    }

    public GetDoctorList() {
        return this.http.get<any>("/api/radiology?reqType=doctor-list", this.options)
    }
    //Get  scanned imaging files list for add to report
    //get data from pac server
    GetImgFileList(fromDate: string, toDate: string) {
        try {
            return this.http.get<any>("/api/radiology?reqType=imgingFileListFromPACS&fromDate=" + fromDate + "&toDate=" + toDate, this.options)
        } catch (exception) {
            throw exception;
        }
    }
    //get report text by Imaging report id from report table
    GetReportTextByImagingReportId(ImagingReportId) {
        try {
            return this.http.get<any>("/api/radiology?reqType=reportTextByRPTId&imagingReportId=" + ImagingReportId, this.options)
        } catch (exception) {
            throw exception;
        }
    }
    //Get dicom viewer url and open dicom viewer
    GetDICOMViewerByImgRptId(ImagingReportId, PatientStudyId) {
        try {
            return this.http.get<any>("/api/radiology?reqType=dicomViewerUrl&imagingReportId=" + ImagingReportId + "&PatientStudyId=" + PatientStudyId, this.options)
        } catch (exception) {
            throw exception;
        }
    }
    //imaging-requistion-component
    //post all the requisition items
    public PostRequestItems(reqItemList: Array<ImagingItemRequisition>) {
        let data = JSON.stringify(reqItemList);
        return this.http.post<any>('/api/Radiology?reqType=postRequestItems', data, this.options);
    }

    //imaging-report.component
    //post report
    //not used now
    public PostItemReport(itemReport: ImagingItemReport) {
        let data = JSON.stringify(itemReport);
        return this.http.post<any>('/api/Radiology?reqType=postReport', data, this.options);
    }
    //imaging-report.component
    //post report
    public PostImgItemReport(formData: any) {
        try {
            return this.http.post<any>("/api/Radiology?reqType=postReport", formData);

        } catch (exception) {
            throw exception;
        }
    }
    PostPatientStudy(reportData) {
        try {
            return this.http.post<any>("/api/Radiology?reqType=postPatientStudy", reportData, this.options);
        } catch (exception) {
            throw exception;
        }
  }

  public SendEmail(formData: any) {
    let data = formData;
    try {
      return this.http.post<any>("/api/Radiology?reqType=sendEmail", data, this.options)
    } catch (exception) {
      throw exception;
    }
  }

    //update billing status of imaging itme in imagingrequisition table
    //imaging-requisition.component
    public PutImagingReqsBillingStatus(requisitionIds: number[], billingStatus: string) {
        let data = JSON.stringify(requisitionIds);
        return this.http.put<any>('/api/Radiology?reqType=billingStatus' + '&billingStatus=' + billingStatus, data, this.options)
    }

    //imaging-report.component
    //update ImagingReport
    public PutImgItemReport(formData: any) {
        try {
            return this.http
                .put<any>('/api/Radiology?reqType=updateImgReport'
                , formData);
        } catch (exception) {
            throw exception;
        }
    }

    //attach patient study (imaging files) with repor
    public PutPatientStudy(reportData) {
        try {
            return this.http
                .put<any>('/api/Radiology?reqType=updatePatientStudy'
                , reportData, this.options);
        } catch (exception) {
            throw exception;
        }
    }
    //delete selected imaging report images before submit report
    //update imageName string and ImageFullPath in db
    public DeleteImgsByImagingRptId(reportModelData) {
        try {
            let data = JSON.stringify(reportModelData);
            return this.http.put<any>('/api/Radiology?reqType=deleteRptImages', data, this.options);
        } catch (exception) {
            throw exception;
        }
    }

    //start: sud-5Feb'18--For Ward Billing--
    public GetRadiologyBillingItems() {
        return this.http.get<any>("/api/Billing?reqType=department-items&departmentName=radiology", this.options)
    }
    public CancelRadRequest(data: string) {
        return this.http.put<any>("/api/Billing?reqType=cancelInpatientItemFromWard", data, this.options);
    }
    public CancelInpatientCurrentLabTest(data) {
        return this.http.put<any>('/api/Lab?reqType=cancelInpatientLabTest', data, this.options);
    }

    public CancelBillRequest(data: string) {
        return this.http.put<any>("/api/Billing?reqType=cancelInpatientBillRequest", data, this.options);
    }

    public PutDoctor(id: number,providerName: string, reqId: number) {
        let data = JSON.stringify(reqId);
        return this.http.put<any>('/api/Radiology?reqType=UpdateDoctor' + '&providerId=' + id + '&providerName=' + providerName,data, this.options);
    }

    //end: sud-5Feb'18--For Ward Billing--

  public PutScannedDetails(reqId: number) {
    try {
      return this.http
        .put<any>('/api/Radiology?reqType=updateRadPatScanData', reqId, this.options);
    } catch (exception) {
      throw exception;
    }
  }
}
