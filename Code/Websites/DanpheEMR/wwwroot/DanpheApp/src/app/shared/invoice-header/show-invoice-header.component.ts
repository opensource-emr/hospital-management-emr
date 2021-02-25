import { Component, Input } from "@angular/core";
import { InvoiceHeaderModel } from "../invoice-header.model";
import { MessageboxService } from "../messagebox/messagebox.service";
import { HttpClient } from "@angular/common/http";
import * as _ from 'lodash';

@Component({
  selector: 'show-invoice-header',
  templateUrl: './show-invoice-header.html'
})

export class ShowInvoiceHeaderComponent {

  public imgURL: any = null;
  public selectedInvoiceHeader: InvoiceHeaderModel = null;
  public module: string = "";
  public loading: boolean;

  //@Output('call-back')
  //public callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public selectedHeaderId: number = 0;

  @Input('SelectedHeaderId')
  public set SHvalue(val) {
    if (val) {
      this.imgURL = null;
      this.selectedHeaderId = val;
    }
  }

  @Input('Module')
  public set moduleValue(value) {
    this.module = value;
  }

  public allInvoiceHeaderList: Array<InvoiceHeaderModel> = [];

  // Hard-coded binary image string of QR code for tempory.
  public QRURL = 'data:image/jpeg;base64,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';

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
            this.allInvoiceHeaderList = res.Results;

            if (this.selectedHeaderId && this.selectedHeaderId > 0) { // header is already selected on Edit case
              var selectedInvoiceHeader = this.allInvoiceHeaderList.filter(a => a.InvoiceHeaderId == this.selectedHeaderId);
              this.selectedInvoiceHeader = selectedInvoiceHeader[0];
              this.imgURL = 'data:image/jpeg;base64,' + this.selectedInvoiceHeader.FileBinaryData;
              //this.callbackAdd.emit(this.selectedInvoiceHeader.InvoiceHeaderId);
            } else {
              this.imgURL = null;
              this.msgBoxSrv.showMessage("Information", ["No Invoice Header Selected!"]);
            }
          }
          else {
            this.allInvoiceHeaderList = [];
            this.msgBoxSrv.showMessage("Information", ["No Invoice Header Found!"]);
          }

        }, err => {
            this.msgBoxSrv.showMessage("Failed", [err.message]);
        });
    } else {
      this.msgBoxSrv.showMessage("Failed", ["Error While getting Invoice Headers!"]);
    }
    
  }
}
