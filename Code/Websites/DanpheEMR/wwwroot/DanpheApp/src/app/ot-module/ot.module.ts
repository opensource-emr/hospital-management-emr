import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OtBookingAddComponent } from './ot-booking-list/ot-booking-add.component';
import { OtBookingListComponent } from './ot-booking-list/ot-booking-list.component';
import { OtMainComponent } from './ot-main.component';
import { OTRoutingModule } from './ot-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { OperationTheatreBLService } from './shared/ot.bl.service';
import { OperationTheatreDLService } from './shared/ot.dl.service';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({

    imports: [OTRoutingModule,
        CommonModule,
        SharedModule,
        SettingsSharedModule,
        DanpheAutoCompleteModule,
        ReactiveFormsModule,
        FormsModule
    ],
    declarations: [
        OtMainComponent,
        OtBookingListComponent,
        OtBookingAddComponent
    ],
    providers: [
        OperationTheatreBLService,
        OperationTheatreDLService
    ]

})
export class OperationTheatreModule{}