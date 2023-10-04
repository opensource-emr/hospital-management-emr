import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliReceiptEndpointService } from '../../../shared/nepali-receipt-views/nepali-receipt-endpoint.service';

@Component({
  selector: 'app-donation-gr-view',
  templateUrl: './donation-gr-view.component.html',
  styles: []
})
export class DonationGrViewComponent implements OnInit {
  @Input("goods-receipt-id") goodsReceiptId: number;
  donationDetail: DonationGRDto = new DonationGRDto();
  @Output("call-back-close") callbackClose: EventEmitter<any> = new EventEmitter();
  printDetaiils: HTMLElement;
  showPrint: boolean;
  constructor(public nepaliReceiptService: NepaliReceiptEndpointService, private _msgBox: MessageboxService) { }

  ngOnInit() {
    this.nepaliReceiptService.GetDoncationGRView(this.goodsReceiptId).subscribe(res => {
      if (res.Status == "OK") {
        this.donationDetail = res.Results.DonationGR;
      }
      else {
        console.log(res.ErrorMessage);
        this._msgBox.showMessage("Failed", ["Failed to load the donation receipt."]);
      }
    })
  }
  // Event Listener
  close() {
    this.callbackClose.emit();
  }
  print() {
    this.printDetaiils = document.getElementById("print-page");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
}
class DonationGRDto {
  DonationDate: string | null;
  DonationFormNo: string;
  DonationItems: DonationGRItemDto[] = [];
}

class DonationGRItemDto {
  ItemName: string;
  Specification: string;
  Code: string;
  UOMName: string;
  Quantity: number;
  Rate: number;
  TotalAmount: number;
  Remarks: string;
}
