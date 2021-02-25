
using DanpheEMR.ServerModel.LabModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabTestModel
    {
        [Key]
        public Int64 LabTestId { get; set; }
        public string LabTestCode { get; set; }
        public int LabSequence { get; set; }
        public string ProcedureCode { get; set; }
        public string LabTestName { get; set; }
        public string LabTestSynonym { get; set; }
        public string LabTestSpecimen { get; set; }
        public string LabTestSpecimenSource { get; set; }

        public string LOINC { get; set; }
        public int? ReportTemplateId { get; set; }
        public bool? IsValidForReporting { get; set; }
        public string Description { get; set; }
        public int? DisplaySequence { get; set; }
        public string RunNumberType { get; set; }//Anish:26Sept'18       

        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public bool? IsActive { get; set; }

        public bool? HasNegativeResults { get; set; }
        public string NegativeResultText { get; set; }
        public int? LabTestCategoryId { get; set; }

        public virtual LabReportTemplateModel LabReportTemplate { get; set; }


        //ashim: 06Sep2018
        public string ReportingName { get; set; }

        //anish: 9 Sept 2018
        public string Interpretation { get; set; }

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        // below property 'IsSelected' is not the part of databae model, 
        //but we need some boolean field to bind with checkbox so kept it.<dharmendra:13jan'17> 
        [NotMapped]
        public bool? IsSelected { get; set; }
        [NotMapped]
        public bool? IsPreference { get; set; }
        //suraj: 24th sepptember 2018
        [NotMapped]
        public bool? IsTaxApplicable { get; set; }
        [NotMapped]
        public List<LabTestJSONComponentModel> LabTestComponentsJSON { get; set; }
        [NotMapped]
        public List<LabTestComponentMapModel> LabTestComponentMap { get; set; }


        //NBB-29 Jan 2018- searched but not any reference found for this property in our application        
        //and MyProperty is not a valid column in db also, so now i'm applying [NotMapped] decorator
        [NotMapped]
        public int? MyProperty { get; set; }

        [NotMapped]
        public int? ServiceDepartmentId { get; set; }

        [NotMapped]
        public string TemplateType { get; set; }


        //public ICollection<LabTestJSONComponentModel> LabTestComponents { get; set; }
    }
}
