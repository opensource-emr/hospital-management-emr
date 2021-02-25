import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { PriceCategory } from "../../../settings-new/shared/price.category.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";

@Component({
  selector: "price-category-select",
  templateUrl: "./price-category-select.html"
})

export class SelectPriceCategoryComponent {

  @Output("on-category-change")
  onPriceCategoryChange: EventEmitter<object> = new EventEmitter<object>();

  @Input("selected-price-category")
  SelectedPriceCategory: string = null;//default should be Normal here.. 

  public allPriceCategories: Array<PriceCategory> = [];
  public priceCategory: string = null;
  public enabledPriceCategories: Array<PriceCategory> = []; //{ Normal: true, EHS: true, SAARCCitizen: true, Foreigner: true, GovtInsurance: true, InsForeigner: true };

  public defaultCategory: string = "Normal";

  constructor(public coreService: CoreService,public msgBoxServ: MessageboxService) {


  }

  ngOnInit() {
    //if SelectedPriceCategory is not among our existing list, then set it to "Normal"
  
  

    this.allPriceCategories = this.coreService.Masters.PriceCategories;
    this.enabledPriceCategories = this.allPriceCategories.filter(a => a.IsActive == true);

    //set default category searching from the available list.
    let defCategory = this.enabledPriceCategories.find(a => a.IsDefault == true);
    if (defCategory) {
      this.defaultCategory = defCategory.PriceCategoryName;
    }

    if (this.SelectedPriceCategory) {
      this.priceCategory = this.SelectedPriceCategory;
    }
    else {
      this.priceCategory = this.defaultCategory;
    }

    this.ShowPriceCategoryNotification(this.priceCategory);
  }



  OnPriceCategoryChange() {
    let selPriceCatObj = this.enabledPriceCategories.find(a => a.PriceCategoryName == this.priceCategory);

    //let priceCatColumn = this.priceCategoryBillingColumns[this.priceCategory];
    this.onPriceCategoryChange.emit({ categoryName: selPriceCatObj.PriceCategoryName, propertyName: selPriceCatObj.BillingColumnName });

    this.ShowPriceCategoryNotification(selPriceCatObj.PriceCategoryName);
  }

  ShowPriceCategoryNotification(priceCat:string) {
    if (priceCat.toLocaleLowerCase() != this.defaultCategory.toLowerCase()) {
      this.msgBoxServ.showMessage('Notice', ["Price category is changed to " + priceCat]);
    }
  }

}

