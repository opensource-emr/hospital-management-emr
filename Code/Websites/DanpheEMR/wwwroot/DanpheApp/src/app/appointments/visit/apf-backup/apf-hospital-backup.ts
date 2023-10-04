// PostRank(Rank: string) {
//     this.visitBLService.PostRank(Rank).subscribe(res => {
//         if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
//             this.RankList.push(res.Results);
//             this.visitService.SetAllRank(this.RankList);
//             this.selectedRank = res.Results;
//         }
//         else {
//             this.msgBoxServ.showMessage('Failed', ['Failed to save rank! Please see details in console']);
//             console.log(res.ErrorMessage);
//         }
//     },
//         err => {
//             console.log(err);
//         });
// }


// RankFormatter(data) {
//     return data["RankName"];
// }
// OnRankChange($event) {
//     this.patient.Rank = $event ? $event.RankName : null;
// }

// export class Rank {
//     public RankId: number = null;
//     public RankName: string = null;
//     public RankDescription: string = null;
// }
  

//   public getIdCardNumber() {
//     // let data: APFPatientData = {
//     //   'id': '3599', 'rank': 'Havildar2', 'title': '', 'f_name': 'Sanjay', 'm_name': '', 'l_name': 'Darlami Magar', 'full_name': 'Sanjay Darlami Magar', 'blood_group': 'A+ve', 'district': 'Sindhuli', 'dob': '2000/01/01', 'status': 'Present', 'gender': 'Male', 'posting': 'Armed Police Force, Nepal Help and Support Coy, Kaski, Kaski', 'working_unit': 'Nepal APF Hospital, Balambu'
//     // }
//     // this.ApfPatientDetails = data;
//     // this.MapApfPatientData();
//     this.loading = true;
//     this.visitBLService.GetAPIPatientDetail(this.APFUrl, this.patient.IDCardNumber).subscribe(res => {
//         this.ApfPatientDetails = res;
//         this.loading = false;
//         if (this.ApfPatientDetails) {
//             this.MapApfPatientData();
//         } else {
//             this.msgBoxServ.showMessage("Notice", ["Patient with provided IdCardNumber is not available"]);
//         }
//     },
//         err => {
//             this.loading = false;
//             this.msgBoxServ.showMessage("Error", ["Something went wrong"]);
//         })
// }

//   public MapApfPatientData() {
//     this.patient.IDCardNumber = this.ApfPatientDetails.id;
//     this.patient.Rank = this.ApfPatientDetails.rank;
//     this.patient.Posting = this.ApfPatientDetails.posting;
//     var postingData = this.RankList.find(r => r.RankName.toLowerCase() === this.patient.Rank.toLowerCase());
//     if (!postingData) {
//         this.PostRank(this.patient.Rank);
//     }
//     else {
//         this.selectedRank = postingData;
//     }
//     this.patient.FirstName = this.ApfPatientDetails.f_name;
//     this.patient.MiddleName = this.ApfPatientDetails.m_name;
//     this.patient.LastName = this.ApfPatientDetails.l_name;
//     this.patient.Gender = this.ApfPatientDetails.gender;
//     this.patient.DateOfBirth = moment(this.ApfPatientDetails.dob).format("YYYY-MM-DD");
//     this.CalculateAge();

// }

//   public getDependentId() {
//     this.showDependentIdPopup = true;
//     this.ListDependentIds();
// }

//   public CloseDependentIdPopup() {
//     this.showDependentIdPopup = false;
//     this.router.navigate(["/Appointment/Visit"]);
// }


//   public listOfPatientsUsingDependents: Array<Patient> = new Array<Patient>();
//   public dependent: Patient = new Patient();
//   public listOfPatientIdsUsingSameDependentId: Array<number> = Array<number>();
//   public ListDependentIds() {
//     this.visitBLService.GetDependentIdDetail(this.patient.DependentId)
//         .subscribe((res: DanpheHTTPResponse) => {
//             if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
//                 const result = res.Results;

//                 this.listOfPatientsUsingDependents = result.patientsUnderDependents;
//                 this.dependent = result.dependent;
//                 this.listOfPatientsUsingDependents.forEach(a => {
//                     this.listOfPatientIdsUsingSameDependentId.push(a.PatientId);
//                 });

