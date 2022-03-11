import { Component, Input, Output, EventEmitter } from "@angular/core";
import { LabsBLService } from "../labs.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { SecurityService } from "../../../security/shared/security.service";
import { CoreService } from "../../../core/shared/core.service";
import { LabSettingsBLService } from "../../lab-settings/shared/lab-settings.bl.service";
import { LabCategoryModel } from "../lab-category.model";

@Component({
  selector: "lab-category-select",
  templateUrl: "./lab-select-category.html",
})
export class LabCategorySelectComponent {
  public allCategories: Array<LabCategoryModel> = new Array<LabCategoryModel>();
  public allPermissions: any = [];
  public selectedData: any = [];

  @Output("selected-category-list")
  public items: EventEmitter<any[]> = new EventEmitter<any[]>();

  @Input("selectedCategory")
  public selectedCategories: Array<any>;

  public localStorageItemName: string = 'selectedLabCategory';

  constructor(
    public labBLService: LabsBLService,
    public msgBoxServ: MessageboxService,
    public http: HttpClient,
    public securityService: SecurityService
  ) {
    this.GetAllLabCategory();
  }

  //move these to bl/dl services if required.
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };


  public GetAllLabCategory() {
    this.labBLService.GetAllLabCategory()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allCategories = res.Results;
          this.allCategories.forEach(c => {
            if (this.securityService.HasPermission('lab-category-' + c.TestCategoryName)) {
              this.allPermissions.push({ TestCategoryName: c.TestCategoryName, TestCategoryId: c.TestCategoryId });
            }
          });

          if (this.allPermissions && (this.allPermissions.length >= 1)) {
            let catInLocalStorage = [];
            if (localStorage.getItem(this.localStorageItemName)) {
              catInLocalStorage = JSON.parse(localStorage.getItem(this.localStorageItemName));
              this.allPermissions.forEach(p => {
                if (catInLocalStorage.find(l => l.TestCategoryId == p.TestCategoryId)) {
                  let val = Object.assign({}, p);
                  this.selectedData.push(val);
                }
              });
            }
            else {
              this.allPermissions.forEach(p => {
                let val = Object.assign({}, p);
                this.selectedData.push(val);
              });
            }

            localStorage.removeItem(this.localStorageItemName);
            localStorage.setItem(this.localStorageItemName, JSON.stringify(this.selectedData));
            this.items.emit(this.selectedData);
          }
        }
        else {
          this.msgBoxServ.showMessage('failed', ['Cannot Load the Lab Category']);
          console.log(res.ErrorMessage);
        }
      })
  }

  CategoryOnChange($event) {
    localStorage.removeItem(this.localStorageItemName);
    localStorage.setItem(this.localStorageItemName, JSON.stringify($event));

    if ($event)
      this.items.emit($event);
  }

}
