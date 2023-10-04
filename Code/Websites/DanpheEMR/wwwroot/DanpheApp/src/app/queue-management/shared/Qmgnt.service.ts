import { Injectable } from "@angular/core";
import { CoreService } from "../../core/shared/core.service";

@Injectable()
export class QueueManagementService{
    
    constructor(public coreService: CoreService){

    }

}