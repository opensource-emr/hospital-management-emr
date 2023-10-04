import { Injectable } from '@angular/core';
import { StickerDLService } from './registration-sticker.dl.service';

@Injectable({
    providedIn: 'root'
})
export class StickerBLService {

    constructor(public stickerDLService: StickerDLService) {
    }
    public GetRegistrationStickerSettingsAndData(PatientVisitId: number) {
        return this.stickerDLService.GetRegistrationStickerSettingsAndData(PatientVisitId)
            .map(res => { return res });
    }
}