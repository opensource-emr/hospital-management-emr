import { Injectable, Directive } from '@angular/core';
import * as _ from 'lodash';
import { CoreService } from '../../core/shared/core.service';

@Injectable()
export class EmergencyService {
    public casesLookUpDetail: any;
    public bittenBodyPartList : any;
    public snakeList: any;
    public firstAidList: any;

    constructor(public coreService: CoreService) {

    }

    GetAllCasesLookUpDetailData() {
        this.coreService.GetAllLookUpDetails(1).subscribe(res => {
            if (res.Status == "OK") {
                this.casesLookUpDetail = res.Results;
            }
        });
    }

    GetAllBittenBodyPartList(){
        this.coreService.GetAllLookUpDetails(2).subscribe(res => {
            if(res.Status == "OK"){
                this.bittenBodyPartList = res.Results;
            }
        });
    }

    GetAllSnakeList(){
        this.coreService.GetAllLookUpDetails(3).subscribe(res => {
            if(res.Status == "OK"){
                this.snakeList = res.Results;
            }
        })
    }

    GetAllFirstAidList(){
        this.coreService.GetAllLookUpDetails(4).subscribe(res => {
            if(res.Status == "OK"){
                this.firstAidList = res.Results;
            }
        })
    }
}

