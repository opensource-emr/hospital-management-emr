import { Injectable, Directive } from '@angular/core';
import { VendorsModel } from '../settings/shared/vendors.model';
import { ItemMaster } from './item-master.model';
import { ItemModel } from '../settings/shared/item.model';
import { FiscalYearModel } from '../../accounting/settings/shared/fiscalyear.model';
import { InventoryFiscalYearModel } from './inventory-fiscal-year.model';

@Injectable()
export class InventoryService {

  public _Id: number = null;//sud:3Mar'20-removed since it's wrongly implemented all across, need to use specific Ids eg: ItemId, PoId, RequisitionId etc..

  public ItemId: number = 0;//sud:3Mar'20

  public DepartmentId: number = 0;//sud:3Mar'20
  public GoodsReceiptId: number = 0;//sud:19Feb'20--to be used to share only GrID among the components. 
  public RequisitionId: number = 0;
  public RequisitionNo: number = 0;
  public PurchaseRequestId: number = 0;
  public DispatchId: number = 0;
  public POId: number = null;//sud:3Mar'20
  public POIdforCopy: number = null;
  //public Name: string = null;//sud:3Mar'20
  public DepartmentName: string = null;
  public ItemName: string = null;//sud:3Mar'20
  public CreatedOn: string = null;//sud:3Mar'20
  public RequestedOn: string = null;
  public VendorId: number = 0;//sud:3Mar'20
  public ReqForQuotationId: number = 0;//sud:3Mar'20
  public isModificationAllowed: boolean = true;
  public isDispatchAllowed: boolean = true;
  public isRecreateMode: boolean = false;
  public StoreId: number = 0;//sud:3Mar'20
  public StoreName: string = null;

  //sanjit:23Mar'20--adding public variable for common use.
  //below variable will be set from inventory-main at the time of loading.
  public allVendorList: Array<VendorsModel> = [];
  public allItemList: Array<ItemModel> = [];
  public allItemPriceList: any[] = [];
  public allGRBillingList: any[] = [];
  allFiscalYearList: InventoryFiscalYearModel[] = [];

  public LoadAllVendorList(vendorList: Array<VendorsModel>) {
    this.allVendorList = vendorList;
  }
  public LoadAllItemList(itemList: Array<ItemModel>) {
    this.allItemList = itemList;
  }
  public LoadItemPriceHistory(itemPriceList: Array<any>) {
    this.allItemPriceList = itemPriceList;
  }
  public SetGRVendorBillingHistory(billList: Array<any>) {
    this.allGRBillingList = billList;
  }
  public LoadAllFiscalYearList(fiscalyearList: Array<InventoryFiscalYearModel>) {
    this.allFiscalYearList = fiscalyearList;
  }
  constructor() {
    console.log("In Inventory Service.");
  }
  // for non donation Goods Receipt Creation
  private _isDonation: boolean = false;
  public get isDonation(): boolean {
    return this._isDonation;
  }
  public set setDonationMode(donationMode: boolean) {
    this._isDonation = donationMode;
  }

  //public _Name: string = null;
  //public _POId: number = null;
  //public _CreatedOn: string = null;
  //public _VendorId: number = 0;
  ////public _RequisitionId: number = 0;
  //public _ReqForQuotationId: number = 0;


  //<----------POId-------->
  //get POId(): number {
  //  return this._POId;
  //}
  //set POId(POId: number) {
  //  this._POId = POId;
  //}
  // <----------ID--------->
  //get Id(): number {
  //  return this._Id;
  //}
  //set Id(Id: number) {
  //  this._Id = Id;
  //}
  // <----------Name--------->
  //get Name(): string {
  //  return this._Name;
  //}
  //set Name(Name: string) {
  //  this._Name = Name;
  //}
  // <----------CreatedOn--------->
  //get CreatedOn(): string {
  //  return this._CreatedOn;
  //}
  //set CreatedOn(CreatedOn: string) {
  //  this._CreatedOn = CreatedOn;
  //}
  // <----------VendorId--------->
  //get VendorId(): number {
  //  return this._VendorId;
  //}
  //set VendorId(VendorId: number) {
  //  this._VendorId = VendorId;
  //}

  //get ReqForQuotationId(): number {
  //  return this._ReqForQuotationId
  //}

  //set ReqForQuotationId(ReqForQuotationId: number) {
  //  this._ReqForQuotationId = ReqForQuotationId;
  //}


  //get RequisitionId(): number {
  //  return this._RequisitionId
  //}
  //set RequisitionId(RequisitionId: number) {
  //  this._RequisitionId = RequisitionId;
  //}

  //globalSerivceModel: InventoryServiceModel = new InventoryServiceModel()
  //public CreateNewGlobal(): InventoryServiceModel {
  //    this.globalSerivceModel = new InventoryServiceModel();
  //    return this.globalSerivceModel;
  //}
  //public getGlobal(): InventoryServiceModel {
  //    return this.globalSerivceModel;
  //}



}
// export class InventoryServiceModel {
//    public Id: number = 0;
//    public Name: string = "";
//    constructor() {
//    }

//}
