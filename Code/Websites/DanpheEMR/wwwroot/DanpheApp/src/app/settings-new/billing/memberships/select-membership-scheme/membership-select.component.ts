import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Membership } from '../../../shared/membership.model';
import { SettingsBLService } from '../../../shared/settings.bl.service';
import { CommonFunctions } from "../../../../shared/common.functions";
import { CoreService } from '../../../../core/shared/core.service';



@Component({
  selector: "membership-select",
  templateUrl: "./membership-select.html"
})
export class MembershipSelectComponent {

  public membershipList: Array<Membership> = new Array<Membership>();
  public selectedCommunityName: string = "";

  public filteredMembershipList: Array<Membership> = [];

  public distinctCommunityList: Array<string> = [];

  @Input("disabled")
  public dropdownDisabled: boolean = false;

  @Input("is-mandatory")
  public isMandatory: boolean = true;

  public isMembershipValid: boolean = true;

  @Input("show-community")
  public showCommunity: boolean = false;

  @Input("selected-id")
  public selMembershipId: number = null;

  @Output("on-enter-key-pressed")
  public onEnterKeyPressed: EventEmitter<boolean> = new EventEmitter<boolean>();

  ///we can change the labels shown before dropdown for each parent component as per necessity.
  //@Input("labels-info")
  //public labelsInfo = { CommunityLabel: "Community", SchemeLabel: "Scheme" };

  public labelsInfo: any;
  public IsenterKeyPressed: boolean = false;

  @Output("on-membership-change")
  public onMembershipChange: EventEmitter<Membership> = new EventEmitter<Membership>();


  constructor(public settingsBLService: SettingsBLService,
    public coreService: CoreService) {
    let label = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "MembershipSchemeSettings").ParameterValue;
    this.labelsInfo = JSON.parse(label);
  }


  ngOnInit() {
    //console.log("from membership-select- NgOnInit..");
    //console.log(this.selMembershipId);
    this.LoadMembershipList();
  }

  public LoadMembershipList() {
    this.settingsBLService.GetMembershipType()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.membershipList = res.Results;
          //CommonFunctions.SortArrayOfObjects(this.membershipList, "CommunityName");
          //this sorts the membershipList by CommunityName.

          if (this.membershipList) {
            //format the display name so that discount percent is also seen. 
            this.membershipList.forEach(mem => {
              mem.MembershipDisplayName = mem.MembershipTypeName + " (" + mem.DiscountPercent + "%)";
            });
            //show only active membership list in the dropdown..
            this.membershipList = this.membershipList.filter(a => a.IsActive == true);
          }

          //set community name etc on load..
          if (this.selMembershipId) {
            let selMembership: Membership = this.membershipList.find(a => a.MembershipTypeId == this.selMembershipId);
            if (selMembership) {
              this.selectedCommunityName = selMembership.CommunityName;
            }
          }
          else {
            //assign default selected values to the dropdown.
            //check if we can remove this hard-code value. suggestion: use IsDefault field in table and so on.
            let defaultMemb = this.membershipList.find(a => a.MembershipTypeName.toLowerCase() == "general");
            if (defaultMemb) {
              this.selMembershipId = defaultMemb.MembershipTypeId;
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
    if (this.filteredMembershipList.length == 1) {
      this.selMembershipId = this.filteredMembershipList[0].MembershipTypeId;
    }
    let membershipToEmit: Membership = this.membershipList.find(a => a.MembershipTypeId == this.selMembershipId);
    if (this.isMandatory) {
      if (membershipToEmit == null || membershipToEmit == undefined) {
        this.isMembershipValid = false;
      }
      else {
        this.isMembershipValid = true;
      }
    }
    //we've to emit the changed membership type in all cases.
    this.onMembershipChange.emit(membershipToEmit);
  }
  
}
