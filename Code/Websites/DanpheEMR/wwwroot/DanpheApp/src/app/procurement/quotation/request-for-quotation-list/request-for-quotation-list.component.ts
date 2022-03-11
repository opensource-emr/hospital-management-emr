import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { GoodReceiptService } from '../../goods-receipt/good-receipt.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { VendorMaster } from '../../../inventory/shared/vendor-master.model';
import { SecurityService } from '../../../security/shared/security.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import ProcurementGridColumns from '../../shared/procurement-grid-column';
import { QuotationUpLoadFileModel } from '../quotation-upload-file.model';
import { QuotationBLService } from '../quotation.bl.service';
import { RequestForQuotationModel } from '../request-for-quotaion.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  selector: 'app-request-for-quotation-list',
  templateUrl: './request-for-quotation-list.component.html',
  styleUrls: ['request-for-quotation-list.component.css']
})
export class RequestForQuotationListComponent implements OnInit {

  public ReqForQuotationList: any;
  public index: number = 0;
  public ReqForQuotationGridColumns: Array<any> = null;
  public polistVendorwiseGridColumns: Array<any> = null;
  public ReqForQuotationItems: any;
  public disable: boolean = true;
  public localDatalist: Array<any> = [];
  public selectedDatalist: Array<any> = [];
  public showReqForQuotationId: boolean = false;
  public showQuotationUploadFilesPopup: boolean = false;
  public quotationfiles: QuotationUpLoadFileModel = new QuotationUpLoadFileModel();
  public VendorList: any;
  public showQuotationItmsPage: boolean = false;
  public checkIsItemPresent: boolean = false;
  public showSelectedQuotation: boolean = false;
  public showRFQPrintPage: boolean = false;
  public getQuotationBystatus: RequestForQuotationModel = new RequestForQuotationModel();
  public QuotationItemsList: any;
  public showQuotationPrintPage: boolean = false;
  public RFQList: any;

  @ViewChild("fileInput") fileInput;
  msgBoxServ: any;
  showNepaliReceipt: boolean;
  ReqForQuotationVendors: any;
  printDetails: HTMLElement;
  showPrint: boolean;
  showSelectedQuotationPrint: boolean;
  fiscalYearList: any[];
  fiscalYearName: any[];
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  labelUpdate: boolean = false;

