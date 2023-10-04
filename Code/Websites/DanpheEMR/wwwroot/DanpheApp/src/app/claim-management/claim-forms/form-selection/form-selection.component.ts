import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-selection',
  templateUrl: './form-selection.component.html',
  styleUrls: ['./form-selection.component.css']
})
export class FormSelectionComponent implements OnInit {

  public CreditOrganization = [
    {
      "DisplayName": "MRP Drug Certificate (ECHS)",
      "RouterLink": "EchsMrpDrugCertificate"
    },
    {
      "DisplayName": "Medicare Claim Form (Medicare)",
      "RouterLink": "MedicalClaim"
    }
  ];
  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  public onOrganizationSelect(org): void {
    this.router.navigate([`/ClaimManagement/ClaimForms/${org.RouterLink}`]);
  }
}