//                 this.patient.listOfPatientIdsUsingSameDependentId = this.listOfPatientIdsUsingSameDependentId;
//                 this.patient.APFPatientDependentIdCount = this.listOfPatientsUsingDependents.length;
//                 this.listOfPatientsUsingDependents.map(a => !a.IsDependentIdEditAble);
//                 if (this.listOfPatientsUsingDependents.length >= this.SameDependentIdApplicableCount) {
//                     this.msgBoxServ.showMessage("error", ["This Dependent Id is already used " + this.listOfPatientsUsingDependents.length + " time."]);
//                 }
//             }
//             else {
//                 this.msgBoxServ.showMessage("failed", ['Failed to get Dependentid List.' + res.ErrorMessage]);
//             }
//         },
//             err => {
//                 this.msgBoxServ.showMessage("error", ['Failed to get Dependentid List.' + err.ErrorMessage]);
//             });
// }

//   public editdependentid(index: number) {
//     this.listOfPatientsUsingDependents[index].IsDependentIdEditAble = true;
// }

// public submit(index: number) {

//     this.visitBLService.UpdateDependentId(this.listOfPatientsUsingDependents[index].DependentId, this.listOfPatientsUsingDependents[index].PatientId)
//         .subscribe(res => {
//             if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
//                 this.msgBoxServ.showMessage("success", ["DependentId is Updated."]);
//                 this.showDependentIdPopup = false;

//                 this.ListDependentIds();
//             }
//             else {
//                 this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
//             }
//         },
//             err => {
//                 this.msgBoxServ.showMessage('error', [err.ErrorMessage]);
//             });



// }

// if (this.patient.Rank !== null) {
//     var rankData = this.RankList.find(r => r.RankName === this.patient.Rank);
//     if (!rankData) {
//         this.PostRank(this.patient.Rank);
//     }
//     else {
//         this.selectedRank = rankData;
//     }
// }

// this.RankList = this.visitService.RankList;
// this.SameDependentIdApplicableCount = this.coreService.SameDependentIdApplicableCount;


// public GetParameter() {
//     let param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Appointment' && a.ParameterName === 'APFUrlForPatientDetail');
//     if (param) {
//       let obj = JSON.parse(param.ParameterValue);
//       this.APFUrl = obj.BaseURL;
//       this.IsAPFIntegrationEnabled = JSON.parse(obj.EnableAPFPatientRegistrtion);
//     }
//   }


// public LoadApfHospitalParameter() {
//     let param = this.coreService.Parameters.find(a => a.ParameterGroupName == 'Appointment' && a.ParameterName == 'APFUrlForPatientDetail');
//     if (param) {
//       let obj = JSON.parse(param.ParameterValue);
//       this.APFUrl = obj.BaseURL;
//       this.IsAPFIntegrationEnabled = JSON.parse(obj.EnableAPFPatientRegistrtion);
//     }
//   }


// /*From Visit-Billing-Info.component -- Sud:15Mar'23 */
// InitializeDiscountFromMembership(): void {
//     //* Below logic will set DiscountPercent to 0 if DiscountInitializedFromMembership is false.(This is needed for APF Hospital) , Krishna, 16thDec'22
//     const parameter = this.coreService.Parameters.find(p => p.ParameterGroupName === "Appointment" && p.ParameterName === 'DiscountInitializedFromMembership');
//     if (parameter) {
//       const paramValue = JSON.parse(parameter.ParameterValue);
//       this.DiscountInitializedFromMembership = paramValue.InitializeDiscount;
//     }
//     if (!this.DiscountInitializedFromMembership) {
//       this.billingTransaction.DiscountPercent = 0;
//     }
//   }


/*From Visit-Main Component -- Sud:15Mar'23 */

// public GetSameDependentIdApplicableCountParameter() {
//     let param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Appointment' && a.ParameterName === 'SameDependentIdApplicableCount');
//     if (param) {
//       let obj = JSON.parse(param.ParameterValue);
//       this.SameDependentIdApplicableCount = obj ? Number(obj.Count) : 5;
//       this.coreService.SetSameDependentIdApplicableCount(this.SameDependentIdApplicableCount);
//     }
//   }