  constructor(public quotationBLService: QuotationBLService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public coreService: CoreService,
    public goodReceiptService: GoodReceiptService,
    public router: Router) {
    this.ReqForQuotationGridColumns = ProcurementGridColumns.ReqQuotationList;
    this.LoadPOListByStatus();
    this.GetInventoryBillingHeaderParameter();
    this.fiscalYearList = this.inventoryService.allFiscalYearList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('RequestedOn', false)]);
  }
  ngOnInit() {
    let receipt = this.coreService.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
  }

  closeQuotationUpload() {
    this.showQuotationUploadFilesPopup = false
  }

  SubmitQuotationFiles() {
    try {
      let files = this.fileInput.nativeElement.files;
      let file = files[0];
      //Check Validation 
      for (var i in this.quotationfiles.QuotationFileValidator.controls) {
        this.quotationfiles.QuotationFileValidator.controls[i].markAsDirty();
        this.quotationfiles.QuotationFileValidator.controls[i].updateValueAndValidity();
      }
      if (this.quotationfiles.IsValidCheck(undefined, undefined) && this.quotationfiles != null) {
        if (files.length) {
          // upload only pdf.wold,jpg,jpeg and png files     
          if (file.type == "application/pdf" || file.type == "image/jpeg" || file.type == "image/png" || file.type == "image/jpg" || file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            if (this.quotationfiles) {
              this.quotationfiles.FileName = "Quotation" + "_" + moment().format('DDMMYYHHMMSS');
              this.AddQuotationFiles(files, this.quotationfiles);
            }
          } else {

            this.messageBoxService.showMessage("Notice", ["Please Select Proper File Format... "]);
          }

        }
      }
      else {
        this.messageBoxService.showMessage("Notice", ["Please Insert Proper SupperName... "]);
      }
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  AddQuotationFiles(filesToUpload, quotationfiles): void {

    try {

      if (filesToUpload.length || quotationfiles) {
        this.quotationBLService.AddQuotationFiles(filesToUpload, quotationfiles)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.messageBoxService.showMessage("success", [' Quotation File Uploded']);
              this.showQuotationUploadFilesPopup = false;
              this.quotationfiles = new QuotationUpLoadFileModel();
            }
            else if (res.Status == "Failed") {
              this.messageBoxService.showMessage("error", ['Failed']);
            }
            else
              this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
          });
      }

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  //This function only for show catch messages
  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.messageBoxService.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  CreateRequestForQuotation() {
    this.router.navigate(['/ProcurementMain/Quotation/RequestForQuotationAdd']);
  }

  LoadPOListByStatus() {
    this.quotationBLService.GetReqForQuotationList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.ReqForQuotationList = res.Results
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Quotation list.. please check log for details.']);
          console.log(res.ErrorMessage);
        }
      });

  }

  ngafterviewchecked() {
    this.changeDetectorRef.detectChanges();
  }

  ReqForQuotationGridAction($event: GridEmitModel) {
    let rfqDate = $event.Data.RequestedOn;
    let fiscalYear = this.fiscalYearList.filter(fy => fy.StartDate <= rfqDate && fy.EndDate >= rfqDate);
    this.fiscalYearName = fiscalYear.map(a => a.FiscalYearName);
    switch ($event.Action) {

      case "View": {
        this.RFQList = [];
        this.RFQList = $event.Data;
        this.ShowReqForQuotationDetailsById($event.Data.ReqForQuotationId);
      }
        break;
      case "AttachQuotationDocuments": {
        this.showQuotationUploadFilesPopup = true;
        this.RFQList = [];
        this.RFQList = $event.Data;
        this.quotationfiles.RequestForQuotationId = $event.Data.ReqForQuotationId;
        this.LoadVendorList($event.Data.ReqForQuotationId);

      }
        break;
      case "AddQuotationDetails": {
        this.RFQList = [];
        this.RFQList = $event.Data;
        this.showQuotationItmsPage = true;
        if ($event.Data.QuotationId != null) {
          this.labelUpdate = true;
        }
        this.inventoryService.ReqForQuotationId = $event.Data.ReqForQuotationId
      }
        break;
      case "AnalyseQuotation": {
        this.router.navigate(['/ProcurementMain/Quotation/QuotationAnalysis']);
        this.inventoryService.ReqForQuotationId = $event.Data.ReqForQuotationId

      }
        break;
      case "SelectedQuotation": {
        this.RFQList = [];
        this.RFQList = $event.Data;
        //this.showSelectedQuotationPrint = true;
        this.getQuotationBySelected($event.Data.ReqForQuotationId);

      }
        break;
      case "QuotationList": {
        this.showSelectedQuotation = true;
        this.inventoryService.ReqForQuotationId = $event.Data.ReqForQuotationId;
      }
        break;
      case "addPO": {
        this.inventoryService.ReqForQuotationId = $event.Data.ReqForQuotationId;
        this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderAdd']);
      }
        break;
      default:
        break;
    }
  }

  closeQuotationItemsPage() {
    this.showQuotationItmsPage = false;
  }
  getQuotationBySelected(ReqForQuotationId) {
    this.quotationBLService.getQuotationBySelected(ReqForQuotationId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.getQuotationBystatus = res.Results;
          let QuotationId = res.Results.QuotationId;
          this.quotationBLService.GetQuotationItemsById(QuotationId)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.QuotationItemsList = res.Results;
              }
            });
          this.showSelectedQuotationPrint = true;
        }
        else {
          this.messageBoxService.showMessage("failed", ['Failed to get ReqForQuotationItem.' + res.ErrorMessage]);
        }
      })
  }

  ShowReqForQuotationDetailsById(ReqForQuotationId) {
    this.quotationBLService.GetReqForQuotationById(ReqForQuotationId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.ReqForQuotationItems = res.Results.RFQItems;
          this.ReqForQuotationVendors = res.Results.RFQVendors;
          this.showRFQPrintPage = true;
        }
        else {
          this.messageBoxService.showMessage("failed", ['Failed to get ReqForQuotationItem.' + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage("error", ['Failed to get ReqForQuotationItem.' + err.ErrorMessage]);
        })
  }

  Close() {
    this.showReqForQuotationId = false;
    this.showQuotationItmsPage = false;
    this.showRFQPrintPage = false;
    this.showQuotationPrintPage = false;
    this.showSelectedQuotationPrint = false;
    this.labelUpdate = false;
  }


  LoadVendorList(RFQId) {
    this.quotationBLService.GetRFQVendorsList(RFQId)
      .subscribe(
        res => this.VendorList = res.Results.RFQDetailList
      );
  }
  //used to format display vendro in ng-autocomplete
  myVendorListFormatter(data: any): string {
    return data["VendorName"];
  }

  SelectVendorFromSearchBox(Item: VendorMaster) {
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
      this.quotationfiles.VendorId = Item.VendorId;
      this.quotationfiles.VendorName = Item.VendorName;
    }
  }

  closeSelectedQuotation() {
    this.showSelectedQuotation = false;
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanpheStyle.css" />` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" />` + printContents +
      `</body></html>`);
    popupWinindow.document.close();
  }

  printNepali() {
    let popupWinindow;
    var printContents = document.getElementById("printnepalipage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanpheStyle.css" />` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" />` + printContents +
      `</body></html>`);
    popupWinindow.document.close();
  }

  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

  PrintFxnNepali() {
    this.printDetails = document.getElementById("printnepalipage");
    this.showPrint = true;
  }
  PrintSelectedQuotationFxnNepali() {
    this.printDetails = document.getElementById("selectedQuotationNepalipage");
    this.showPrint = true;
  }

  callBackPrint() {
    this.printDetails = null;
    this.showPrint = false;
  }


}
