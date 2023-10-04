import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ENUM_GRItemCategory } from '../../../shared/shared-enums';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DonationItemsModel, DonationModel } from '../donation.model';
import { DonationService } from '../donation.service';
import { VendorMaster } from '../../shared/vendor-master.model';
import { InventoryService } from '../../shared/inventory.service';
import { ItemMaster } from '../../shared/item-master.model';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-donation-form',
  templateUrl: './donation-form.component.html',
  styleUrls: ['./donation-form.component.css']
})
export class DonationFormComponent implements OnInit {
  donationForm: FormGroup;
  @Input('loadmodel') model: DonationModel;
  @Output() submitEvent = new EventEmitter<DonationModel>();
  showDonationForm: boolean = false;
  public vendorList: Array<any> = new Array();
  public itemList: any[];
  public filtereIitemList: Array<DonationItemsModel> = [];
  @Input('edit-mode') public editMode: boolean = false;
  public rowCount: number = 0;

  public donationDetails: DonationModel = new DonationModel();
  public donationItems: Array<DonationItemsModel> = [];
  public itemCategories: string[] = [];
  public selectedVendor: any = null;
  public editGR: boolean = false;
  public loading: boolean = false;
  defaultItemCat: ENUM_GRItemCategory;
  duplicateItem: boolean = false;


  constructor(private fb: FormBuilder, private ref: ChangeDetectorRef, public _donationService: DonationService, public inventoryService: InventoryService, private _activeInventoryService: ActivateInventoryService,
    public msgBox: MessageboxService, public router: Router) {
    this.LoadItemCategory();
  }

  ngOnInit(): void {
    this.getVendorsThatReceiveDonation();
    this.getAvailableStock();
    if (!this.model) {
      this.model = new DonationModel();
    }
    // else {
    //   this.editMode = true;
    // }
    this.createDonationForm();
    this.setautofocus();
  }

  public LoadItemCategory() {
    this.itemCategories = Object.values(ENUM_GRItemCategory).filter(p => isNaN(p as any));
  }
  getAvailableStock() {
    this._donationService.getAvailableStock(this._activeInventoryService.activeInventory.StoreId).subscribe(res => {
      if (res.Results != null && res.Results.length > 0) {
        this.itemList = res.Results;
        this.itemList = this.itemList.filter(x => x.AvailQuantity > 0)
        if (this.editMode == false)
          this.addDonationItem();

      }
      else {
        this.msgBox.showMessage("error", ["No Item Available to Donate."]);
      }

    })
  }


  submit(form) {
    this.loading = true;
    this.donationForm.updateValueAndValidity();
    this.donationForm.markAsTouched();
    if (this.donationForm.valid) {
      this.model = Object.assign(this.model, form.value);
      this.model.StoreId = this._activeInventoryService.activeInventory.StoreId;
      if (this.editMode) {
        this._donationService.UpdateDonation(this.model, this.model.DonationId).finally(() => {
          this.loading = false;
        }).subscribe(res => {
          if (res.Status == "OK") {
            this.inventoryService.DonationId = res.Results;
            this.msgBox.showMessage("Success", ["Donation updated Successfully !"]);
            this.router.navigate(["/Inventory/Donation/DonationList"]);
          }
          else {
            this.msgBox.showMessage("Failed", ["Donation update failed !"]);
          }
        });
        return;
      }
      this._donationService.SaveDonation(this.model).finally(() => {
        this.loading = false;
      }).subscribe(res => {
        if (res.Status == "OK") {
          this.inventoryService.DonationId = res.Results;
          this.msgBox.showMessage("Success", ["Donation saved Successfully !"]);
          this.router.navigate(["/Inventory/Donation/DonationView"]);
        }
        else {
          this.msgBox.showMessage("Failed", [`Failed to save donation. ${res.ErrorMessage}`]);
        }
      }
        , err => {
          this.msgBox.showMessage("Failed", [`Failed to save donation. ${err.ErrorMessage}`]);
        });
      this.submitEvent.emit(form);
    }
    else {
      this.msgBox.showMessage("Failed", ["Check all the mandatory fields."])
    }
  }

