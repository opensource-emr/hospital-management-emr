import { Component, ChangeDetectorRef, ViewChild, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from "../../core/shared/core.service"
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InventoryService } from '../shared/inventory.service';
import { ItemMaster } from '../shared/item-master.model';
import { QuotationItemsModel } from '../shared/quotation-items.model';
import { GoodReceiptService } from '../shared/good-receipt/good-receipt.service';
import { QuotationModel } from '../shared/quotation.model';
import { VendorMaster } from '../shared/vendor-master.model';
import { SecurityService } from '../../security/shared/security.service';
import { RequestForQuotationItemsModel } from '../shared/request-for-quotation-item.model';
import { QuotationUpLoadFileModel } from '../shared/quotation-upload-file.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'quotation-items',
  templateUrl: "../../view/inventory-view/QuotationItems.html"
})
export class QuotationItemsComponent {
  public purchaseorderID: number = null;
  public QuotationAdd: QuotationModel = new QuotationModel();
  public Quotationlist: QuotationItemsModel = new QuotationItemsModel();
  public header: any = null;
  public ItemList: Array<ItemMaster> = new Array<ItemMaster>();
  public rowCount: number = 0;
  public checkIsItemPresent: boolean = false;
  public ShowVendorDetails: boolean = false;
  public index: number = 0;
  public showAddItemPopUp: boolean = false;
  public VendorList: any;
  public selectReqForQuotationList: any;
  public showQuotationItmsPage: boolean = false;
  public showViewFiles: boolean = false;
  public ViewFileList: QuotationUpLoadFileModel = new QuotationUpLoadFileModel();
  public popupImageData: QuotationUpLoadFileModel = new QuotationUpLoadFileModel();
  public showImage: boolean = false;
  public showPDF: boolean = false;
  public showDOC: boolean = false;
  public datalocalURL: any;
  public loadQuotationItemsList: Array<QuotationItemsModel> = new Array<QuotationItemsModel>();
  public currQuotationItemsList: Array<QuotationItemsModel> = new Array<QuotationItemsModel>();
  public RFQItemsList: Array<QuotationItemsModel> = new Array<QuotationItemsModel>();
  public ReqForQuotationId: number = 0;
  public url:any;
  
  constructor(
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public goodReceiptService: GoodReceiptService,
    public router: Router,
    public securityService: SecurityService,
    public coreservice: CoreService,
    public changeDetectorRef: ChangeDetectorRef,
    public _sanitizer: DomSanitizer) {
    this.LoadVendorList();
    this.LoadItemList();
    this.AddRowRequestOnClick(0);
    this.ReqForQuotationId = this.inventoryService.ReqForQuotationId;
  }

  LoadVendorList() {
    this.goodReceiptService.GetVendorList()
      .subscribe(
        res => this.VendorList = res.Results
      );
  }

