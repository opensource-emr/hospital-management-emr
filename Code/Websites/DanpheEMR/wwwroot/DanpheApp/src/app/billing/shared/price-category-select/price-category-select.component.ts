import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreBLService } from "../../../core/shared/core.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { PriceCategory } from "../../../settings-new/shared/price.category.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses } from "../../../shared/shared-enums";

@Component({
  selector: "price-category-select",
  templateUrl: "./price-category-select.html"
})

export class SelectPriceCategoryComponent {

  @Output("on-category-change")
  priceCategoryChangeEmitter: EventEmitter<object> = new EventEmitter<object>();


  @Input("selected-priceCategoryId")
  priceCategoryIdFromExternalInput: number = 0;

  public selectedPriceCategoryId: number = 0;


  @Input("disable")
  dropdownDisabled: boolean = false;

  public allPriceCategories: Array<PriceCategory> = [];
  public enabledPriceCategories: Array<PriceCategory> = []; //{ Normal: true, EHS: true, SAARCCitizen: true, Foreigner: true, GovtInsurance: true, InsForeigner: true };


  constructor(public coreService: CoreService, public msgBoxServ: MessageboxService, public coreBlService: CoreBLService) {
    this.allPriceCategories = this.coreService.Masters.PriceCategories;
  }

  ngOnChanges() {
    //sud:14Mar'23-Moved the code to SetPriceCategoriesForCurrentScheme Function
    if (this.priceCategoryIdFromExternalInput != this.selectedPriceCategoryId) {
      this.selectedPriceCategoryId = this.priceCategoryIdFromExternalInput;
      this.OnPriceCategoryChange();
    }
  }


  ngOnInit() {
    if (!this.allPriceCategories.length) {
      this.LoadPriceCategoriesFromServer();
    }
    else {
      this.enabledPriceCategories = this.allPriceCategories.filter(pc => pc.IsActive == true);
      this.InitializePriceCategoryId();
    }
  }



  InitializePriceCategoryId() {
    if (this.priceCategoryIdFromExternalInput) {
      this.selectedPriceCategoryId = this.priceCategoryIdFromExternalInput;
    }
    else {
      let defCategoryObj = this.enabledPriceCategories.find(a => a.IsDefault == true);
      if (defCategoryObj) {
        this.selectedPriceCategoryId = defCategoryObj.PriceCategoryId;
      }
      else {
        this.selectedPriceCategoryId = 1;//Sud:16Mar'23--this is for Normal -- HardCoded for now, need to review it later..
      }
    }
    this.OnPriceCategoryChange();
  }


  OnPriceCategoryChange() {
    if (this.enabledPriceCategories && this.enabledPriceCategories.length) {
      let selPriceCatObj = this.enabledPriceCategories.find(a => a.PriceCategoryId == this.selectedPriceCategoryId);
      this.priceCategoryChangeEmitter.emit(selPriceCatObj);//later emit Only the limited Properties from here As DTO.
    }
  }



  public LoadPriceCategoriesFromServer(): void {
    this.coreBlService.GetPriceCategories().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status == ENUM_DanpheHTTPResponses.OK) {
        this.allPriceCategories = res.Results;
        this.enabledPriceCategories = this.allPriceCategories.filter(pc => pc.IsActive === true);
        this.InitializePriceCategoryId();
      }
    });
  }



  // //Sud/Krishna:16March-23--We need to work on this function later on. 
  // //For now We'll validate from the parent components.
  // ResetPriceCategoryArray() {
  //   this.enabledPriceCategories = this.allPriceCategories.filter(pc => pc.IsActive === true);
  //   //Load PriceCategories from External Source if any data was provided from There.
  //   if (this.schemePriceCatMaps && this.schemePriceCatMaps.length > 0) {
  //     const arrayOfPriceCategoryIds = this.schemePriceCatMaps.map(a => a.PriceCategoryId);
  //     if (arrayOfPriceCategoryIds.length > 0) {
  //       this.enabledPriceCategories = this.enabledPriceCategories.filter(ele => {
  //         return arrayOfPriceCategoryIds.includes(ele.PriceCategoryId)
  //       });
  //     }
  //   }
  //   this.InitializePriceCategoryId();
  // }


}

