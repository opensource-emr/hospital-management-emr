using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.Core.DynTemplates
{
    public class Template
    {
        [Key]
        public int TemplateId { get; set; }
        public string Code { get; set; }
        public string Text { get; set; }
        public string ModuleName { get; set; }
        public List<Questionnaire> Qnairs { get; set; }
        public Template()
        {
            this.Qnairs = new List<Questionnaire>();
        }
    }
}
