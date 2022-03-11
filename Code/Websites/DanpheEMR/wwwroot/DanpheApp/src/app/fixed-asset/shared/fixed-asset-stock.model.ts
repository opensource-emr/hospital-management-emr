import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { FLOAT } from "html2canvas/dist/types/css/property-descriptors/float";
import * as moment from "moment";

export class FixedAssetStockModel {
    public FixedAssetStockId: number = 0;
    public GoodsReceiptItemId: number = 0;
    public ItemId: number = 0;
    public AssetCode: string;
    public BarCodeNumber: string;
    public AssetsLocation: string | any;
    public BatchNo: string;
    public WarrantyExpiryDate: string = moment().format("YYYY-MM-DD");
    public IsBarCodeGenerated: boolean = false;
    public IsActive: boolean = true;
    public IsAssetDamaged: boolean = false;
    public DamagedRemarks: string;
    public UndamagedRemarks: string;
    public CreatedBy: number;
    public CreatedOn: string;

    public ItemName: string;
    public ItemCode: string;
    public VendorName: string;
    public CreatedByName: string;
    public SN: number;
    public TotalLife: number;
    public YearOfUse: FLOAT;
    public ManufactureDate: string = moment().format("YYYY-MM-DD");
    public Performance: string = "";
    public ExpectedValueAfterUsefulLife: number;

    public IsUnderMaintenance: boolean = false;
    public IsMaintenanceRequired: boolean = false;
    public IsAssetDamageConfirmed: boolean = false;
    public IsAssetScraped: boolean = false;

    public ScrapAmount: number;
    public ScrapRemarks: string;
    public ScrapCancelRemarks: string;


    public BuildingBlockNumber: string;
    public Floors: string;
    public RoomNumber: string;
    public RoomPosition: string;
    // public vendor: VendorsModel;

    public CompanyPosition: string;
    public Name: string;
    public PhoneNumber: string;
    public CompanyPosition2: string;
    public Name2: string;
    public PhoneNumber2: string;
    public VendorId: number = 0;

    public SerialNo: string;
    public ModelNo: string;
    public InstallationDate: string = moment().format("YYYY-MM-DD");
    public PeriodicServiceDays: number;
    public ServiceDate: string;
    public ServiceCompleteDate: string;

    public FAStockValidators: FormGroup = null;
    public FAEditAssetValidators: FormGroup = null;
    public FAEditAssetMainteanceValidators: FormGroup = null;

    //for Donations purpose tilganga hospital in INV_TXN_FixedAssetStock table 
    public DonationId: any;
    public Donation: string;

    //for Asset Movement Purpose
    public StoreId: number;
    public AssetHolderId: number;
    public SubStoreId: number;
    public CssdStatus: string;
    public IsColdStorageApplicable: boolean;
  IsCurrentUserMaintenanceOwner: boolean;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.FAStockValidators = _formBuilder.group({
            'DamagedRemarks': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'ScrapAmount': ['', Validators.compose([Validators.required])],
            'ScrapRemarks': ['', Validators.compose([Validators.required, Validators.maxLength(2000)])],

        });
        this.FAEditAssetValidators = _formBuilder.group({
            'BuildingBlockNumber': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'SerialNo': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'ModelNo': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'AssetsLocation': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'Floors': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'RoomNumber': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'RoomPosition': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'WarrantyExpiryDate': ['', Validators.compose([])],
            'StoreId': ['', Validators.required],
            'AssetHolderId': ['']
        });

        this.FAEditAssetMainteanceValidators = _formBuilder.group({
            'CompanyPosition': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'Name': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'PhoneNumber': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'CompanyPosition2': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'Name2': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'PhoneNumber2': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'TotalLife': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'YearOfUse': ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
            'InstallationDate': [''],
            'ManufactureDate': [''],

        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.FAStockValidators.dirty;
        else
            return this.FAStockValidators.controls[fieldName].dirty;
    }

    public IsValid(): boolean {
        if (this.FAStockValidators.valid) { return true; } else { return false; }
    }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.FAStockValidators.valid;
        }
        else {
            return !(this.FAStockValidators.hasError(validator, fieldName));
        }
    }


    public IsEditAssetmaintenanceDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.FAEditAssetMainteanceValidators.dirty;
        else
            return this.FAEditAssetMainteanceValidators.controls[fieldName].dirty;
    }

    public IsEditAssetmaintenanceValid(): boolean {
        if (this.FAEditAssetMainteanceValidators.valid) { return true; } else { return false; }
    }
    public IsEditAssetmaintenanceValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.FAEditAssetMainteanceValidators.valid;
        }
        else {
            return !(this.FAEditAssetMainteanceValidators.hasError(validator, fieldName));
        }
    }


    public IsEditAssetDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.FAEditAssetValidators.dirty;
        else
            return this.FAEditAssetValidators.controls[fieldName].dirty;
    }

    public IsEditAssetValid(): boolean {
        if (this.FAEditAssetValidators.valid) { return true; } else { return false; }
    }
    public IsEditAssetValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.FAEditAssetValidators.valid;
        }
        else {
            return !(this.FAEditAssetValidators.hasError(validator, fieldName));
        }
    }


}
