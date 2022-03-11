import { Component } from "@angular/core";
import { PatientService } from '../../shared/patient.service';
import { IRouteGuard } from '../../../shared/route-guard.interface';
import { KinEmergencyContact } from "../../shared/kin-emergency-contact.model";
import { Patient } from "../../shared/patient.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
 

@Component({
  templateUrl: "./kin-emergency-contact.html"
})
export class KinEmergencyContactComponent implements IRouteGuard {
    // binding logic
    public editbutton: boolean = false;
    public currentKinEmergencyContact: KinEmergencyContact = new KinEmergencyContact();
    public kinEmergencyContacts: Array<KinEmergencyContact> = new Array<KinEmergencyContact>();
    public currentPatient: Patient = null;

    constructor(_serv: PatientService, public msgBoxServ: MessageboxService) {
        this.currentPatient = _serv.getGlobal();
        this.GoToNextInput("InputId");
        this.kinEmergencyContacts = this.currentPatient.KinEmergencyContacts;
    }

    public Edit(selectedKinEmergencyContact: KinEmergencyContact) {
        this.editbutton = true;
        this.currentKinEmergencyContact = Object.assign(this.currentKinEmergencyContact, selectedKinEmergencyContact);

    }


    GoToNextInput(id: string) {
        window.setTimeout(function () {
          let itmNameBox = document.getElementById(id);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
      }

    public UpdateKin() {
        for (var i in this.currentKinEmergencyContact.KinValidator.controls) {
            this.currentKinEmergencyContact.KinValidator.controls[i].markAsDirty();
            this.currentKinEmergencyContact.KinValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentKinEmergencyContact.IsValidCheck(undefined, undefined) == true) {
            // update the kinEmergencyContact locally
            for (let kinEmergencyContact of this.kinEmergencyContacts) {
                if (kinEmergencyContact.KinContactType == this.currentKinEmergencyContact.KinContactType) {
                    kinEmergencyContact.KinFirstName = this.currentKinEmergencyContact.KinFirstName;
                    kinEmergencyContact.KinLastName = this.currentKinEmergencyContact.KinLastName;
                    kinEmergencyContact.KinPhoneNumber = this.currentKinEmergencyContact.KinPhoneNumber;
                    kinEmergencyContact.KinComment = this.currentKinEmergencyContact.KinComment;

                    this.currentKinEmergencyContact = new KinEmergencyContact();
                    this.editbutton = false;
                }
            }
        }
    }

    public AddKIN(kin: KinEmergencyContact) {

        // for loop is used to show validation message ..if required is field is not filled
        for (var i in this.currentKinEmergencyContact.KinValidator.controls) {
            this.currentKinEmergencyContact.KinValidator.controls[i].markAsDirty();
            this.currentKinEmergencyContact.KinValidator.controls[i].updateValueAndValidity();
        }
        //if IsValid is true ...then only add in the grid
        if (this.currentKinEmergencyContact.IsValidCheck(undefined, undefined) == true) {
            //this condition take care that duplicate kinEmergencyContacts type is not add in table/grid
            if (this.kinEmergencyContacts != null && this.kinEmergencyContacts.length != 0) {

                for (var a = 0; a < this.kinEmergencyContacts.length; a++) {
                    //if type both(kin and EmergencyContacts) already added then it will not all us to add any KinContactType
                    //because both means kin and Emergency..and they are added in one go using both
                    if (this.kinEmergencyContacts[a].KinContactType == "KinAndEmergencyContact") {
                        this.msgBoxServ.showMessage("error", [this.currentKinEmergencyContact.KinContactType + " is already added using Both"]);
                        //alert(this.currentKinEmergencyContact.KinContactType + " is already added using Both");
                        return;
                    }
                    if (this.kinEmergencyContacts[a].KinContactType == this.currentKinEmergencyContact.KinContactType) {
                        this.msgBoxServ.showMessage("error", [this.currentKinEmergencyContact.KinContactType + " is already added"]);
                        //alert(this.currentKinEmergencyContact.KinContactType + " is already added");
                        return;
                    }
                }
                this.kinEmergencyContacts.push(this.currentKinEmergencyContact);
                this.currentKinEmergencyContact = new KinEmergencyContact();

            }
            else {
                this.kinEmergencyContacts.push(this.currentKinEmergencyContact);
                this.currentKinEmergencyContact = new KinEmergencyContact();
            }
        }
    }

    CanRouteLeave() {

        // if the IsValid is false  then..it will show the validation message to the end user using the for loop..
        if (this.currentKinEmergencyContact.IsValidCheck(undefined, undefined) == false) {

            // for loop is used to show validation message 
            for (var i in this.currentKinEmergencyContact.KinValidator.controls) {
                this.currentKinEmergencyContact.KinValidator.controls[i].markAsDirty();
                this.currentKinEmergencyContact.KinValidator.controls[i].updateValueAndValidity();
            }
        }
        else {
            return true;
        }


    }

}