  createDonationForm() {
    this.donationForm = this.fb.group({
      VendorId: [this.model.VendorId, [Validators.required]],
      VendorName: [this.model.VendorName],
      StoreId: [this.model.StoreId],
      DonationReferenceNo: [this.model.DonationReferenceNo, [Validators.required]],
      DonationReferenceDate: [this.model.DonationReferenceDate],
      TotalAmount: [this.model.TotalAmount],
      Remarks: [this.model.Remarks],
      DonationItems: this.fb.array([]),
    });
    if (this.editMode == true) {
      this.model.DonationItems.forEach(item => this.DonationItems.push(this.createDonationItemsForm(item)));
      this.ref.detectChanges();
    }
    // else {
    //   this.addDonationItem();
    // }
  }

  createDonationItemsForm(donationItem = new DonationItemsModel()): FormGroup {
    var donationItemFormGroup = this.fb.group({
      StockId: [donationItem.StockId],
      ItemId: [donationItem.ItemId, [Validators.required]],
      DonationQuantity: [donationItem.DonationQuantity, [Validators.required, Validators.min(1)]],
      Specification: [donationItem.Specification],
      AvailableQty: [donationItem.AvailableQty],
      Unit: [donationItem.Unit],
      Code: [donationItem.Code],
      ModelNo: [donationItem.ModelNo],
      CostPrice: [donationItem.CostPrice],
      TotalAmount: [donationItem.TotalAmount],
      Remarks: [donationItem.Remarks],
      IsCancel: [donationItem.IsCancel],
      canUserDelete: [donationItem.canUserDelete],
      ItemName: [donationItem.ItemName, [Validators.required]],
      CategoryName: [donationItem.CategoryName],
      GRDate: [donationItem.GRDate]
    });
    donationItemFormGroup.get("DonationQuantity").valueChanges.subscribe((newQty) => {
      this.setDonationItemTotalAmount(donationItemFormGroup, newQty);
      this.setDonationTotalAmount();
    });
    return donationItemFormGroup;

  }
  private setDonationItemTotalAmount(donationItemFormGroup: FormGroup, newQty: any): void {
    return donationItemFormGroup.get("TotalAmount").setValue(newQty * donationItemFormGroup.get("CostPrice").value);
  }


