using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
     public class PrintExportConfigModel
    {
        [Key]
        public int PrintExportSettingsId { get; set; }
        public string SettingName { get; set; }
        public string PageHeaderText { get; set; }
        public string ReportDescription { get; set; }
        public string ModuleName { get; set; }
        public bool ShowHeader { get; set; }
        public bool ShowFooter { get; set; }
        public bool ShowUserName { get; set; }
        public bool ShowPrintExportDateTime { get; set; }
        public bool ShowNpDate { get; set; }
        public bool ShowEnDate { get; set; }
        public bool ShowFilterDateRange { get; set; }
        public bool ShowOtherFilterVariables { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
