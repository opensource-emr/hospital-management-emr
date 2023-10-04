import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { SharedModule } from '../shared/shared.module';
import { EchsStickerComponent } from './echs-sticker/echs-sticker.component';
import { PatientStickerComponent } from './patient-sticker/patient-sticker.component';

@NgModule({
    declarations:[PatientStickerComponent, EchsStickerComponent],
    imports:[CommonModule,
             FormsModule,
             ReactiveFormsModule,
             HttpClientModule,
             SharedModule,
             SettingsSharedModule],
    exports:[PatientStickerComponent, EchsStickerComponent]
})
export class StickerSharedModule{

}