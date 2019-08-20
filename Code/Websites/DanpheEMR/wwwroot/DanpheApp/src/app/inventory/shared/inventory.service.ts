import { Injectable, Directive } from '@angular/core';

@Injectable()
export class InventoryService {

    public _Id: number = null;
    public _Name: string = null;
    public _POId: number = null;
    public _CreatedOn: string = null;
  public _VendorId: number = 0;
  public _ReqForQuotationId: number = 0;
    //<----------POId-------->
    get POId(): number {
        return this._POId;
    }
    set POId(POId: number) {
        this._POId = POId;
    }
    // <----------ID--------->
    get Id(): number {
        return this._Id;
    }
    set Id(Id: number) {
        this._Id = Id;
    }
    // <----------Name--------->
    get Name(): string {
        return this._Name;
    }
    set Name(Name: string) {
        this._Name= Name;
    }
    // <----------CreatedOn--------->
    get CreatedOn(): string {
        return this._CreatedOn;
    }
    set CreatedOn(CreatedOn: string) {
        this._CreatedOn = CreatedOn;
    }
    // <----------VendorId--------->
    get VendorId(): number {
        return this._VendorId;
    }
    set VendorId(VendorId: number) {
        this._VendorId = VendorId;
  }

  get ReqForQuotationId(): number {
    return this._ReqForQuotationId
  }

  set ReqForQuotationId(ReqForQuotationId: number) {
    this._ReqForQuotationId = ReqForQuotationId;
  }

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
