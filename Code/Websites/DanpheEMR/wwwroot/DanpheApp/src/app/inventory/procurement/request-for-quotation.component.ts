import { Component, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { SecurityService } from '../../security/shared/security.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";

import { InventoryService } from '../shared/inventory.service';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import * as moment from 'moment/moment';
import { QuotationUpLoadFileModel } from '../shared/quotation-upload-file.model';
import { GoodReceiptService } from '../shared/good-receipt/good-receipt.service';
import { VendorMaster } from '../shared/vendor-master.model';
import { RequestForQuotationModel } from '../shared/request-for-quotaion.model';
import { CoreService } from '../../core/shared/core.service';

@Component({
  templateUrl: "../../view/inventory-view/RequestForQuotation.html"  
})
export class RequestForQuotationComponent {

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

  constructor(public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public coreService: CoreService,
    public goodReceiptService: GoodReceiptService,
    public router: Router) {
    this.ReqForQuotationGridColumns = GridColumnSettings.ReqQuotationList;
    this.LoadPOListByStatus();
    this.LoadVendorList();
    this.GetInventoryBillingHeaderParameter();
  }

  closeQuotationUpload() {
    this.showQuotationUploadFilesPopup = false
  }

  SubmitQuotationFiles() {
    try {
      let files = this.fileInput.nativeElement.files;
      //Check Validation 
      for (var i in this.quotationfiles.QuotationFileValidator.controls) {
        this.quotationfiles.QuotationFileValidator.controls[i].markAsDirty();
        this.quotationfiles.QuotationFileValidator.controls[i].updateValueAndValidity();
      }
      if (this.quotationfiles.IsValidCheck(undefined, undefined) && this.quotationfiles != null) {
        this.quotationfiles.RequestForQuotationId = this.ReqForQuotationList.ReqForQuotationId;
        if (files.length) {
          if (this.quotationfiles) {
            this.quotationfiles.FileName = "Quotation" + "_" + moment().format('DDMMYYHHMMSS');
            this.AddQuotationFiles(files, this.quotationfiles);
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
        this.inventoryBLService.AddQuotationFiles(filesToUpload, quotationfiles)
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
    this.router.navigate(['/Inventory/ProcurementMain/RequestForQuotationItems']);
  }

  LoadPOListByStatus() {
    this.inventoryBLService.GetReqForQuotationList()
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
    switch ($event.Action) {

      case "View": {
        this.RFQList = [];
        this.RFQList = $event.Data;
        this.ShowReqForQuotationItemsById($event.Data.ReqForQuotationId);
      }
        break;
      case "AttachQuotationDocuments": {
        this.showQuotationUploadFilesPopup = true;
        this.RFQList = [];
        this.RFQList = $event.Data;
        this.quotationfiles.RequestForQuotationId = $event.Data.RequestForQuotationId;

      }
        break;
      case "AddQuotationDetails": {
        this.RFQList = [];
        this.RFQList = $event.Data;
        this.showQuotationItmsPage = true;
        this.inventoryService.ReqForQuotationId = $event.Data.ReqForQuotationId
      }
        break;
      case "AnalyseQuotation": {
        this.router.navigate(['/Inventory/ProcurementMain/QuotationAnalysis']);
        this.inventoryService.ReqForQuotationId = $event.Data.ReqForQuotationId

      }
        break;
      case "SelectedQuotation": {
        this.getQuotationBySelected($event.Data.ReqForQuotationId);

      }
        break;
      case "QuotationList": {
        this.showSelectedQuotation = true;
        this.inventoryService.ReqForQuotationId = $event.Data.ReqForQuotationId;
      }
        break;
      default:
        break;
    }
  }


  getQuotationBySelected(ReqForQuotationId) {
    this.inventoryBLService.getQuotationBySelected(ReqForQuotationId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.getQuotationBystatus = res.Results[0];
          let QuotationId = res.Results[0].QuotationId;
          this.inventoryBLService.GetQuotationItemsById(QuotationId)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.QuotationItemsList = res.Results;
              }
            });
          this.showQuotationPrintPage = true;
        }
        else {
          this.messageBoxService.showMessage("failed", ['Failed to get ReqForQuotationItem.' + res.ErrorMessage]);
        }
      })
  }

  ShowReqForQuotationItemsById(ReqForQuotationId) {
    this.inventoryBLService.GetReqForQuotationById(ReqForQuotationId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.ReqForQuotationItems = res.Results;
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
  }


  LoadVendorList() {
    this.goodReceiptService.GetVendorList()
      .subscribe(
        res => this.VendorList = res.Results
      );
  }
  //used to format display vendro in ng-autocomplete
  myVendorListFormatter(data: any): string {    
    return  data["VendorName"];
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
    popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">`+
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanpheStyle.css" />` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" />`+ printContents +
      `</body></html>`);
    popupWinindow.document.close();
  }

  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
}




