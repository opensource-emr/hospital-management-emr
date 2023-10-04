import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { BillingService } from '../../../../billing/shared/billing.service';
import { CoreService } from '../../../../core/shared/core.service';
import { ENUM_ServiceBillingContext } from '../../../../shared/shared-enums';
import { SettingsBLService } from '../../../shared/settings.bl.service';
import { BillingScheme_DTO } from '../../shared/dto/billing-scheme.dto';


@Component({
  selector: "scheme-select",
  templateUrl: "./scheme-select.component.html"
})
export class SchemeSelectComponent {

  public membershipList: Array<BillingScheme_DTO> = new Array<BillingScheme_DTO>();
  public selectedCommunityName: string = "";

  public filteredMembershipList: Array<BillingScheme_DTO> = [];

  public distinctCommunityList: Array<string> = [];

  @Input("disabled")
  public dropdownDisabled: boolean = false;

  @Input("is-mandatory")
  public isMandatory: boolean = true;

  public isMembershipValid: boolean = true;

  @Input("show-community")
  public showCommunity: boolean = false;

  @Input("service-billing-context")
  public serviceBillingContext: string = '';

  @Input("current-visit-selected-price-category")
  public set currVisSelPriceCategory(val: number) {
    let data = val;
    if (data !== this.currentVisitSelectedPriceCategory) {
      this.currentVisitSelectedPriceCategory = data;
      //this.FilterMembershipListAsPerSelectedPriceCategory(this.currentVisitSelectedPriceCategory);
    }
  }
  currentVisitSelectedPriceCategory: number = 0;

  @Input('should-filter-membership-list')
  public ShouldFilterMembershipListAsPerSelectedPriceCategory: boolean = false;

  @Input("selected-id")
  public set selMembershipTypeId(val: any) {
    let flag = val;
    if (flag != this.selMembershipId) {
      this.selMembershipId = flag;
      this.MembershipTypeChange();
    }
  }
  public selMembershipId: number = 0;

  @Output("on-enter-key-pressed")
  public onEnterKeyPressed: EventEmitter<boolean> = new EventEmitter<boolean>();

  ///we can change the labels shown before dropdown for each parent component as per necessity.
  //@Input("labels-info")
  //public labelsInfo = { CommunityLabel: "Community", SchemeLabel: "Scheme" };

  public labelsInfo: any;
  public IsenterKeyPressed: boolean = false;

  public selSchemeObj: BillingScheme_DTO = null;

  @Output("on-membership-change")
  public onMembershipChange: EventEmitter<BillingScheme_DTO> = new EventEmitter<BillingScheme_DTO>();

  public ServiceContextSubscription = new Subscription();

  public tempServiceBillingContext: string = "";


