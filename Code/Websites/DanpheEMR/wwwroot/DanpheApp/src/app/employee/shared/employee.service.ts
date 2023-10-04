import { Injectable, Directive } from '@angular/core';
import { CoreService } from "../../core/shared/core.service";
@Injectable()
export class EmployeeService {

    public _profilePicSrcPath: string = "";
    public _imageName

    // <----------Relationship--------->
    get ProfilePicSrcPath(): string {
        return this._profilePicSrcPath;
    }
    set ProfilePicSrcPath(path: string) {
        this._profilePicSrcPath = path;
    }


    get ImageName(): string {
        return this._imageName;
    }
    set ImageName(imagename: string) {
        this._imageName = imagename;
    }

}