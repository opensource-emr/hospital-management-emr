import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { LabTestResultService } from "./lab.service";
import { LabsBLService } from "./labs.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { SecurityService } from "../../security/shared/security.service";
import { CoreService } from "../../core/shared/core.service";
@Component({
  selector: 'lab-test-change',
  templateUrl: './lab-test-change.html',
  styles: ['.change-tst-description{margin-top: 7px;}']
})

export class LabTestChangeComponent {
  @Input() selectedLabTest: any;
  @Input() showChangeTest: boolean = false;
  @Input() requisitionId: number = null;
  @Output("callBack") sendDataBack: EventEmitter<object> = new EventEmitter<object>();
  public changedTest: any;
  public labBillItems: Array<any>;
  public loading: boolean = true;
  public noMatchingItem: boolean = true;
  //public CurrencyType: string = null;

  constructor(public labBLService: LabsBLService, public coreService: CoreService,
    public labresultService: LabTestResultService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService) {
    //this.CurrencyType = this.coreService.currencyUnit;
  }

  ngOnInit() {
    this.LoadAllLabTests();
  }

  public LoadAllLabTests() {
    if (this.selectedLabTest) {
      this.labBillItems = this.labresultService.labBillItems.filter(val => {
        if ((val.Price == this.selectedLabTest.Price) && (val.BillItemPriceId != this.selectedLabTest.BillItemPriceId)) {
          this.noMatchingItem = false;
          return true;
        }
      });

    }
  }

  AssignChangedTest() {
    if (this.changedTest) {
      if ((typeof (this.changedTest) == 'object') && this.changedTest.ItemId) {
        this.loading = false;
      }
      //else if ((typeof (this.changedTest) == 'string')) {
      //  this.changedTest = this.changedTest.trim();
      //  if ((this.changedTest.length > 0)) {
      //    this.loading = true;
      //  }
      //}
      else {
        this.loading = true;
      }
    } else {
      this.loading = true;
    }
  }

  ChangeLabTest() {
    if (this.loading) {
      if (this.changedTest && this.changedTest.ItemId && this.requisitionId) {
        console.log(this.changedTest);
        this.labBLService.ChangeLabTestOfSamePrice(this.requisitionId, this.changedTest).
          subscribe(res => {
            if (res.Status == "OK") {
              this.sendDataBack.emit({ NewLabTest: this.changedTest, labtest: res.Results });
              this.msgBoxServ.showMessage("success", ["LabTest is changed !!"]);
              this.showChangeTest = false;
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Failed to Change the Lab Test"]);
              console.log(res.ErrorMessage);
              this.sendDataBack.emit({ NewLabTest: null, labtest: null });
              this.showChangeTest = false;
            }
          });
      } else {
        this.loading = false;
      }

    }
  }

  Cancel() {
    this.sendDataBack.emit({ NewLabTest: null, labtest: null });
    this.showChangeTest = false;
  }


  ItemsListFormatter(data: any): string {
    var labNum = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"];
    let html: string = "<strong>" + labNum + "</strong>" + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
    html += "(<i>" + data["ServiceDepartmentName"] + "</i>)";
    return html;
  }



}