  setautofocus() {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("VendorName");
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 900);
  }

  setDonationTotalAmount(): void {
    var items = this.DonationItems.value as Array<DonationItemsModel>;
    const totalAmount = items.reduce((a, b) => a + b.TotalAmount, 0);
    this.donationForm.get("TotalAmount").setValue(totalAmount);
  }

  addDonationItem() {
    if (this.duplicateItem == true) {
      this.msgBox.showMessage("Warning", ['Duplicate Item. Unable to add']);
      return;
    }
    this.DonationItems.push(this.createDonationItemsForm());
    this.ref.detectChanges();
    this.defaultItemCat = ENUM_GRItemCategory.Consumables;
    this.DonationItems.controls[this.DonationItems.length - 1].get("CategoryName").setValue(this.defaultItemCat, { onlySelf: true });
    this.filtereIitemList = this.FilterItemByItemCategory(this.defaultItemCat);
  }
  deleteDonationItem(index: number) {

    var canUserDelete = this.DonationItems.controls[index].get("canUserDelete").value;
    if (canUserDelete != false) {
      //remove if user is allowed to delete it.
      this.DonationItems.removeAt(index);
    }
    else {
      //cancel if user is not allowed to delete it.
      this.DonationItems.controls[index].get("IsCancel").setValue(true);

    }
    //add item if all the item is cancelled or removed
    if (this.DonationItems.controls.filter(a => a.get("IsCancel").value != true).length == 0) {
      this.addDonationItem();
    }
  }

  undoDeletedItem(index: number) {
    this.DonationItems.controls[index].get("IsCancel").setValue(false);
    this.DonationItems.controls[index].get("ItemId").enable();
  }


  GoToNextInput(idToSelect: string, waitingTimeinms: number = 0) {
    var timer = window.setTimeout(() => {
      if (document.getElementById(idToSelect)) {
        let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
        nextEl.focus();
        nextEl.select();
      }
      clearTimeout(timer);
    }, waitingTimeinms);
  }

  OnClickRemarkButton(i: number) {
    // if enter key is pressed in the last row, then add new row and move the focus to new row's itemname
    if (this.donationForm.valid) {
      this.addDonationItem();
      this.GoToNextInput(`itemName${i + 1}`, 300);
    }
    else {
      this.msgBox.showMessage("Warning", ['Make Sure you have entered correct data']);
    }
  }

  //used to get all vendors that can receive the donation
  public getVendorsThatReceiveDonation() {
    this._donationService.getAllVendorsThatReceiveDonation().subscribe(
      res => {
        if (res.Status = "OK") {
          this.vendorList = res.Results;
          console.log(this.vendorList);
        }
        err => {
          this.msgBox.showMessage('Error', err);
        }
      }
    );
  }

  SelectVendorFromSearchBox($event) {
    if ($event != null && typeof ($event) == 'object') {
      this.donationForm.get("VendorId").setValue($event.VendorId);
      this.donationForm.get("VendorName").setValue($event.VendorName);
    }
  }

  OnItemCategoryChange(index) {
    var donationItemCat = this.DonationItems.controls[index].get("CategoryName").value;
    this.filtereIitemList = this.FilterItemByItemCategory(donationItemCat);
    this.GoToNextInput("itemName" + index, 100);
  }
  FilterItemByItemCategory(itemCategoryName) {
    this.filtereIitemList = this.itemList.filter(item => item.ItemType === itemCategoryName);
    //selectedGRItem.filteredItemList = selectedGRItem.filteredItemList.slice();
    return this.filtereIitemList;
  }

  SelectItemFromSearchBox(data, index) {
    if (data != null && typeof (data) == 'object') {

      this.DonationItems.controls[index].get("ItemId").setValue(data.ItemId);
      this.DonationItems.controls[index].get("StockId").setValue(data.StockId);
      this.DonationItems.controls[index].get("ItemName").setValue(data.ItemName);
      this.DonationItems.controls[index].get("AvailableQty").setValue(data.AvailQuantity);
      this.DonationItems.controls[index].get("Unit").setValue(data.UOMName);
      this.DonationItems.controls[index].get("Code").setValue(data.ItemCode);
      this.DonationItems.controls[index].get("CostPrice").setValue(data.CostPrice);
      this.DonationItems.controls[index].get("GRDate").setValue(data.GRDate);
    }

    for (let i = 0; i < this.DonationItems.length; i++) {
      for (let j = i; j < this.DonationItems.length; j++) {
        if (i != j) {
          if (this.DonationItems.controls[i].get("ItemId").value == this.DonationItems.controls[j].get("ItemId").value
            && this.DonationItems.controls[i].get("StockId").value == this.DonationItems.controls[j].get("StockId").value) {
            this.msgBox.showMessage("warning", [`Item: ${data.ItemName}  is already selected. Please select new Item`]);
            this.duplicateItem = true;
          }
          else {
            this.duplicateItem = false;
          }
        }
      }
    }

  }
  CancelDonation() {
    let isConfirm = window.confirm("Are you sure to cancel donation");
    if (isConfirm) {
      this.donationForm.setControl('DonationItems', new FormArray([]));
      this.donationForm.reset();
      this.addDonationItem();
      if (this.editMode) {
        this.router.navigate(["/Inventory/Donation/DonationList"]);
      }
    }
  }
  donationVendorListFormatter(data: any): string {
    let html = data["VendorName"];
    return html;
  }

  itemListFormatter(data: any): string {
    let html = data["ItemName"];
    html += (data["Description"] == null || data["Description"] == "") ? "" : ("|" + data["Description"]);
    return html;
  }



  get DonationItems() {
    return this.donationForm.get("DonationItems") as FormArray;
  }
  get VendorId() {
    return this.donationForm.get("VendorId") as FormControl;
  }
  get TotalAmount() {
    return this.donationForm.get("TotalAmount") as FormControl;
  }


}


