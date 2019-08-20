import { Injectable, Directive } from '@angular/core';
import { CoreDLService } from './core.dl.service';


@Injectable()
export class CoreBLService {

    constructor(public coreDLService: CoreDLService) {

    }

    public GetParametersList() {
        return this.coreDLService.GetParametersList()
            .map(res => res);
    }

    //default moduleName will be null.
    public GetLookups(moduleName: string = null) {
        return this.coreDLService.GetLookups(moduleName)
            .map(res => res);
    }

    public GetMasterEntities() {
        return this.coreDLService.GetAllMasterEntities()
            .map(res => res);
    }

    //start: Sud:25Dec'18--to load AppSettings 
    public GetAppSettings() {
        return this.coreDLService.GetAppSettings()
            .map(res => res);
    }
    //end: Sud:25Dec'18--to load AppSettings 

    public GetCounter() {
        return this.coreDLService.GetCounter()
            .map(res => res);
    }

}
