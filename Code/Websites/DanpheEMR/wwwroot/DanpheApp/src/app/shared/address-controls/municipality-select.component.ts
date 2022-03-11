import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CoreService } from "../../core/shared/core.service";
import { Patient } from "../../patients/shared/patient.model";
import { Municipality } from "./municipality-model";

@Component({
  selector: 'municipality-select',
  templateUrl: 'municipality-select.html'
})

export class MunicipalitySelectComponent {

  @Input('municipalityId')
  public municipalityId: number = 0;
  public subDivisionId: number;
  public municipalityList: Array<Municipality> = new Array<Municipality>();
  public isInitailLoad : boolean = true;
  @Input('subDivisionId')
  public set setValue(val: number) {
    if(val){
      this.subDivisionId = val;
      let result = this.coreService.GetMunicipalityByCountryAndSubDivisionId(this.subDivisionId);
      if(result) {
        this.municipalityList = result.Municipalities;
      }
    }
  };

  @Output() valueChange: EventEmitter<Object> = new EventEmitter<Object>();

  public selectedMunicipality: Municipality = new Municipality();
  public bindedMunicipality: any;
  constructor(public coreService: CoreService) {
  }

  ngOnInit() {
    if (this.municipalityId && this.municipalityList.length > 0) {
      this.selectedMunicipality = this.municipalityList.find(m => m.MunicipalityId == this.municipalityId);
      this.bindedMunicipality = this.selectedMunicipality.MunicipalityName;
      this.AssignSelectedMunicipality();
    }
  }

  SetFocusById(IdToBeFocused: string) {
    this.coreService.FocusInputById(IdToBeFocused);
  }

  municipalityListFormatter(data: any): string {
    let html = data["MunicipalityName"];
    return html;
  }

  AssignSelectedMunicipality() {
    if(this.bindedMunicipality == null || this.bindedMunicipality == ''){
      this.municipalityId = null;
      this.valueChange.emit({data : this.municipalityId});
      this.isInitailLoad = true;
      return 0;
    }
    if (typeof this.bindedMunicipality == 'string') {
      let municipality = this.municipalityList.find(a => a.MunicipalityName == this.bindedMunicipality);
      if (municipality) {
        this.municipalityId = municipality.MunicipalityId;
        this.valueChange.emit({ data: this.municipalityId });
      } else {
        this.municipalityId = 0;
        this.valueChange.emit({ data: this.municipalityId });
      }
    } else if (typeof this.bindedMunicipality == 'object') {
      if (this.bindedMunicipality && this.bindedMunicipality.MunicipalityId) {
        this.municipalityId = this.bindedMunicipality.MunicipalityId;
        this.valueChange.emit({ data: this.municipalityId });
      }
      else{
        this.municipalityId = 0;
        this.valueChange.emit({ data: this.municipalityId });
      }
    }
    this.isInitailLoad = false;
  }
}