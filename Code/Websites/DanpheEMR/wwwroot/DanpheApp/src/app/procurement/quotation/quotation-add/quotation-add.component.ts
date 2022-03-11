import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CoreService } from '../../../core/shared/core.service';
import { GoodReceiptService } from '../../goods-receipt/good-receipt.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { ItemMaster } from '../../../inventory/shared/item-master.model';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { QuotationItemsModel } from '../quotation-items.model';
import { QuotationUpLoadFileModel } from '../quotation-upload-file.model';
import { QuotationBLService } from '../quotation.bl.service';
import { QuotationModel } from '../quotation.model';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { EventEmitter } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-quotation-add',
  templateUrl: './quotation-add.component.html',
  styles: []
})
export class QuotationAddComponent implements OnInit, AfterViewInit {
  @Output('call-back-close') showQuotationItmsPage: EventEmitter<Object> = new EventEmitter<Object>();
  public purchaseorderID: number = null;
  public QuotationAdd: Array<any> = new Array<any>();
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
  //public showQuotationItmsPage: boolean = false;
  public showViewFiles: boolean = false;
  public ViewFileList: QuotationUpLoadFileModel[] = [];
  public popupImageData: QuotationUpLoadFileModel = new QuotationUpLoadFileModel();
  public showImage: boolean = false;
  public showPDF: boolean = false;
  public showDOC: boolean = false;
  public datalocalURL: any;
  public loadQuotationItemsList: Array<QuotationItemsModel> = new Array<QuotationItemsModel>();
  public currQuotationItemsList: Array<QuotationItemsModel> = new Array<QuotationItemsModel>();
  public RFQItemsList: Array<QuotationItemsModel> = new Array<QuotationItemsModel>();
  public RFQVendorsList: Array<any> = new Array<any>();
  public ReqForQuotationId: number;
  public url: any;
  public RFQDetails: any[];
  public itemArray: any[];
  QuotationDetails: any[];
  files: QuotationUpLoadFileModel[];
  storeIndex: number = -1;
  ngOnInit() {
  }
  ngAfterViewInit() {
    this.setFocusById('Vendor');
  }
  constructor(
    public quotationBLService: QuotationBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public goodReceiptService: GoodReceiptService,
    public router: Router,
    public securityService: SecurityService,
    public coreservice: CoreService,
    public changeDetectorRef: ChangeDetectorRef,
    public _sanitizer: DomSanitizer,
    private _activateInventoryService: ActivateInventoryService) {
    this.ReqForQuotationId = this.inventoryService.ReqForQuotationId;
    var reqs: Observable<any>[] = [];
    // reqs.push(this.quotationBLService.GetRFQItemsList(this.ReqForQuotationId).pipe(
    //   catchError((err) => {
    //     return of(err.error);
    //   })
    // ));
    reqs.push(this.quotationBLService.loadQuotationAttachedFiles(this.ReqForQuotationId).pipe(
      catchError((err) => {
        return of(err.error);
      })
    ));
    reqs.push(this.quotationBLService.GetRFQVendorsList(this.ReqForQuotationId).pipe(
      catchError((err) => {
        // Handle specific error for this call
        return of(err.error);
      })
    ));
    forkJoin(reqs)
      .finally(() => this.setFocusById('priceField00'))
      .subscribe(result => {
        //this.CallBackLoadItemList(result[0]);
        this.CallBackloadQuotationAttachedFiles(result[0]);
        this.CallBackLoadRFQVendorList(result[1]);
      });
  }
  // CallBackLoadItemList(res) {
  //   if (res.Status == "OK" && res.Results.length > 0) {
  //     this.RFQItemsList = res.Results;
  //   }
  //   else {
  //     this.messageBoxService.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
  //   }
  // }
  CallBackloadQuotationAttachedFiles(res) {
    if (res.Status == "OK") {
      this.ViewFileList = res.Results;
      this.showViewFiles = true;
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
    }
  }
  CallBackLoadRFQVendorList(res) {
    try {
      if (res.Status == "OK" && res.Results.RFQDetailList.length > 0) {
        this.RFQVendorsList = res.Results.RFQDetailList;
        this.itemArray = [];
        this.RFQDetails = [];
        this.files = this.ViewFileList;
        for (var z = 0; z < this.RFQVendorsList.length; z++) {
          var temp = {
            "VendorName": this.RFQVendorsList[z].VendorName,
            "VendorId": this.RFQVendorsList[z].VendorId,
            "QuotationId": this.RFQVendorsList[z].QuotationId,
            "ItemList": this.RFQVendorsList[z].RFQItemList,
            "AttachedFileList": this.files.filter(x => x.VendorId == this.RFQVendorsList[z].VendorId)
          };
          this.RFQDetails.push(temp);
          this.itemArray = [];
        }
        console.log(this.RFQDetails);
      }

      else {
        this.messageBoxService.showMessage("notice-message", ["No Vendor available for this RFQ."]);
      }
    } catch (ex) {
      this.messageBoxService.showMessage("Failed", ["Something went wrong while loading the Vendor List."])
    }
  }

