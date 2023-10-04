import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'

export class MessageboxModel {
    public show: boolean = false;
    public message: string[] = [];
    public status: string = null;
    constructor() {

    }
}