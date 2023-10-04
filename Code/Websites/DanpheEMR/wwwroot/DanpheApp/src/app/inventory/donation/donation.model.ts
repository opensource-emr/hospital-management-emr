import { NullInjector } from "@angular/core/src/di/injector";
import * as moment from "moment";

export class DonationModel {
    DonationId: number = 0;
    public VendorId: number = null;
    public SerialNumber: number = null;
    public StoreId: number = null;
    public DonationReferenceNo: string = null;
    public DonationReferenceDate: string = moment().format("YYYY-MM-DD");
    public TotalAmount: number = 0;
    public Remarks: string = null;
    public selectedVendor: any;
    public VendorName: string = null;
    public DonationItems: Array<DonationItemsModel> = new Array<DonationItemsModel>();
}

export class DonationItemsModel {
    public CategoryName: string = null;
    public ItemId: number = null;
    public StockId: number = null;
    public ItemName: string = null;
    public Specification: string = null;
    public ModelNo: string = null;
    public CostPrice: number = null;
    public TotalAmount: number = null;
    public Remarks: string = null;
    public IsCancel: boolean = false;
    public canUserDelete: boolean = true;
    public DonationQuantity: number = null;
    public AvailableQty: number = null;
    public Unit: string = null;
    public Code: string = null;
    public ItemCategory: string = null;
    public filteredItemList: any;
    public isItemDuplicate: boolean = false; // used in GR-Add UI for duplicate alert.
    public GRDate: string = moment().format("YYYY-MM-DD");
    public SerialNumber: number;
    public VendorId: number;

}
export class DonationVM {
    public DonationId: number = null;
    public DonationNo: number = null;
    public VendorId: number = null;
    public VendorName: string = null;
    public StoreId: number = null;
    public StoreName: string = null;
    public DonationReferenceNo: string = null;
    public DonationReferenceDate: string = moment().format("YYYY-MM-DD");
    public TotalAmount: number = null;
    public Remarks: string = null;

    public DonatedDate: string = moment().format("YYYY-MM-DD");
    public Username: string = null;

}
export class DoantionItemsVM {
    public ItemId: number = null;
    public DonationItemId: number = null;
    public ItemName: string = null;
    public CategoryName: string = null;
    public Code: string = null;
    public BatchNo: string = null;
    public Specification: string = null;
    public Unit: string = null;
    public ModelNo: string = null;
    public CostPrice: number = null;
    public DonationQuantity: number = null;
    public TotalAmount: number = null;
    public Remarks: string = null;
    public DonatedDate: string = moment().format("YYYY-MM-DD");
    public StockId: number = null;
    public GRDate: string = moment().format("YYYY-MM-DD");

}
export class DonationDetailsVM {
    public donationDetails: DonationVM = new DonationVM();
    public donationItemDetails: DoantionItemsVM[] = [];
}
