import { Injectable, Directive } from '@angular/core';
import { PharmacyReceiptModel } from './pharmacy-receipt.model';
import { PHRMInvoiceReturnItemsModel } from "./phrm-invoice-return-items.model";
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PHRMInvoiceItemsModel } from './phrm-invoice-items.model';
import { PHRMGoodsReceiptModel } from './phrm-goods-receipt.model';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PharmacyService {

      public _Id: number = null;
      public _Name: string = null;
      public _ProviderId: number = null;
      public _PatientId: number = null;
      public _GRId: number = null;
      public _RequisitionId: number = null; // requistion id from nusring module
      public currencyUnit: string = "";
      private messageSource = new BehaviorSubject(0);
      gRId = this.messageSource.asObservable();
      constructor(public coreService: CoreService, public msgBoxServ: MessageboxService) {
            this.GetCurrencyUnit();
      }
      changeMessage(message:number) {
            this.messageSource.next(message)
          }
      // <----------ID--------->
      get Id(): number {
            return this._Id;
      }
      set Id(Id: number) {
            this._Id = Id;
      }
      // <----------GRID--------->
      get GRId(): number {
            return this._GRId;
      }
      set GRId(Id: number) {
            this._GRId = Id;
      }
      // <----------Name--------->
      get Name(): string {
            return this._Name;
      }
      set Name(Name: string) {
            this._Name = Name;
      }

      // <----------ProviderId--------->
      get ProviderId(): number {
            return this._ProviderId;
      }
      set ProviderId(ProviderId: number) {
            this._ProviderId = ProviderId;
      }
      // <----------PatientId--------->
      get PatientId(): number {
            return this._PatientId;
      }

      set RequisitionId(RequisitionId: number) {
            this._RequisitionId = RequisitionId;
      }

      get RequisitionId(): number {
            return this._RequisitionId;
      }

      set PatientId(PatientId: number) {
            this._PatientId = PatientId;
      }
      globalPharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
      public GetGlobalPharmacyReceipt(): PharmacyReceiptModel {
            return this.globalPharmacyReceipt;
      }
      globalPharmacyGoodReceipt:PHRMGoodsReceiptModel= new PHRMGoodsReceiptModel();
      public GetGlobalPharmacyGoodReceipt(id): PHRMGoodsReceiptModel {
             
            return this.globalPharmacyGoodReceipt;
      }
      public CreateNew() {
            this._Id = null;
            this._Name = null;
            this._ProviderId = null;
            this._PatientId = null;
      }

      globalReturnSaleTransaction: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();

      public CreateNewGlobalReturnSaleTransaction(): Array<PHRMInvoiceReturnItemsModel> {
            this.globalReturnSaleTransaction = new Array<PHRMInvoiceReturnItemsModel>();
            return this.globalReturnSaleTransaction;
      }
      public getGlobalReturnSaleTransaction(): Array<PHRMInvoiceReturnItemsModel> {
            return this.globalReturnSaleTransaction;
      }

      public GetCurrencyUnit() {
            var currParameter = this.coreService.Parameters.find(a => a.ParameterName == "Currency")
            if (currParameter)
                  this.currencyUnit = JSON.parse(currParameter.ParameterValue).CurrencyUnit;
            else
                  this.msgBoxServ.showMessage("error", ["Please set currency unit in parameters."]);
      }

}
