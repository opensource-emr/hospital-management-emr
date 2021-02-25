import { Component, Input, Output, EventEmitter } from "@angular/core";
import { InvoiceHeaderModel } from "../invoice-header.model";
import { MessageboxService } from "../messagebox/messagebox.service";
import { HttpClient } from "@angular/common/http";
import * as _ from 'lodash';

@Component({
  selector: 'select-invoice-header',
  templateUrl: './select-invoice-header.html'
})

export class SelectInvoiceHeaderComponent {

  public showHeaderPreview: boolean = false;
  //public imgURL: any = null;
  public selectedInvoiceHeader: InvoiceHeaderModel = null;
  public module: string = "";
  public loading: boolean;

  @Output('call-back')
  public callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public isFileValid: boolean = true;

  @Input('SelectedHeaderId')
  public selectedHeaderId: number = 0;

  //@Input('SelectedHeaderId')
  //public set SHvalue(val) {
  //  this.selectedHeaderId = val;
  //}

  @Input('Module')
  public set moduleValue(value) {
    this.module = value;
  }
  public allInvoiceHeaderList: Array<InvoiceHeaderModel> = [];

  constructor(private _http: HttpClient,
    public msgBoxSrv: MessageboxService,) {
  }

  ngOnInit() {
    this.getInvoiceHeaderList();
  }

  public getInvoiceHeaderList() {
    if (this.module) {
      this._http.get<any>("/api/Pharmacy/GetInvoiceHeader/" + this.module.toLowerCase())
        .subscribe(res => {
          if (res.Status == "OK" && res.Results && res.Results.length > 0) {
            var tempIHList: Array<InvoiceHeaderModel> = res.Results;
            this.allInvoiceHeaderList = tempIHList.filter(a => a.IsActive != false);

            if (this.selectedHeaderId && this.selectedHeaderId > 0) { // header is already selected on Edit case
              var selectedInvoiceHeader = this.allInvoiceHeaderList.filter(a => a.InvoiceHeaderId == this.selectedHeaderId);
              if (selectedInvoiceHeader) {
                this.selectedInvoiceHeader = selectedInvoiceHeader[0];
                this.callbackAdd.emit(this.selectedInvoiceHeader.InvoiceHeaderId);
              } else {
                this.msgBoxSrv.showMessage("Information", ["Invoice Header Not Found!"]);
              }
             
            } else {
              if (this.allInvoiceHeaderList.length>0) {
                this.selectedInvoiceHeader = this.allInvoiceHeaderList[0]; // on default top most header is selected
                this.callbackAdd.emit(this.selectedInvoiceHeader.InvoiceHeaderId);
              }              
            }
          }
          else {
            this.allInvoiceHeaderList = [];
            console.log("No Invoice Header Found!");
          }

        }, err => {
          console.log("No Invoice Header Found!");
        });
    } else {
      console.log("Invoice Header Error");
    }
    
  }

  Close() {
    this.showHeaderPreview = false;
  }

  public OnHeaderChange() {
    //this.imgURL = null;
    //this.imgURL = 'data:image/jpeg;base64,' + this.selectedInvoiceHeader.FileBinaryData;
    this.callbackAdd.emit(this.selectedInvoiceHeader.InvoiceHeaderId);
  }

}