  LoadItemList() {
    this.inventoryBLService.GetRFQItemsList()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.RFQItemsList = res.Results;
        }
        else {
          this.messageBoxService.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
        }
      });
  }

  LoadViewFiles(VendorId) {
    this.inventoryBLService.GetViewFilesList(VendorId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.ViewFileList = res.Results;
          this.showViewFiles = true;
        }
        else {
          this.messageBoxService.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
        }
      });
  }
  LoadQuotationItemsList(VendorId) {
    this.inventoryBLService.GetQuotationItemsListList(VendorId)
      .subscribe(res =>
        this.CallBackGetQuotationItemsListList(res)
      );
  }

  CallBackGetQuotationItemsListList(res) {
    try {
      if (res.Status == 'OK') {
        if (res.Results) {
          this.loadQuotationItemsList = res.Results;
          let temp = new Array<QuotationItemsModel>();
          temp = res.Results;
          if (temp.length == 0) {
            this.QuotationAdd.quotationItems = []
            this.AddRowRequestOnClick(0);
            this.messageBoxService.showMessage('Notice', ['There is No Items for this vendor Please Add Some']);
          }
          else {

            for (let i = 0; i < temp.length; i++) {
              this.QuotationAdd.QuotationId = temp[i].QuotationId;
              temp[i].IsAdded = false;
            }
            this.QuotationAdd.quotationItems = temp;
          }
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }


  myViewFileFormatter(data: any): string {
    let html = data["FileName"];
    return html;
  }

  SelectViewFiles(index) {
    let files: QuotationUpLoadFileModel = new QuotationUpLoadFileModel();
    files = this.ViewFileList[index];
    this.openImage(files)
  }

  closeFiles() {
    this.showImage = false;
    this.showPDF = false;
    this.showDOC = false;
    this.showViewFiles = true;
  }

  AddItemPopUp(i) {
    this.showAddItemPopUp = false;
    this.index = i;
    this.changeDetectorRef.detectChanges();
    this.showAddItemPopUp = true;
  }


  AddRowRequestOnClick(index) {
    try {
      var tempReq: QuotationItemsModel = new QuotationItemsModel();
      this.QuotationAdd.quotationItems.push(tempReq);
      if (this.QuotationAdd.quotationItems.length == 0) {
        this.QuotationAdd.quotationItems.push(tempReq);
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }


  }


  DeleteRow(index) {
    if (this.QuotationAdd.quotationItems[index].QuotationId != 0) {
      let check = confirm("Are you sure you want to delete it?");

      if (check) {
        this.QuotationAdd.quotationItems.splice(index, 1);
        if (index == 0) {
          this.Quotationlist = new QuotationItemsModel();
          this.QuotationAdd.quotationItems.push(this.Quotationlist);
          this.changeDetectorRef.detectChanges();
        }
        else {
          this.changeDetectorRef.detectChanges();
        }
      }
    }
    else {
      this.QuotationAdd.quotationItems.splice(index, 1);
      if (index == 0) {
        this.Quotationlist = new QuotationItemsModel();
        this.QuotationAdd.quotationItems.push(this.Quotationlist);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.changeDetectorRef.detectChanges();
      }
    }
  }


  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  //used to format display vendro in ng-autocomplete
  myVendorListFormatter(data: any): string {
    let html = data["VendorName"];
    return html;
  }

  SelectVendorFromSearchBox(vendorItm: VendorMaster) {
    if (typeof vendorItm === "object" && !Array.isArray(vendorItm) && vendorItm !== null) {
      //this for loop with if conditon is to check whether the  item is already present in the array or not
      //means to avoid duplication of item
      for (var i = 0; i < this.QuotationAdd.quotationItems.length; i++) {
        if (this.QuotationAdd.quotationItems[i].VendorId == vendorItm.VendorId) {
          this.checkIsItemPresent = true;
        }
      }
      if (this.checkIsItemPresent == true) {
        this.messageBoxService.showMessage("notice-message", [vendorItm.VendorName + " is already add..Please Check!!!"]);
        this.checkIsItemPresent = false;
        this.changeDetectorRef.detectChanges();
        this.Quotationlist = new QuotationItemsModel();
        this.QuotationAdd.quotationItems.push(this.Quotationlist);
      }
      else {
        for (var a = 0; a < this.QuotationAdd.quotationItems.length; a++) {
          this.QuotationAdd.VendorId = vendorItm.VendorId;
          this.QuotationAdd.VendorName = vendorItm.VendorName;
          this.LoadQuotationItemsList(vendorItm.VendorId);
          this.LoadViewFiles(vendorItm.VendorId);
        }
      }
    }
  }

  SelectItemFromSearchBox(Item: RequestForQuotationItemsModel, index) {
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
      for (var a = 0; a < this.QuotationAdd.quotationItems.length; a++) {

        if (a == index) {
          this.QuotationAdd.quotationItems[index].ItemId = Item.ItemId;
          this.QuotationAdd.quotationItems[index].ItemName = Item.ItemName;
        }
      }

    }
  }

  Cancel() {
    this.Quotationlist = new QuotationItemsModel()
    this.QuotationAdd.quotationItems.push(this.Quotationlist);
    this.router.navigate(['Inventory/ProcurementMain/Quotation']);
  }

  Close() {
    this.showQuotationItmsPage = false;
  }

  logError(err: any) {
    console.log(err);
  }


  SaveQuotation() {
    try {

      var CheckIsValid = true;

      if (this.QuotationAdd.IsValidCheck(undefined, undefined) == false) {
        // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
        for (var b in this.QuotationAdd.QuotationValidator.controls) {
          this.QuotationAdd.QuotationValidator.controls[b].markAsDirty();
          this.QuotationAdd.QuotationValidator.controls[b].updateValueAndValidity();
          CheckIsValid = false;
        }
      }
      if (CheckIsValid == true) {

        if (this.QuotationAdd.QuotationId != 0) {
          for (var i = 0; i < this.QuotationAdd.quotationItems.length; i++) {
            var itm = this.loadQuotationItemsList.find(a => a.QuotationId === a.QuotationId);
            this.QuotationAdd.quotationItems[i].QuotationId = itm.QuotationId;
            this.QuotationAdd.QuotationId = itm.QuotationId;
          }

        }

        for (var i = 0; i < this.QuotationAdd.quotationItems.length; i++) {
          this.QuotationAdd.quotationItems[i].VendorId = this.QuotationAdd.VendorId;

        }
        this.QuotationAdd.Status = "active"
        this.QuotationAdd.ReqForQuotationId = this.ReqForQuotationId;
        this.inventoryBLService.PostQuotationDetails(this.QuotationAdd)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.messageBoxService.showMessage("success", [' Quotation File Uploded']);
              this.QuotationAdd.quotationItems = new Array<QuotationItemsModel>();
              this.Quotationlist = new QuotationItemsModel();
              this.QuotationAdd = new QuotationModel();
              this.changeDetectorRef.detectChanges();
              this.QuotationAdd.quotationItems.push(this.Quotationlist);
              this.showQuotationItmsPage = false;
              // this.tempForDeleteData = [];
            }
            else if (res.Status == "Failed") {
              this.messageBoxService.showMessage("error", ['Failed To Post Data']);
            }
            else
              this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
          })

      } else {
        this.messageBoxService.showMessage('Notice', ['Please select SupplierName']);
      }
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
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


  openImage(openImageDoc: QuotationUpLoadFileModel): void {
    try {
      switch (openImageDoc.FileExtention.toLowerCase()) {
        case ".png":
        case ".jpeg":
        case ".jpg":
        case ".gif":
          {
            this.popupImageData = Object.assign(this.popupImageData, openImageDoc);
            let WithOutExtention = this.popupImageData.FileName.split(".");
            this.popupImageData.FileName = WithOutExtention[0];
            this.showImage = true;
            this.showViewFiles = false;
            break;
          }
        case ".pdf": {
          this.popupImageData = Object.assign(this.popupImageData, openImageDoc);
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.showImage = false;
          this.showViewFiles = false;
          this.showPDF = true;
          //this provides src path to <Embed> tag in quotationitems.html for display PDF..
          this.url = this._sanitizer.bypassSecurityTrustResourceUrl("data:application/pdf;base64," + this.popupImageData.FileBinaryData);
          break;
        }

        //text / plain
        case ".txt": {
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "text/plain");
          break;
        }

        //application / msword
        case ".doc": {
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/msword");
          break;
        }
        //application / vnd.openxmlformats - officedocument.wordprocessingml.document(.docx)
        case ".docx": {
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
          break;
        }
        //application / vnd.ms - excel(.xls)

        case ".xls": {
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/vnd.ms-excel");
          break;
        }
        //application / vnd.openxmlformats - officedocument.spreadsheetml.sheet(.xlsx)
        case ".xlsx": {
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
          break;
        }
        //application / vnd.ms - powerpoint(.ppt)
        case ".ppt": {
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/vnd.ms-powerpoint");
          break;
        }
        //application / vnd.openxmlformats - officedocument.presentationml.presentation(.pptx)
        case ".pptx": {
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
          break;
        }

        //application / zip
        case ".zip": {
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/zip");
          break;
        }
        default: {
          this.messageBoxService.showMessage("error", ['unsupported file format'])
          this.showImage = false;
          this.popupImageData = new QuotationUpLoadFileModel();
        }
      }

    } catch (ex) {

      this.ShowCatchErrMessage(ex);
    }

  }

  public DownloadDoc(strData, strFileName, strMimeType) {
    var D = document, A = arguments, a = D.createElement("a"),
      d = A[0], n = A[1], t = A[2] || strMimeType;
    var newdata = "data:" + strMimeType + ";base64," + strData;
    //build download link:
    a.href = newdata;
    if ('download' in a) {
      a.setAttribute("download", n);
      a.innerHTML = "downloading...";
      D.body.appendChild(a);
      setTimeout(function () {
        var e = D.createEvent("MouseEvents");
        e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
        );
        a.dispatchEvent(e);
        D.body.removeChild(a);
      }, 66);
      return true;
    };
  }
}
