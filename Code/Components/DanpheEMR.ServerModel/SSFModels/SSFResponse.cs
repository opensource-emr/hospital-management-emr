using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.SSFModels.SSFResponse
{
    internal class SSFResponse
    {
    }
    public class Address
    {
        public string text { get; set; }
        public string type { get; set; }
        public string use { get; set; }
    }

    public class Coding
    {
        public string code { get; set; }
    }

    public class Entry
    {
        public string fullUrl { get; set; }
        public Resource resource { get; set; }
    }

    public class Extension
    {
        public string url { get; set; }
        public bool valueBoolean { get; set; }
        public DateTime? valueDateTime { get; set; }
        public ValueReference valueReference { get; set; }
    }

    public class Identifier
    {
        public Type type { get; set; }
        public string use { get; set; }
        public string value { get; set; }
    }

    public class Link
    {
        public string relation { get; set; }
        public string url { get; set; }
    }

    public class Name
    {
        public string family { get; set; }
        public List<string> given { get; set; }
        public string use { get; set; }
    }

    public class Photo
    {
        public string creation { get; set; }
        public string url { get; set; }
    }

    public class Resource
    {
        public string resourceType { get; set; }
        public List<Address> address { get; set; }
        public string birthDate { get; set; }
        public List<Extension> extension { get; set; }
        public string gender { get; set; }
        public string id { get; set; }
        public List<Identifier> identifier { get; set; }
        public List<Name> name { get; set; }
        public List<Photo> photo { get; set; }
        public List<Telecom> telecom { get; set; }
    }

    public class Root
    {
        public string resourceType { get; set; }
        public List<Entry> entry { get; set; }
        public List<Link> link { get; set; }
        public int total { get; set; }
        public string type { get; set; }
    }

    public class Telecom
    {
        public string use { get; set; }
        public string value { get; set; }
    }

    public class Type
    {
        public List<Coding> coding { get; set; }
    }

    public class ValueReference
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class EmployerRoot
    {
        public string resourceType { get; set; }
        public string CHFID { get; set; }
        public List<List<Family>> Family { get; set; }
        public string FamilyId { get; set; }
        public List<List<Company>> company {get;set;}
        public string id { get; set; }
        public List<Identifier> identifier { get; set; }
        public string last_name { get; set; }
        public string other_names { get; set; }
    }
    public class Family
    {
        public string name { get; set; }
        public bool IsHead { get; set; }
        public string CHFID { get; set; }
    }
    public class Company
    {
        public string fullUrl { get; set; }
        public string E_SSID { get; set; }
        public string name { get; set; }
        public string status { get; set; }
    }
}
