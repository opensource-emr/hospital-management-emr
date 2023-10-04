import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { PHRMWriteOffItemModel } from '../../../../pharmacy/shared/phrm-write-off-items.model';
import { PHRMWriteOffModel } from '../../../../pharmacy/shared/phrm-write-off.model';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import DispensaryGridColumns from '../../../../dispensary/shared/dispensary-grid.column';
import { DispensaryService } from '../../../../dispensary/shared/dispensary.service';
import { Router } from '@angular/router';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { CoreService } from "../../../../core/shared/core.service";

@Component({
  selector: 'app-write-off-list',
  templateUrl: './write-off-list.component.html',
  styleUrls: ['./write-off-list.component.css']
})
export class WriteOffListComponent implements OnInit {
  ///For Binding WriteOff List
  public writeOffList: Array<PHRMWriteOffModel> = new Array<PHRMWriteOffModel>();
  ///For Binding Grid Column
  public writeOffListGridColumns: Array<any> = null;
  ///variable to show-hide Popup box
  public showWriteoffItemsbyWriteoffId: boolean = false;

  ////variable to Bind All WriteOffItemList
  public PHRMWriteOffItemsList: Array<PHRMWriteOffItemModel> = new Array<PHRMWriteOffItemModel>();
  ///variable to push WriteOffItemList to this variable because we have to minimize server call
  public localWriteOffDatalist: Array<PHRMWriteOffItemModel> = new Array<PHRMWriteOffItemModel>();
  ///final stored List to bind by locally stored data to view
  public selectedWriteOffDatalist: Array<PHRMWriteOffItemModel> = new Array<PHRMWriteOffItemModel>();
  ///for display writeoff data
  public WriteOffdata: PHRMWriteOffItemModel = new PHRMWriteOffItemModel();
  currentActiveDispensary: PHRMStoreModel;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor( private _dispensaryService : DispensaryService,
    public pharmacyBLService: PharmacyBLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService, public router: Router,public coreService: CoreService) {
    /////Grid Coloumn Variable
    this.writeOffListGridColumns = DispensaryGridColumns.WriteOffList;
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('WriteOffDate', false));

    ////Get All Write Off List With Its All Item 
    this.getWriteOffList();
  }
  ngOnInit(): void {
  }
  ///GET: List Of All WriteOff With SUM of Total Qty and Order by Desending WriteOffId
  public getWriteOffList() {
    try {
      this.pharmacyBLService.GetWriteOffList()
        .subscribe(res => {
          if (res.Status == "OK") {
            this.writeOffList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("error", ["Failed to get WriteOff List. " + res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Failed to get WriteOff List. " + err.ErrorMessage]);
          });
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  ////Grid Action Method
  WriteOffGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this.ShowRetSuppItemsDetailsByRetSuppId($event.Data.WriteOffId);
        break;
      }
      default:
        break;
    }
  }


  ///this function is for when enduser Clicks on View in WriteOffList 
  ShowRetSuppItemsDetailsByRetSuppId(writeOffId) {

    try {
      this.showWriteoffItemsbyWriteoffId = false;
      this.changeDetector.detectChanges();
      ///After ChangeDetection We r changing showWriteoffItemsbyWriteoffId=true because we have to display ModelPopupBox Based on this Flag
      this.showWriteoffItemsbyWriteoffId = true;

      //////Here is Logic To Minimize the Server Call on Each request : Umed-04Jan2017
      /////Every New Request We go to Server 
      ////After that we can store Result data to some varible and Once again if same request is come  then we can display data from locally store varible (without making new Server call)
      //localWriteOffDatalist is Array of WriteOffItem in this variable we are storing Response Data


      //len is local varibale deceleration
      var len = this.localWriteOffDatalist.length;
      ///lopping Each Locally store data and if perticular data is found on selected writeOffId , then we can push selected data to selectedWriteOffDatalist array
      for (var i = 0; i < len; i++) {
        let selectedDataset = this.localWriteOffDatalist[i];
        if (selectedDataset.WriteOffId == writeOffId) {
          this.selectedWriteOffDatalist.push(selectedDataset);
        }
      }
      ///if we have some selectedWriteOffDatalist then we can display that on View
      if (this.selectedWriteOffDatalist[0] && writeOffId) {
        ///storing selectedWriteOffDatalist to PHRMWriteOffItemsList to Display in View
        this.PHRMWriteOffItemsList = this.selectedWriteOffDatalist;
        ///after passing data to View - we have to make sure that selectedWriteOffDatalist should be Empty
        this.selectedWriteOffDatalist = new Array<PHRMWriteOffItemModel>();

      }
      else {
        (   /////making new server call through BL and DL service By Passing writeOffId
          this.pharmacyBLService.GetWriteOffItemsByWriteOffId(writeOffId)
            .subscribe(res => {
              if (res.Status == "OK") {
                ////this is the final data and we have stored in PHRMWriteOffItemsList because we have to display data in View
                let Data = res.Results;
                this.PHRMWriteOffItemsList = Data.WriteOffitemsdetails;
                this.WriteOffdata.WriteOffId = Data.WriteOffdetails.WriteOffId;
                this.WriteOffdata.CreatedOn = Data.WriteOffdetails.CreatedOn;
                this.WriteOffdata.SubTotal = Data.WriteOffdetails.SubTotal;
                this.WriteOffdata.DiscountedAmount = Data.WriteOffdetails.DiscountAmount;
                this.WriteOffdata.VATAmount = Data.WriteOffdetails.VATAmount;
                this.WriteOffdata.TotalAmount = Data.WriteOffdetails.TotalAmount;
                this.WriteOffdata.WriteOffItemRemark = Data.WriteOffdetails.Remark;
                this.WriteOffdata.UserName = Data.WriteOffdetails.UserName;
                ///After that we are passing same Results To localWriteOffDatalist to minimize the server call and once same request is come, then display data in view by using that
                ///insted of making server call we can fatch data from Local 
                this.PHRMWriteOffItemsList.forEach(itm => { this.localWriteOffDatalist.push(itm); });

              } else {
                this.msgBoxServ.showMessage("failed", ['Failed to get WriteOffItemList.' + res.ErrorMessage]);
              }
            },
              err => {
                this.msgBoxServ.showMessage("error", ['Failed to get WriteOffItemList.' + err.ErrorMessage]);
              }
            )
        )
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  printwriteOff() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><style>.printStyle {border: dotted 1px;margin: 10px 100px;}.print-border-top {border-top: dotted 1px;}.print-border-bottom {border-bottom: dotted 1px;}.print-border {border: dotted 1px;}.center-style {text-align: center;}.border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}</style><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.close();
  }
  /////For Closing ModelBox Popup
  Close() {
    try {
      this.showWriteoffItemsbyWriteoffId = false;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  ////This function only for show catch messages in console 
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  AddBreakage(){
    this.router.navigate(['/Pharmacy/Store/WriteOffItems/Add']);
  }
}
