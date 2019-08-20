import { Input, Component} from '@angular/core';
import { LoadingScreenService } from './danphe-loading-screen.services';

@Component({
    selector: "danphe-loader",
    templateUrl:'./danphe-loader.html' ,
    styleUrls: ['../../../../../themes/theme-default/loading.component.css']
})

export class LoaderComponent {

    @Input("loadingScreen")
    public showLoading: boolean = false;
   
    constructor(public loadingScreenService: LoadingScreenService) {                  
           
    }  
    
  }
  