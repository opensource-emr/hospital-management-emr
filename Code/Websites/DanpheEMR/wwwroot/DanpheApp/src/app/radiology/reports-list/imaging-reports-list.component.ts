import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';

import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';

import { VisitService } from '../../appointments/shared/visit.service';
import { PatientService } from '../../patients/shared/patient.service';
import { ImagingItemReport, ImagingReportViewModel } from '../shared/imaging-item-report.model';
import { ImagingBLService } from '../shared/imaging.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
//needed to assign external html as innerHTML property of some div
//otherwise angular removes some css property from the DOM. 
import { DomSanitizer } from '@angular/platform-browser';
import { ImagingType } from "../shared/imaging-type.model";
import * as moment from 'moment/moment';
import { CoreService } from "../../../../src/app/core/shared/core.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";


@Component({
  templateUrl: "./imaging-reports-list.html"
})
export class ImagingReportsListComponent {
  public allImagingReports: Array<ImagingItemReport> = new Array<ImagingItemReport>();
  public allImagingFilteredReports: Array<ImagingItemReport> = new Array<ImagingItemReport>();
  //enable preview is for message dialog box.
  public enablePreview: boolean = false;
  public selReport: ImagingReportViewModel = new ImagingReportViewModel();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  //show report is for pop up show report page
  public showImagingReport: boolean = false;
  public requisitionId: number = null;
  public imgReportsListGridColumns: Array<any> = null;
  public imagingTypes: Array<ImagingType> = new Array<ImagingType>();

  //selected Imaging Type to  display in the grid.
  public selImgType: any;
  public allValidImgTypeList: Array<number> = new Array<number>();

  public dateRange: string = "last1Week";//by default show last 1 week data.;
  public fromDate: string = null;
  public toDate: string = null;

  constructor(public visitService: VisitService, public msgBoxServ: MessageboxService,
    public imagingBLService: ImagingBLService, public coreService: CoreService,
    public patientService: PatientService,
    public changeDetector: ChangeDetectorRef,
    public sanitizer: DomSanitizer) {
    //this.getImagingType();
    this.imgReportsListGridColumns = this.getRadReportListFilteredColumns(this.coreService.GetRadReportListColmArr());
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', true));
    //this.GetPatientReportsByImagineType();
  }

  getRadReportListFilteredColumns(columnObj: any): Array<any> {
    let cols = GridColumnSettings.ImagingReportListSearch;
    var filteredColumns = [];
    if (columnObj) {
      for (var prop in columnObj) {
        if (columnObj[prop] == true || columnObj[prop] == 1) {
          var headername: string = prop;
          var ind = cols.find(val => val.headerName.toLowerCase().replace(/ +/g, "") == headername.toLowerCase().replace(/ +/g, ""));
          if (ind) {
            filteredColumns.push(ind);
          }
        }
      }
    }
    else {
      return cols;
    }

    if (filteredColumns.length) {
      return filteredColumns;
    } else {
      return cols;
    }
  }


  //get list of report of the selected patient.
  GetPatientReportsByImagineType(frmDate: string, toDate: string): void {
    if ((this.selImgType > 0) || (this.selImgType == -1)) {
      this.imagingBLService.GetAllImagingReports(frmDate, toDate, this.allValidImgTypeList)
        .subscribe(res => {
          if ((res.Status == "OK") && (res.Results != null)) {
            this.allImagingReports = res.Results;
            this.allImagingFilteredReports = res.Results;
            //if (this.selImgType == 'All') {
            //  this.allImagingFilteredReports = this.allImagingReports.filter(x => x.IsActive == true);
            //} else {
            //  this.allImagingFilteredReports = this.allImagingReports.filter(x => (x.ImagingTypeName == this.selImgType) && (x.IsActive == true));
            //}

            this.allImagingFilteredReports.forEach(val => {
              if (val.Signatories) {
                let signatures = JSON.parse(val.Signatories);
                var name = '';
                for (var i = 0; i < signatures.length; i++) {
                  if (signatures[i].EmployeeFullName) {
                    name = name + signatures[i].EmployeeFullName + ((i + 1 == signatures.length) ? '' : ' , ');
                  }
                }
                val.ReportingDoctorNamesFromSignatories = name;
              } else {
                val.ReportingDoctorNamesFromSignatories = '';
              }
            });
            this.enablePreview = true;
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        });
    }
  }


  //CallBackGetAllReports(res) {
  //    if (res.Status == "OK") {
  //        this.allImagingReports = res.Results;
  //        this.enablePreview = true;
  //    }
  //    else {
  //        this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //    }

  //}
  ViewReport(report: ImagingItemReport): void {
    this.showImagingReport = false;
    this.requisitionId = null;
    //manually triggering the angular change detection.
    this.changeDetector.detectChanges();
    this.requisitionId = report.ImagingRequisitionId;
    this.showImagingReport = true;
  }
  ImagingReportListGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "view-report":
        {
          var selReport = $event.Data;
          this.ViewReport(selReport);
        }
        break;

      default:
        break;
    }
  }

  GetBackOnClose($event) {
    if ($event.Submit) {
      this.GetPatientReportsByImagineType(this.fromDate, this.toDate);
    }
  }

  ImagingTypeDropdownOnChange($event) {
    this.selImgType = $event.selectedType;
    this.allValidImgTypeList = $event.typeList;
    this.GetPatientReportsByImagineType(this.fromDate, this.toDate);
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetPatientReportsByImagineType(this.fromDate, this.toDate)
      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }
    }
  }


  ////Get Report text when user click on view report button
  //GetReportTextByImagingReportId(report: ImagingItemReport): void {
  //    try {
  //        if (report.ImagingReportId)
  //        this.imagingBLService.GetReportTextByImagingReportId(report.ImagingReportId)
  //            .subscribe(res => {
  //                if (res.Status == "OK") {
  //                    report.ReportText = res.Results;
  //                    this.ViewReport(report);                       
  //                }
  //                else {
  //                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //                    console.log(res.ErrorMessage);
  //                }
  //            });

  //    } catch (exception) {
  //        console.log(exception);
  //        this.msgBoxServ.showMessage("notice",['error =>see console log for details']);
  //    }
  //}

}