  constructor(public settingsBLService: SettingsBLService,
    public coreService: CoreService, public changeDetector: ChangeDetectorRef, private billingService: BillingService) {
    let label = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "MembershipSchemeSettings").ParameterValue;
    this.labelsInfo = JSON.parse(label);
    this.InitializeSubscriptions()
  }

  public InitializeSubscriptions() {
    this.ServiceContextSubscription.add(this.billingService.ObserveServiceContextChanged.subscribe(res => {
      this.tempServiceBillingContext = res;
      this.LoadSchemes();
    }));
  }

  ngOnDestroy() {
    this.ServiceContextSubscription.unsubscribe();
  }
  LoadSchemes() {
    this.serviceBillingContext = this.tempServiceBillingContext ? this.tempServiceBillingContext : this.serviceBillingContext;
    if (!this.serviceBillingContext) {
      this.serviceBillingContext = ENUM_ServiceBillingContext.OpBilling;
    }
    this.LoadBillingSchemesList(this.serviceBillingContext);
  }

  public LoadBillingSchemesList(serviceContext: string) {
    //this OpBilling is hardcoded for now, we need to pass correct one.
    this.settingsBLService.GetBillingSchemesDtoList(serviceContext)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.membershipList = res.Results;
          //CommonFunctions.SortArrayOfObjects(this.membershipList, "CommunityName");
          //this sorts the membershipList by CommunityName.

          if (this.membershipList) {
            //format the display name so that discount percent is also seen. 
            this.membershipList.forEach(mem => {
              mem.MembershipDisplayName = mem.SchemeName;
            });
            //show only active membership list in the dropdown..
            //this.membershipList = this.membershipList.filter(a => a.IsActive == true);
            //this.FilterMembershipListAsPerSelectedPriceCategory(this.currentVisitSelectedPriceCategory);
          }

          //set community name etc on load..
          if (this.selMembershipId) {
            let selMembership: BillingScheme_DTO = this.membershipList.find(a => a.SchemeId == this.selMembershipId);
            if (selMembership) {
              this.selectedCommunityName = selMembership.CommunityName;
            }
          }
          else {
            //assign default selected values to the dropdown.
            //check if we can remove this hard-code value. suggestion: use IsDefault field in table and so on.
            let defaultMemb = this.membershipList.find(a => a.SchemeName.toLowerCase() == "general");
            if (defaultMemb) {
              this.selMembershipId = defaultMemb.SchemeId;
              this.selectedCommunityName = defaultMemb.CommunityName;
            }
          }
          if (this.showCommunity) {
            this.GetDistinctCommunityList();
          }
          else {
            this.filteredMembershipList = this.membershipList;
          }
          //needed below to emit the current selected value to parent component.
          this.MembershipTypeChange();
        }
        else {
          alert("Failed!" + res.ErrorMessage);
        }
      });

  }

  // //* Krishna, 12-DEC'22,This method is used to filter memberships as per the price Category selected in the current visit context only if ShouldFilterMembershipListAsPerSelectedPriceCategory is true.
  // FilterMembershipListAsPerSelectedPriceCategory(selectedPriceCategory: number): void {
  //   if(this.ShouldFilterMembershipListAsPerSelectedPriceCategory){
  //     if (this.membershipList && this.membershipList.length > 0) {
  //       const priceCategories = this.coreService.Masters.PriceCategories;
  //       const selectedPriceCategoryObj = priceCategories.find(p => p.PriceCategoryId === selectedPriceCategory);

  //       //* Step 1: Get membership vs PriceCategory mapping
  //       let membershipVsPriceCategoryMapping = []
  //       membershipVsPriceCategoryMapping = this.coreService.membershipTypeVsPriceCategoryMapping;

  //       //* Step 2: Get membership vs PriceCategory mapping for selected price category
  //       const membershipVsPriceCategoryMappingForSelectedPriceCategory = membershipVsPriceCategoryMapping.filter(a => a.PriceCategoryId === selectedPriceCategory);

  //       //* Step 3: Get Price Categories mapped with Memberships
  //       const priceCategoriesMappedWithMemberships = priceCategories.filter(el => {
  //         return membershipVsPriceCategoryMapping.find(element => {
  //            return element.PriceCategoryId === el.PriceCategoryId;
  //         });
  //      }); 

  //      //* Step 4: Set IsCoPayment for memberships vs PriceCategory
  //      membershipVsPriceCategoryMapping.forEach(a =>{
  //       a['IsCoPayment'] = priceCategoriesMappedWithMemberships.find(b => b.PriceCategoryId === a.PriceCategoryId).IsCoPayment;
  //      });

  //      //* Step 5: Filter memberships vs PriceCategory that has CoPayment = true.
  //      membershipVsPriceCategoryMapping = membershipVsPriceCategoryMapping.filter(a => a.IsCoPayment === true);

  //      //* Step 6: filter memberships that are not mapped with price categories and having CoPayment = false
  //      const filteredMemberships = this.membershipList.filter(a =>{
  //       return !membershipVsPriceCategoryMapping.find(b => {
  //         return (b.MembershipTypeId === a.MembershipTypeId);
  //       });
  //      });

  //      //* Step 7: Check if selected PriceCategory is CoPayment or not, if yes then add the membership associated with the respective PriceCategory into filteredMembership list
  //      if(selectedPriceCategoryObj && selectedPriceCategoryObj.IsCoPayment){
  //       const membershipForSelectedCoPaymentPriceCategory = this.membershipList.filter(a => {
  //         return membershipVsPriceCategoryMappingForSelectedPriceCategory.find(b =>{
  //           return a.MembershipTypeId === b.MembershipTypeId
  //         });
  //       });

  //       membershipForSelectedCoPaymentPriceCategory.forEach(a => {
  //         filteredMemberships.push(a);
  //       });

  //      }
  //      //* Step 8: finally assign filtered memberships to memberships list that is rendered.
  //       this.membershipList = filteredMemberships;
  //     }
  //   }
  // }

  GetDistinctCommunityList() {
    this.distinctCommunityList = [];
    var allCommunityList: Array<string> = [];

    allCommunityList = this.membershipList.map(a => {
      return a.CommunityName;
    });

    for (var i = 0; i < allCommunityList.length; i++) {
      if (this.distinctCommunityList.indexOf(allCommunityList[i]) < 0) {
        this.distinctCommunityList.push(allCommunityList[i]);
      }
    }

    //here initial load is true, so it won't emit the value this time.
    this.CommunityDropdownOnChange(true);

  }


  public CommunityDropdownOnChange(isInitialLoad: boolean) {
    this.filteredMembershipList = [];
    this.filteredMembershipList = this.membershipList.filter(membership => membership.CommunityName === this.selectedCommunityName);
    this.filteredMembershipList = this.filteredMembershipList.slice();
    //don't emit at the time of initial load. 
    if (!isInitialLoad) {
      //when community is changed, we've to emit null value.
      this.selMembershipId = null;

      //we're emitting null from here, so membershipvalid will be false whenever ismandatory is true. 
      if (this.isMandatory) {
        this.isMembershipValid = false;
      }

      this.onMembershipChange.emit(null);
    }
    this.MembershipTypeChange();
  }



  MembershipTypeChange() {
    if (this.selMembershipId && this.filteredMembershipList && this.filteredMembershipList.length > 0) {
      const selectedSchemeObj = this.filteredMembershipList.find(a => a.SchemeId === +this.selMembershipId);
      this.selMembershipId = selectedSchemeObj.SchemeId;
      //this.changeDetector.detectChanges();

    }
    if (this.filteredMembershipList.length == 1) {
      this.selMembershipId = this.filteredMembershipList[0].SchemeId;
    }
    let membershipToEmit: BillingScheme_DTO = this.membershipList.find(a => a.SchemeId === +this.selMembershipId);
    // if (!membershipToEmit) {
    //   membershipToEmit = this.membershipList.find(a => a.IsSystemDefault);
    // }
    if (this.isMandatory) {
      if (membershipToEmit == null || membershipToEmit == undefined) {
        this.isMembershipValid = false;
      }
      else {
        this.isMembershipValid = true;
      }
    }
    if (this.isMembershipValid) {
      let communityName = membershipToEmit.CommunityName;
      let obj = this.distinctCommunityList.find(a => a == communityName);
      this.selectedCommunityName = obj;

      //if ShowCommunity is true then filter by Community
      if (this.showCommunity) {
        this.filteredMembershipList = this.membershipList.filter(a => a.CommunityName == communityName);
      }

    }

    //sud:14Mar'23--Assign to Local Variable for Display purpose
    if (membershipToEmit) {
      this.selSchemeObj = membershipToEmit;
    }

    //we've to emit the changed membership type in all cases.
    this.onMembershipChange.emit(membershipToEmit);
  }

  public LoadPharmacySchemesList() {
    //this OpBilling is hardcoded for now, we need to pass correct one.
    this.settingsBLService.GetBillingSchemesDtoList(ENUM_ServiceBillingContext.OpPharmacy)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.membershipList = res.Results;
          //CommonFunctions.SortArrayOfObjects(this.membershipList, "CommunityName");
          //this sorts the membershipList by CommunityName.

          if (this.membershipList) {
            //format the display name so that discount percent is also seen. 
            this.membershipList.forEach(mem => {
              mem.MembershipDisplayName = mem.SchemeName;
            });
            //show only active membership list in the dropdown..
            //this.membershipList = this.membershipList.filter(a => a.IsActive == true);
            //this.FilterMembershipListAsPerSelectedPriceCategory(this.currentVisitSelectedPriceCategory);
          }

          //set community name etc on load..
          if (this.selMembershipId) {
            let selMembership: BillingScheme_DTO = this.membershipList.find(a => a.SchemeId == this.selMembershipId);
            if (selMembership) {
              this.selectedCommunityName = selMembership.CommunityName;
            }
          }
          else {
            //assign default selected values to the dropdown.
            //check if we can remove this hard-code value. suggestion: use IsDefault field in table and so on.
            let defaultMemb = this.membershipList.find(a => a.SchemeName.toLowerCase() == "general");
            if (defaultMemb) {
              this.selMembershipId = defaultMemb.SchemeId;
              this.selectedCommunityName = defaultMemb.CommunityName;
            }
          }
          if (this.showCommunity) {
            this.GetDistinctCommunityList();
          }
          else {
            this.filteredMembershipList = this.membershipList;
          }
          //needed below to emit the current selected value to parent component.
          this.MembershipTypeChange();
        }
        else {
          alert("Failed!" + res.ErrorMessage);
        }
      });

  }

}
