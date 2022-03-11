import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MappedGovernmentItems } from "../../shared/map-government-items.model";
import { GovernmentItems } from "../../shared/lab-government-items.model";
import { LabTest } from "../../shared/lab-test.model";
import { LabSettingsBLService } from "../shared/lab-settings.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LabTestComponent } from "../../shared/lab-component.model";
import { CoreService } from "../../../../app/core/shared/core.service";
import { Observable, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: "add-government-items",
  templateUrl: "add-government-items.html",
})
export class AddGovernmentItemsComponent {
  @Input() mapItems: any = new MappedGovernmentItems();
  @Input() showMapGovItemsPage: boolean = false;
  @Input() update: boolean = false;
  @Input("selectedItem")
  public selectedItem: MappedGovernmentItems;

  @Output("callback-Add") callBackData: EventEmitter<object> =
    new EventEmitter<object>();

  public allgovitems: Array<GovernmentItems> = new Array<GovernmentItems>();
  public labtestitems: Array<LabTest> = new Array<LabTest>();
  public labTestComponentItems: Array<LabTestComponent> =
    new Array<LabTestComponent>();
  public selectedTest: any;
  public selectedComponent: any;
  public selectedGovReportItem: any;

  public MappedComponent: MappedGovernmentItems = new MappedGovernmentItems();
  public loading: boolean = false;
  public disableSelectedGovReportItem:boolean = false;

  constructor(
    public labSettingBlServ: LabSettingsBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService
  ) {


  }

  ngOnInit() {
    var request: Observable<any>[] = [];
    request.push(this.labSettingBlServ.GetAllGovLabComponents().pipe(
      catchError((err) => {
        return of(err.error);
      }
      )
    ));
    request.push(this.labSettingBlServ.GetAllLabTests().pipe(
      catchError((err) => {
        return of(err.error);
      }
      )
    ));
    request.push(this.labSettingBlServ.GetAllLabTestComponents().pipe(
      catchError((err) => {
        return of(err.error);
      }
      )
    ));
    forkJoin(request).subscribe(
      result => {
        this.GetAllGovLabComponents(result[0]);
        this.GetLabTestItems(result[1]);
        this.GetLabTestComponentItems(result[2]);
        this.InitializeNgOnInIt();
      }
    );



  }

  InitializeNgOnInIt() {
    if (this.update) {
      this.disableSelectedGovReportItem = true;
      this.MappedComponent = Object.assign(
        new MappedGovernmentItems(),
        this.selectedItem
      );
      this.MappedComponent.IsResultCount = false;

      var govReportItem = this.allgovitems.find(
        (f) => f.ReportItemId == this.selectedItem.ReportItemId
      );
      this.selectedGovReportItem = govReportItem.DisplayName;

      var resTest = this.labtestitems.find(
        (f) => f.LabTestId == this.selectedItem.LabItemId
      );

      if (resTest) {
        this.selectedTest = resTest.LabTestName;
      } else {
        this.selectedTest = "";
      }

      if (this.MappedComponent.IsComponentBased) {
        var comp = this.labTestComponentItems.find(
          (f) => f['ComponentId'] == this.MappedComponent.ComponentId
        );
        if (comp) {
          this.selectedComponent = comp['DisplayName'];
        } else {
          this.selectedComponent = "";
        }
      }

    } else if (!this.update && this.selectedItem.ReportItemId == 0) {
      this.MappedComponent = new MappedGovernmentItems();
      this.MappedComponent.IsActive = true;
      this.MappedComponent.IsResultCount = false;
      this.update = false;
    } else {
      var govReportItem = this.allgovitems.find(
        (f) => f.ReportItemId == this.selectedItem.ReportItemId
      );
      this.MappedComponent = new MappedGovernmentItems();
      this.MappedComponent.ReportItemId = this.selectedItem.ReportItemId;
      this.selectedGovReportItem = govReportItem.TestName;
      this.MappedComponent.IsActive = true;
      this.MappedComponent.IsResultCount = false;
      this.update = false;
    }

    if (!this.MappedComponent.IsComponentBased) {
      this.MappedComponent.GovItemValidator.controls["ComponentId"].disable();
    }
  }

