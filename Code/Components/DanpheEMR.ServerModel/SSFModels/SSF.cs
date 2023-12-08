using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.SSFModels
{
    public class SSF
    {
        public string resourceType { get; set; }
        public List<Entry> entry { get; set; }
        public List<Link> link { get; set; }
        public int total { get; set; }
        public string type { get; set; }
    }
    public class BillablePeriod
    {
        public string start { get; set; }
    }

    public class Category
    {
        public string text { get; set; }
    }

    public class Coding
    {
        public string code { get; set; }
    }

    public class Coverage
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Diagnosis
    {
        public DiagnosisReference diagnosisReference { get; set; }
        public Name name { get; set; }
        public int sequence { get; set; }
        public List<Type> type { get; set; }
    }

    public class DiagnosisReference
    {
        public int identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Enterer
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Entry
    {
        public string fullUrl { get; set; }
        public Resource resource { get; set; }
    }

    public class Extension
    {
        public string url { get; set; }
        public string valueString { get; set; }
        public ValueReference valueReference { get; set; }
    }

    public class Facility
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Identifier
    {
        public Type type { get; set; }
        public string use { get; set; }
        public string value { get; set; }
    }

    public class Insurance
    {
        public Coverage coverage { get; set; }
        public bool focal { get; set; }
        public int sequence { get; set; }
    }

    public class Item
    {
        public Category category { get; set; }
        public List<Extension> extension { get; set; }
        public Name name { get; set; }
        public ProductOrService productOrService { get; set; }
        public Quantity quantity { get; set; }
        public int sequence { get; set; }
        public UnitPrice unitPrice { get; set; }
    }

    public class Link
    {
        public string relation { get; set; }
        public string url { get; set; }
    }

    public class Name
    {
        public string text { get; set; }
    }

    public class Patient
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Priority
    {
        public List<Coding> coding { get; set; }
    }

    public class ProductOrService
    {
        public string text { get; set; }
    }

    public class Provider
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Quantity
    {
        public double value { get; set; }
    }

    public class Resource
    {
        public string resourceType { get; set; }
        public BillablePeriod billablePeriod { get; set; }
        public string created { get; set; }
        public List<Diagnosis> diagnosis { get; set; }
        public Enterer enterer { get; set; }
        public List<Extension> extension { get; set; }
        public Facility facility { get; set; }
        public string id { get; set; }
        public List<Identifier> identifier { get; set; }
        public List<Insurance> insurance { get; set; }
        public List<Item> item { get; set; }
        public Patient patient { get; set; }
        public Priority priority { get; set; }
        public Provider provider { get; set; }
        public string status { get; set; }
        public List<SupportingInfo> supportingInfo { get; set; }
        public Total total { get; set; }
        public Type type { get; set; }
        public string use { get; set; }
    }



    public class SupportingInfo
    {
        public Category category { get; set; }
        public int sequence { get; set; }
        public string valueString { get; set; }
    }

    public class Total
    {
        public string currency { get; set; }
        public double value { get; set; }
    }

    public class Type
    {
        public List<Coding> coding { get; set; }
        public string text { get; set; }
    }

    public class UnitPrice
    {
        public string currency { get; set; }
        public double value { get; set; }
    }

    public class ValueReference
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class ClaimBooking
    {
        public float bookedAmount { get; set; }
        public string Patient { get; set; }
        public string scheme { get; set; }
        public int? subProduct { get; set; }
        public string client_claim_id { get; set; }
        public string client_invoice_no { get; set; }
    }
}
