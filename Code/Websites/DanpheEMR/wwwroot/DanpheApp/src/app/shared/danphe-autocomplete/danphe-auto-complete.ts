import { Injectable, Optional } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";

/**
 * provides auto-complete related utility functions
 */
@Injectable()
export class DanpheAutoComplete {

  public source: string;
  public pathToData: string;
  public listFormatter: (arg: any) => string;

  constructor(@Optional() public http: HttpClient) {
    // ...
  }

  filter(list: any[], keyword: string, matchFormatted: boolean, propertyNameCsvToMatch: string) {
    var data = list.filter(
      el => {

        let objStr = "";
        //sud:23'May'21--modified to accomodate propertyname matching case.
        //if both matchformatted is true and propertyname to match has some value, then split the csv and match with values(concatenated) of property names .
        //else if only matchFormatted is provided, then match with the formatted value of given element.
        //else do general match with JSON-Stringified-Object.
        if (matchFormatted && propertyNameCsvToMatch) {
          let propArr = propertyNameCsvToMatch.split(",");
          //we can assume that correct propertynames are provided from the page which uses this.
          //to exclude unwanted values from filtering.
          for (var i = 0; i < propArr.length; i++) {
            objStr += propArr[i] ? (el[propArr[i]] ? el[propArr[i]].toLowerCase() : "") : "";
          }
        }
        else if (matchFormatted) {
          objStr = this.getFormattedListItem(el).toLowerCase();
        }
        else {
          objStr = JSON.stringify(el).toLowerCase();
        }

        //let objStr = matchFormatted ? this.getFormattedListItem(el).toLowerCase() : ;
        keyword = keyword.toLowerCase();
        //console.log(objStr, keyword, objStr.indexOf(keyword) !== -1);
        return objStr.indexOf(keyword) !== -1;
      }
    )
    return data;
    //sort((a: string, b: string) => {

    //        if ((a == keyword) || (a.startsWith(keyword))) {
    //            return -1;
    //        }
    //          if (b.endsWith(keyword)) {
    //            return 1;
    //          }
    //          var regmiddle = new RegExp(".*" + keyword + ".*");
    //          var ismiddlea = regmiddle.test(a);
    //          var ismiddleb = regmiddle.test(b);
    //          if (ismiddlea && !ismiddleb) {
    //              return -1;
    //          }
    //          if (!ismiddlea && ismiddleb) {
    //              return 1;
    //          }
    //          if (ismiddlea && ismiddleb) {
    //              return 0;
    //          }         

    //        return 0; 

    //    });
  }

  getFormattedListItem(data: any) {
    let formatted;
    let formatter = this.listFormatter || '(id) value';
    if (typeof formatter === 'function') {
      formatted = formatter.apply(this, [data]);
    } else if (typeof data !== 'object') {
      formatted = data;
    } else if (typeof formatter === 'string') {
      formatted = formatter;
      let matches = formatter.match(/[a-zA-Z0-9_\$]+/g);
      if (matches && typeof data !== 'string') {
        matches.forEach(key => {
          formatted = formatted.replace(key, data[key]);
        });
      }
    }
    return formatted;
  }

  /**
   * return remote data from the given source and options, and data path
   */
  getRemoteData(keyword: string): Observable<Response> {
    if (typeof this.source !== 'string') {
      throw "Invalid type of source, must be a string. e.g. http://www.google.com?q=:my_keyword";
    } else if (!this.http) {
      throw "HttpClient is required.";
    }

    let matches = this.source.match(/:[a-zA-Z_]+/);
    if (matches === null) {
      throw "Replacement word is missing.";
    }

    let replacementWord = matches[0];
    let url = this.source.replace(replacementWord, keyword);

    return this.http.get<any>(url)
      .map(resp => resp)
      .map(resp => {

        //let list = resp.data || resp;//this is the original one,
        let list = resp.Results || resp; //sud:23Jul'19--changed since our response format is like this.

        if (this.pathToData) {
          let paths = this.pathToData.split(".");
          paths.forEach(prop => list = list[prop]);
        }

        return list;
      });
  };
}

