import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryService } from '../../shared/inventory.service';
import DonationridColumnSettings from '../donation-grid-columns';
import { DonationItemsModel, DonationModel } from '../donation.model';
import { DonationService } from '../donation.service';

@Component({
  selector: 'app-donation-list',
  templateUrl: './donation-list.component.html',
  styleUrls: ['./donation-list.component.css']
})
export class DonationListComponent implements OnInit {

  public donationGridColumns: Array<any> = [];
  public fromDate: string = moment().format("YYYY-MM-DD");
  public toDate: string = moment().format("YYYY-MM-DD");
  StoreId: any;

  public dateRange: string = null;
  public selectedVendorId: number = null;
  public vendorsThatReceiveDonation: Array<any> = [];
  public donationsList: Array<DonationItemsModel> = new Array<DonationItemsModel>();
  public donationFilteredList: Array<DonationItemsModel> = new Array<DonationItemsModel>();

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  constructor(public _donationSerive: DonationService, public msgService: MessageboxService, public _activeInventoryService: ActivateInventoryService,
    public _inventoryService: InventoryService, public router: Router) {
    this.donationGridColumns = DonationridColumnSettings.DonationList;
    this.dateRange = "last3Months";
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('DonatedDate', false), new NepaliDateInGridColumnDetail('DonationReferenceDate', false)]);
    this.StoreId = this._activeInventoryService.activeInventory.StoreId;
  }


  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;

    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetAllDonationList();
      } else {
        //this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }

    }
  }
  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this._inventoryService.DonationId = $event.Data.DonationId;
        this.router.navigate(["/Inventory/Donation/DonationView"]);
        break;
      }
      case "cancel":
        {
          let confirm = window.confirm("Are you sure to cancle this donation");
          if (confirm) {
            alert("I am cancled");
          }
          break;
        }
      default:
        break;
    }
  }


  ngOnInit() {
    this.GetAllVendorsListThatReceiveDonation();
  }
  GetAllVendorsListThatReceiveDonation() {
    this._donationSerive.getAllVendorsThatReceiveDonation().subscribe(res => {
      if (res.Status = "OK") {
        this.vendorsThatReceiveDonation = res.Results;
      }
      else {
        this.msgService.showMessage('Error', ["Unable to get vendor list"]);
      }
    });
  }

  GetAllDonationList() {
    this._donationSerive.GetAllDonationList(this.fromDate, this.toDate, this.StoreId).subscribe(res => {
      if (res.Status = "OK") {
        let i = 0;
        this.donationsList = res.Results;
        if (this.donationsList.length > 0) {
          this.donationsList.forEach(x => {
            x.SerialNumber = i + 1;
            i++
          });
        }
        if (this.selectedVendorId && this.selectedVendorId == null) {
          this.donationFilteredList = this.donationsList;
        }
        else {
          this.OnVendorChange();
        }
      }
      else {
        this.msgService.showMessage('Error', [`Failed to get donation list ${res.ErrorMessage}`]);
      }
    });
  }
  OnVendorChange() {
    if (this.selectedVendorId && this.selectedVendorId != null) {
      this.donationFilteredList = this.donationsList.filter(x => x.VendorId == this.selectedVendorId);
    }
    else {
      this.donationFilteredList = this.donationsList;
    }
  }
  OnGridExport($event: GridEmitModel) {
    //changing datetime format to date only for view
    $event.Data.GoodReceiptDate = moment($event.Data.GoodReceiptDate).format("YYYY-MM-DD");
    // this.donationFilteredList = $event.Data;
    // this.currentGRdetails.GoodReceiptId = $event.Data.GoodReceiptId;
    // this.currentGRdetails.IsCancel = $event.Data.IsCancel;
    // this.showPopUp = true;

  }

  gridExportOptions = {
    fileName: 'DonationItemsReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };
}
