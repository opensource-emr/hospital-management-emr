import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_MessageBox_Status, ENUM_ServiceBillingContext } from "../../../shared/shared-enums";
import { BillingAdditionalServiceItem_DTO } from "../dto/bill-additional-service-item.dto";

@Component({
  selector: 'bill-additional-item-select',
  templateUrl: './bill-additional-item-select.component.html',
  styleUrls: ['./bill-additional-item-select.component.css']
})
export class BillAdditionalItemSelectComponent {

  @Input('additional-items-list')
  public BillingAdditionalServiceItems = new Array<BillingAdditionalServiceItem_DTO>();
  @Input('billing-context')
  public BillingContext: string = "";

  @Output("additional-item-callback")
  public CallBackAdditionalItem = new EventEmitter<Array<BillingAdditionalServiceItem_DTO>>();

  public SelectedAdditionalItem = new BillingAdditionalServiceItem_DTO();
  public AdditionalServiceItemWithAnaesthesia = new Array<BillingAdditionalServiceItem_DTO>();

  constructor(private coreService: CoreService, private msgBoxService: MessageboxService) {

  }

  ngOnInit(): void {
    this.coreService.FocusInputById('id_additional_serviceItem_selection', 100);
    if (this.BillingAdditionalServiceItems && this.BillingAdditionalServiceItems.length > 0 && this.BillingContext) {
      let filteredBillingAdditionalServiceItem = new Array<BillingAdditionalServiceItem_DTO>();
      if (this.BillingContext === ENUM_ServiceBillingContext.OpBilling) {
        filteredBillingAdditionalServiceItem = this.BillingAdditionalServiceItems.filter(a => a.IsOpServiceItem);
      } else {
        filteredBillingAdditionalServiceItem = this.BillingAdditionalServiceItems.filter(a => a.IsIpServiceItem);
      }
      this.BillingAdditionalServiceItems = filteredBillingAdditionalServiceItem;
    }
  }

  //* Krishna, 4thApril'23, Below method is triggered on the change of Additional Item Selection on the Popup
  OnAdditionalServiceItemChange($event): void {
    if ($event) {
      this.AdditionalServiceItemWithAnaesthesia = new Array<BillingAdditionalServiceItem_DTO>();
      const selectedAdditionalServiceItemId = $event.target.value;
      this.SelectedAdditionalItem = this.BillingAdditionalServiceItems.find(a => a.AdditionalServiceItemId === +selectedAdditionalServiceItemId);
      if (this.SelectedAdditionalItem) {
        this.AdditionalServiceItemWithAnaesthesia.push(this.SelectedAdditionalItem);
        if (this.BillingContext === ENUM_ServiceBillingContext.IpBilling && this.SelectedAdditionalItem.WithPreAnaesthesia) {
          const preAnaesthesiaServiceItem = this.BillingAdditionalServiceItems.find(a => a.IsPreAnaesthesia);
          if (preAnaesthesiaServiceItem && this.BillingContext === ENUM_ServiceBillingContext.IpBilling) {
            this.AdditionalServiceItemWithAnaesthesia.push(preAnaesthesiaServiceItem);
          }
        }
      } else {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Selected Additional Service Item is not valid`]);
      }

      this.coreService.FocusInputById('id_btn_assignAdditionalServiceItem', 200);
    }
  }

  AddAdditionalInvoiceItemAsDraft(): void {
    if (this.AdditionalServiceItemWithAnaesthesia && this.AdditionalServiceItemWithAnaesthesia.length > 0) {
      this.CallBackAdditionalItem.emit(this.AdditionalServiceItemWithAnaesthesia);
    }
  }

}
