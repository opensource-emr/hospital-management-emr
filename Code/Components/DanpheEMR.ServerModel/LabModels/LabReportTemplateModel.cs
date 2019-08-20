using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabReportTemplateModel
    {        
        [Key]
        public int ReportTemplateID { get; set; }
        public string ReportTemplateShortName { get; set; }
        public string ReportTemplateName { get; set; }
        public string TemplateFileName { get; set; }
        public string NegativeTemplateFileName { get; set; }
    
        //true for the template which should be selected if nothing else is.
        public bool? IsDefault { get; set; }
        
        public bool? IsActive { get; set; }
        public int? CreatedBy { get; set; }//changed  to nullable for mnk-uat:sudarshan-13July2017
        public DateTime? CreatedOn { get; set; }//changed  to nullable for mnk-uat:sudarshan-13July2017
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public string HeaderText { get; set; }//sud:22Jun'18
        public string ColSettingsJSON { get; set; }//sud:22Jun'18

        //Added by Anish 29 Aug 2018
        public string TemplateType { get; set; }
        public string TemplateHTML { get; set; }
        public string FooterText { get; set; }
        public string Description { get; set; }
        public int? DisplaySequence { get; set; } 

    }
}
