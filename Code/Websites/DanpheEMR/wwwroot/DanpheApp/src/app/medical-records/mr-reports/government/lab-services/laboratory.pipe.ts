import { PipeTransform, Pipe } from "@angular/core";

@Pipe({ name: 'labKeys',  pure: false })
export class LabKeysPipe implements PipeTransform {
    transform(value: any, args?: any[]): any[] {
      
      if(value) {
        // create instance vars to store keys and final output
        let keyArr: any[] = Object.keys(value),
            dataArr = [];

        // loop through the object,
        // pushing values to the return array
        keyArr.forEach((key: any) => {
          if(!value[key][1].ReportItemId){
            var nested = Object.entries(value[key][1]);
            nested.forEach((itm: any) => {
              dataArr.push(itm[1]);
            });
          }else{
            dataArr.push(value[key][1]);
          }
        });
        // return the resulting array
        return dataArr;
      }
    }
}
