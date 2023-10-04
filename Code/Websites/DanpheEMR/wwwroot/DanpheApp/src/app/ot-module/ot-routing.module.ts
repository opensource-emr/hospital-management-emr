import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OtBookingAddComponent } from './ot-booking-list/ot-booking-add.component';
import { OtBookingListComponent } from './ot-booking-list/ot-booking-list.component';
import { OtMainComponent } from './ot-main.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: OtMainComponent,
                children: [
                    { path: '', redirectTo: 'OtBookingList', pathMatch: 'full' },
                    { path: 'OtBookingList', component:OtBookingListComponent },
                    { path: 'AddNewOtBooking', component: OtBookingAddComponent},
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class OTRoutingModule{}