  GetAllGovLabComponents(res) {
    if (res.Status == "OK") {
      this.allgovitems = res.Results;
    } else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }
  }

  GetLabTestItems(res) {
    if (res.Status == "OK") {
      this.labtestitems = res.Results;
    } else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }
  }

  GetLabTestComponentItems(res) {
    if (res.Status == "OK") {
      this.labTestComponentItems = res.Results.filter(a => a.DisplayName != null);
    } else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }
  }

  public Close() {
    this.callBackData.emit({ close: true, MappedComponent: null });
  }

  OnComponentBasedChange() {
    if (this.MappedComponent.IsComponentBased) {
      this.MappedComponent.GovItemValidator.controls["ComponentId"].enable();
    } else {
      this.MappedComponent.GovItemValidator.controls["ComponentId"].disable();
      this.selectedComponent = '';
    }
  }

  MapNewItem() {
    this.ValidateAndMap();

    if (this.loading) {
      for (var i in this.MappedComponent.GovItemValidator.controls) {
        this.MappedComponent.GovItemValidator.controls[i].markAsDirty();
        this.MappedComponent.GovItemValidator.controls[
          i
        ].updateValueAndValidity();
      }

      if (this.MappedComponent.IsValidCheck(undefined, undefined)) {
        this.labSettingBlServ
          .MapGovLabComponent(this.MappedComponent)
          .subscribe((res) => {
            if ((res.Status = "OK")) {
              this.callBackData.emit({
                action: "add",
                mappedComponents: this.MappedComponent,
              });
              this.msgBoxServ.showMessage("success", [
                "Item mapped successfully.",
              ]);
              this.loading = false;
            } else {
              this.msgBoxServ.showMessage("error", ["Cannot Add Mapped Item"]);
              this.loading = false;
            }
          });
      } else {
        this.msgBoxServ.showMessage("error", ["Please Enter correct data"]);
        this.loading = false;
      }
    } else {
      this.loading = false;
    }
  }

  ValidateAndMap() {
    if (typeof (this.selectedComponent) == 'string') {
      let selComp = this.labTestComponentItems.find(c => c['DisplayName'] == this.selectedComponent);
      if (selComp) {
        this.MappedComponent.GovItemValidator.controls['ComponentId'].setValue(selComp['ComponentId']);
        this.MappedComponent.ComponentId = selComp['ComponentId'];
      } else {
        this.MappedComponent.GovItemValidator.controls['ComponentId'].setValue(null);
        this.MappedComponent.ComponentId = null;
      }
    }

    if (typeof (this.selectedTest) == 'string') {
      let test = this.labtestitems.find(c => c.LabTestName == this.selectedTest);
      if (test) {
        this.MappedComponent.GovItemValidator.controls['LabItemId'].setValue(test['LabTestId']);
        this.MappedComponent.LabItemId = test['LabTestId'];
      } else {
        this.MappedComponent.GovItemValidator.controls['LabItemId'].setValue(null);
        this.MappedComponent.LabItemId = null;
      }
    }

    if (typeof (this.selectedGovReportItem) == 'string') {
      let govReportItem = this.allgovitems.find(c => c.TestName == this.selectedGovReportItem);
      if (govReportItem) {
        this.MappedComponent.GovItemValidator.controls["ReportItemId"].setValue(govReportItem.ReportItemId);
        this.MappedComponent.ReportItemId = govReportItem.ReportItemId;
      } else {
        this.MappedComponent.GovItemValidator.controls["ReportItemId"].setValue(null);
        this.MappedComponent.ReportItemId = null;
      }
    }
    if (!this.MappedComponent.IsComponentBased) {
      this.MappedComponent.GovItemValidator.controls["ComponentId"].setValue(0);
      this.MappedComponent.ComponentId = 0;
    }
  }



  UpdateMappedItem() {
    this.ValidateAndMap();
    if (this.loading) {
      for (var i in this.MappedComponent.GovItemValidator.controls) {
        this.MappedComponent.GovItemValidator.controls[i].markAsDirty();
        this.MappedComponent.GovItemValidator.controls[
          i
        ].updateValueAndValidity();
      }
      if (this.MappedComponent.IsValidCheck(undefined, undefined)) {
        this.labSettingBlServ
          .UpdateMappedGovLabComponent(this.MappedComponent)
          .subscribe((res) => {
            if ((res.Status = "OK")) {
              this.callBackData.emit({
                action: "edit",
                mappedComponents: this.MappedComponent,
              });
              this.msgBoxServ.showMessage("success", [
                "Item Updated successfully.",
              ]);
              this.loading = false;
            } else {
              this.msgBoxServ.showMessage("error", [
                "Cannot Update Mapped Item",
              ]);
              this.loading = false;
            }
          });
      } else {
        this.loading = false;
        this.msgBoxServ.showMessage("error", ["Please Enter correct data"]);
      }
    }
  }

  myListFormatter(data: any): string {
    let html = data["LabTestName"];
    return html;
  }

  govReportItemsListFormatter(data: any): string {
    let html = "";
    if (data["DisplayName"] != data["TestName"]) {
      html = data["TestName"] + " (" + data["GroupName"] + " )";
    } else {
      html = data["DisplayName"] + " (" + data["GroupName"] + " )";
    }
    return html;
  }

  componentListFormatter(data: any): string {
    let html = data["DisplayName"];
    return html;
  }

  LabTestOnChange() {
    if (this.selectedTest) {
      this.MappedComponent.LabItemId = this.selectedTest.LabTestId;
      this.MappedComponent.GovItemValidator.controls['LabItemId'].setValue(this.selectedTest.LabTestId);
    }
  }

  LabComponentOnChange() {
    if (this.selectedComponent) {
      this.MappedComponent.ComponentId = this.selectedComponent.ComponentId;
      this.MappedComponent.GovItemValidator.controls['ComponentId'].setValue(this.selectedComponent.ComponentId);
    }
  }

  GoveReportItemOnChange() {
    if (this.selectedGovReportItem) {
      this.MappedComponent.ReportItemId = this.selectedGovReportItem.ReportItemId;
      this.MappedComponent.GovItemValidator.controls['ReportItemId'].setValue(this.selectedGovReportItem.ReportItemId);
    }
  }


}
