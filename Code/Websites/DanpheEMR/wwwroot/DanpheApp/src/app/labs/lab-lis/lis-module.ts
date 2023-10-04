import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LabSettingsBLService } from '../lab-settings/shared/lab-settings.bl.service';
import { LabSettingsDLService } from '../lab-settings/shared/lab-settings.dl.service';
import { SharedModule } from '../../shared/shared.module';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { LISMainComponent } from './lis-main.component';
import { LISRoutingModule } from './lis-routing-module';
import { LISMappingComponent } from './lis-mapping/lis-mapping.component';
import { LabLISBLService } from './shared/lis.bl.service';
import { LabLISDLService } from './shared/lis.dl.service';
import { LISMappingAddComponent } from './lis-mapping/lis-mapping-add.component';
import { LISMachineResultComponent } from './lis-machine-result/lis-machine-result.component';

@NgModule({
    providers: [LabSettingsBLService, LabSettingsDLService, LabLISBLService, LabLISDLService],
    imports: [LISRoutingModule, SharedModule, ReactiveFormsModule, FormsModule, CommonModule, DanpheAutoCompleteModule
    ],
    declarations: [LISMainComponent, LISMappingComponent, LISMappingAddComponent, LISMachineResultComponent],
    bootstrap: []
})

export class LISModule {

}