  myViewFileFormatter(data: any): string {
    let html = data["FileName"];
    return html;
  }

  SelectViewFiles(vendorIndex, file) {
    let files: QuotationUpLoadFileModel = new QuotationUpLoadFileModel();
    this.storeIndex = vendorIndex;
    files = file;
    this.openImage(files);
  }

  closeFiles() {
    this.storeIndex = -1;
    this.showImage = false;
    this.showPDF = false;
    this.showDOC = false;
    this.showViewFiles = true;
  }
  // Cancel() {
  //   this.Quotationlist = new QuotationItemsModel()
  //   this.QuotationAdd.quotationItems.push(this.Quotationlist);
  //   this.router.navigate(['ProcurementMain/Quotation']);
  // }

  Cancel() {
    this.showQuotationItmsPage.emit();
  }

  logError(err: any) {
    console.log(err);
  }


  SaveQuotation() {
    try {
      this.QuotationAdd = this.RFQDetails;
      this.QuotationDetails = [];
      this.QuotationAdd.forEach(quotation => {
        let quotationDetails = new QuotationModel();
        quotationDetails.ReqForQuotationId = this.ReqForQuotationId;
        quotationDetails.QuotationId = quotation.QuotationId ? quotation.QuotationId : null;
        quotationDetails.VendorId = quotation.VendorId;
        quotationDetails.VendorName = quotation.VendorName;
        quotationDetails.Status = "active";
        quotationDetails.quotationItems = quotation.ItemList;
        if (!this._activateInventoryService.activeInventory.StoreId) {
          this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First"])
          return;
        } else {
          quotationDetails.StoreId = this._activateInventoryService.activeInventory.StoreId;
          quotationDetails.RFQGroupId = this._activateInventoryService.activeInventory.INV_RFQGroupId;
        }
        this.QuotationDetails.push(quotationDetails);

      })

      this.quotationBLService.PostQuotationDetails(this.QuotationDetails)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.messageBoxService.showMessage("success", [' Quotation Added Successfully!!']);
            //this.QuotationAdd.quotationItems = new Array<QuotationItemsModel>();
            this.Quotationlist = new QuotationItemsModel();
            // this.QuotationAdd = new QuotationModel();
            this.changeDetectorRef.detectChanges();
            //this.QuotationAdd.quotationItems.push(this.Quotationlist);
            this.showQuotationItmsPage.emit();
            //this.showQuotationItmsPage = false;
            // this.tempForDeleteData = [];
          }
          else if (res.Status == "Failed") {
            this.messageBoxService.showMessage("error", ['Failed To Post Data']);
          }
          else
            this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
        })
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
          {
            this.popupImageData = Object.assign(this.popupImageData, openImageDoc);
            let WithOutExtention = this.popupImageData.FileName.split(".");
            this.popupImageData.FileName = WithOutExtention[0];
            this.showImage = true;
            //this.showViewFiles = false;
            break;
          }
        case ".pdf": {
          this.popupImageData = Object.assign(this.popupImageData, openImageDoc);
          let WithOutExtention = this.popupImageData.FileName.split(".");
          this.popupImageData.FileName = WithOutExtention[0];
          this.showImage = false;
          //this.showViewFiles = false;
          this.showPDF = true;
          //this provides src path to <Embed> tag in quotationitems.html for display PDF..
          this.url = this._sanitizer.bypassSecurityTrustResourceUrl("data:application/pdf;base64," + this.popupImageData.FileBinaryData);
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
        // case ".gif":
        //   {
        //     this.popupImageData = Object.assign(this.popupImageData, openImageDoc);
        //     let WithOutExtention = this.popupImageData.FileName.split(".");
        //     this.popupImageData.FileName = WithOutExtention[0];
        //     this.showImage = true;
        //     this.showViewFiles = false;
        //     break;
        //   }
        //text / plain
        // case ".txt": {
        //   let WithOutExtention = this.popupImageData.FileName.split(".");
        //   this.popupImageData.FileName = WithOutExtention[0];
        //   this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "text/plain");
        //   break;
        // }


        //application / vnd.ms - excel(.xls)

        // case ".xls": {
        //   let WithOutExtention = this.popupImageData.FileName.split(".");
        //   this.popupImageData.FileName = WithOutExtention[0];
        //   this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/vnd.ms-excel");
        //   break;
        // }
        //application / vnd.openxmlformats - officedocument.spreadsheetml.sheet(.xlsx)
        // case ".xlsx": {
        //   let WithOutExtention = this.popupImageData.FileName.split(".");
        //   this.popupImageData.FileName = WithOutExtention[0];
        //   this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        //   break;
        // }
        //application / vnd.ms - powerpoint(.ppt)
        // case ".ppt": {
        //   let WithOutExtention = this.popupImageData.FileName.split(".");
        //   this.popupImageData.FileName = WithOutExtention[0];
        //   this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/vnd.ms-powerpoint");
        //   break;
        // }
        //application / vnd.openxmlformats - officedocument.presentationml.presentation(.pptx)
        // case ".pptx": {
        //   let WithOutExtention = this.popupImageData.FileName.split(".");
        //   this.popupImageData.FileName = WithOutExtention[0];
        //   this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        //   break;
        // }

        //application / zip
        // case ".zip": {
        //   let WithOutExtention = this.popupImageData.FileName.split(".");
        //   this.popupImageData.FileName = WithOutExtention[0];
        //   this.DownloadDoc(openImageDoc.FileBinaryData, openImageDoc.FileName, "application/zip");
        //   break;
        // }
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

  setFocusById(idToSelect: string, waitingTimeInms: number = 0) {
    var timer = setTimeout(() => {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      if (nextEl) {
        nextEl.focus();
        nextEl.select();
      }
      clearTimeout(timer)
    }, waitingTimeInms)

  }


  // enter key handlers
  onPressEnterKeyInPriceField(indexOfVendor: number, indexOfItems: number) {
    // format of the price field id is : priceField<indexOfVendorList><indexOfItemList>
    // if enter key is pressed on a item which is
    // 1. the last item of last vendor
    if (indexOfItems == (this.RFQDetails[indexOfVendor].ItemList.length - 1) && indexOfVendor == (this.RFQDetails.length - 1)) {
      // then go to print btn
      this.setFocusById('btn_Submit')
    }
    // 2. the last item of a vendor that is not last
    else if (indexOfItems == (this.RFQDetails[indexOfVendor].ItemList.length - 1)) {
      // then go to price field of next vendors first item
      this.setFocusById(`priceField${indexOfVendor + 1}${0}`)
    }
    // 3. not a last item
    else {
      this.setFocusById(`priceField${indexOfVendor}${indexOfItems + 1}`)
    }
  }
}
