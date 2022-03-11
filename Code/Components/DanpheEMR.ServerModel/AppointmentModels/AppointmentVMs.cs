using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace DanpheEMR.ServerModel
{
    public class QuickAppointmentVM
    {

        public PatientModel Patient { get; set; }
        public AppointmentModel Appointment { get; set; }
        public BillingTransactionModel BillingTransaction { get; set; }
        public VisitModel Visit { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
    }


    public class QuickVisitVM
    {

        public PatientModel Patient { get; set; }
        public BillingTransactionModel BillingTransaction { get; set; }
        public VisitModel Visit { get; set; }
    }

    //Yubaraj:21Jun'19--Needed to show Deptname in List visit page, so created this VM.
    public class ListVisitsVM
    {

        public int PatientVisitId { get; set; }
        public int? ParentVisitId { get; set; }
        public int? DepartmentId { get; set; }//this should be set to not null after updating existing data
        public string DepartmentName { get; set; }
        public int? ProviderId { get; set; }
        public string ProviderName { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime VisitDate { get; set; }
        public TimeSpan? VisitTime { get; set; }
        public string QueueStatus { get; set; }
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string ShortName { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }



        public string VisitType { get; set; }
        public string AppointmentType { get; set; }

        public string BillStatus { get; set; }
        ////this date is the First one in the hierarchy. eg: NewVisit was created on 1st June, 1st Followup was created on 3rd June, and 2nd followup was on 5th June
        //// FirstParentVisitDate will be that of 1st June for both 3rd and 5th June's Followup.
        //public DateTime FirstParentVisitDate { get; set; }

        public PatientModel Patient { get; set; }

        public bool IsValidForFollowup { get; set; }

        public ListVisitsVM TopParentVisit { get; set; }//this is referring to own class, used only in server side.

        //sud:1-Oct'21--Changing Claimcode from String to Int64-- to use Incremental logic (max+1)
        //need nullable since ClaimCode is Non-Mandatory for normal visits.
        public Int64? ClaimCode { get; set; }
        public string Ins_NshiNumber { get; set; }
        public bool? Ins_HasInsurance { get; set; }

        public int? QueueNo { get; set; }

    }   
}

