import { Component, ChangeDetectorRef } from "@angular/core";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import { BillingTransaction } from "../../billing/shared/billing-transaction.model";
import { BillingBLService } from "../../billing/shared/billing.bl.service";
import { SecurityService } from "../../security/shared/security.service";
import { Router } from "@angular/router";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { CoreService } from "../../core/shared/core.service";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { APIsByType } from "../../shared/search.service";
import * as moment from 'moment/moment';
import { EditDoctorFeatureViewModel } from "../../billing/shared/edit-doctor-feature-view.model";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ImagingBLService } from "../shared/imaging.bl.service";
import { ImagingItemReport } from "../shared/imaging-item-report.model";
import { ImagingType } from "../shared/imaging-type.model";

@Component({
  templateUrl: './rad-edit-doctors.html'
})

export class RadiologyEditDoctorsComponent {
  //binding with moel
  currentEditDocotorModel: EditDoctorFeatureViewModel = new EditDoctorFeatureViewModel();
  editDoctorModels: Array<EditDoctorFeatureViewModel> = new Array<EditDoctorFeatureViewModel>();

  //start: for angular-grid
  editDoctorGridColumns: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public allImagingFilteredItems: Array<EditDoctorFeatureViewModel> = new Array<EditDoctorFeatureViewModel>();
  public selImgType: number;
  public selImgTypeName: string = null;

  public imagingTypes: Array<ImagingType> = new Array<ImagingType>();
  //use to show pop up
  showEditDoctorPage: boolean = false;


  enableDateFilter: boolean = false;//default false, load this from parameter.
  public dateRange: string = "last1Week";//by default show last 1 week data.

  //this mostly for counter part
  public billTxn: BillingTransaction = new BillingTransaction();
  public patGirdDataApi: string = "";
  searchText: string = '';
  public enableServerSideSearch: boolean = false;
  showExcelExport: boolean = false;
  public enablePreview: boolean = false;

  exportOptions: any = {
    fileName: "RadiologyEditDoctors-report",
  };

  constructor(public billingBLService: BillingBLService, public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public messageService: MessageboxService,
    public securityService: SecurityService, public router: Router, public coreService: CoreService,
    public imagingBLService: ImagingBLService,) {

    this.GetProviderList();
    //for grid
    this.editDoctorGridColumns = GridColumnSettings.RadiologyEditDoctorItemList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Date', true));
    //this.getImagingType();

  }

  public FromDate: string = moment().add(-1, 'months').format('YYYY-MM-DD');
  public ToDate: string = moment().format('YYYY-MM-DD');

  //getting the transactionitem details
  SearchItemByDate($event) {

    this.FromDate = $event ? $event.fromDate : this.FromDate;
    this.ToDate = $event ? $event.toDate : this.ToDate;

    if (this.FromDate != null && this.ToDate != null) {
      if (moment(this.FromDate).isBefore(this.ToDate) || moment(this.FromDate).isSame(this.ToDate)) {
        this.editDoctorModels = [];
        this.billingBLService.GetTxnItemsForEditDoctorByDateRad(this.FromDate, this.ToDate)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.allImagingFilteredItems = res.Results;
              if (this.editDoctorModels.length != 0) {
                for (var i = 0; i < this.editDoctorModels.length; i++) {
                  this.editDoctorModels[i].Date = moment(this.editDoctorModels[i].Date).format("YYYY-MM-DD HH:mm");
                }
              }
            }
            else {
              this.messageService.showMessage("error", ["Not able to Load Transaction Item"]);
              console.log(res.ErrorMessage)
            }

          });
      } else {
        this.messageService.showMessage("failed", ['Please enter valid From date and To date']);
      }
    }

  }


  EditDoctorGridActions($event: GridEmitModel) {

    switch ($event.Action) {

      case "edit":
        {
          this.EditDoctor(null, $event.Data)
        }
        break;
      default:
        break;
    }

  }

  //this function getting the data from pop up model as event
  UpdateDoctor($event) {

    this.changeDetector.detectChanges();
    if ($event && $event.SelectedItem) {
      this.SearchItemByDate(null);
    }


    this.showEditDoctorPage = false;
  }
  //this function is called from the grid 
  //and in this function data is passed to the popup model(edit-component)
  EditDoctor(event, data) {
    // to detect the change 
    this.showEditDoctorPage = false;
    //assigning the value
    var selectedItem = Object.create(data);
    this.currentEditDocotorModel = selectedItem;
    this.changeDetector.detectChanges();
    //calling the pop up model ..if showedtdoctorPage = true the pop up is called
    this.showEditDoctorPage = true;
    this.changeDetector.detectChanges();

  }

  public doctorList: any;
  //load doctor  
  GetProviderList(): void {
    this.billingBLService.GetAllReferrerList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.doctorList = [];
          //format return list into Key:Value form, since it searches also by the property name of json.
          if (res && res.Results) {
            res.Results.forEach(a => {
              //referral list has different property names than what's used in this page, so changing accordingly.
              this.doctorList.push({ EmployeeId: a.EmployeeId, EmployeeName: a.FullName });
            });
          }
        }
        else {
          this.msgBoxServ.showMessage("error", ["Not able to get Doctor list"]);
          console.log(res.ErrorMessage)
        }
      });
  }
//sud:1June'20--Only limited columns are required to be exported..
  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'Patient-Imaging-List-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["Date","ReceiptNo", "PatientCode", "PatientName", "ServiceDepartmentName", "ItemName", "ReferredByName", "ProviderName", "BillStatus"]
    };
    return gridExportOptions;
  }



  getImagingType() {
    this.imagingBLService.GetImagingTypes()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.imagingTypes = res.Results;
        }
        else {
          this.msgBoxServ.showMessage('failed', ["failed to get Imaging Types " + res.ErrorMessage]);
        }
      });
  }
  //filter all option
  GetPatientReportsByImagingType(frmDate: string, toDate: string): void {
    this.editDoctorModels = [];
    if ((this.selImgType > 0) || (this.selImgType == -1)) {
      this.billingBLService.GetTxnItemsForEditDoctorByDateRad(frmDate, toDate)
        .subscribe(res => {
          if ((res.Status == "OK") && (res.Results != null)) {
            this.editDoctorModels = res.Results;

            if (this.selImgType == -1) {
              this.allImagingFilteredItems = this.editDoctorModels;
            } else {
              this.allImagingFilteredItems = this.editDoctorModels.filter(x => x.ServiceDepartmentName == this.selImgTypeName)
            }
            this.enablePreview = true;
          }
          else {
            this.messageService.showMessage("error", ["Not able to Load Item"]);
            console.log(res.ErrorMessage);
          }
        });
    }
  }

  ImagingTypeDropdownOnChange($event) {
    this.selImgType = $event.selectedType;
    this.selImgTypeName = $event.selectedImagingTypeName;
    this.GetPatientReportsByImagingType(this.FromDate, this.ToDate);
  }
}
