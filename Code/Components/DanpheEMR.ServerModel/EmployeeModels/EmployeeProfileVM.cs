using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    //    public EmployeeId: number = null; 
    //public UserName: string = null;



    public class EmployeeProfileVM
    {
        [Key]
        public int EmployeeId { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? DateOfJoining { get; set; }

        public string Department { get; set; }
        public string ImageFullPath { get; set; }
        public string ImageName { get; set; }
        public string ContactNumber { get; set; }
        public string Email { get; set; }
        public string ContactAddress { get; set; }

        public string UserName { get; set; }

    }
}
