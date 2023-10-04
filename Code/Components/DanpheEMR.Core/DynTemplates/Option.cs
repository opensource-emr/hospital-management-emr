using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.Core.DynTemplates
{
    public class Option
    {
        [Key]
        public int OptionId { get; set; }
        public string Text { get; set; }
        public int QuestionId { get; set; }
        //public Question Question { get; set; }
        public bool IsDefault { get; set; }
        [NotMapped]
        public bool IsSelected { get; set; }
        public bool ShowChildOnSelect { get; set; }
        [NotMapped]
        public string EntityState { get; set; }

        public bool IsActive { get; set; }
        public Option()
        {
            this.EntityState = "unchanged";
        }
    }
}
