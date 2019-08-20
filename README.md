# hospital-management-emr
Health care EMR

## Getting Started
The system is mainly designed for Hospitals and aimed to provide total digital solution for hospital management. It features to provide automated and digital solution for all the process hospital has to encounter. It contains different modules Like

#### DanpheEMR Basic Module
* Registration
* Appointment
* Patient
* Scheduling
* Billing
* Outpatient
* Government Statutory Reports/ Basic Report
* Enquiry

#### Danphe ERP Modules
* Financial Accounting
* Inventory & Store Management
* Fixed Assets
* Reporting & Dashboard

#### Danphe Advance Modules
* Laboratory
* Radiology
* Admission, Discharge, Transfer(ADT)
* Pharmacy
* Emergency
* Bed & Ward Management
* Departments(Onchology)
* Inpatient
* Insurance
* Smart Card
* QR Code Management System

## Prerequisites

You need VS Code(for Client), visual studio(for API), MSSQL server(for Database), .Net core SDK 2.1, NodeJs, Angular 7

Download VS Code from [here](https://code.visualstudio.com/download)

Download Visual Studio from [here](https://visualstudio.microsoft.com/vs/)

Download MSSQL server from [here](https://www.microsoft.com/en-gb/sql-server/sql-server-downloads)

Download .Net Core SDK 2.1 [here](https://dotnet.microsoft.com/download/dotnet-core/2.1)

Download NodeJs from [here](https://nodejs.org/en/)

Download Angular 7 from [here](https://cli.angular.io/)

## Running the application

**Clone or download repository**

`git clone https://github.com/opensource-emr/DanpheEMR.git`

## Database Creation (Sql Server)

We need 3 databases for running DanpheEMR. So, we have .bak files into DanpheEMR/Database/ folder.

**Create Database with below steps**
1. Go to DanpheEMR/Database/
2. Restore DanpheAdmin.bak database. 
3. Restore DanpheEMR.bak database.
4. Restore Danphe_PACS database.


**How to Restore .bak file go to this link(https://support.managed.com/kb/a1788/how-to-manually-restore-an-mssql-database-in-management-studio.aspx)**


## NPM Installation for Angular Project

To Install and Run angular project go through below steps:

Step 1: Go to **DanpheEMR\Code\Websites\DanpheEMR\wwwroot\DanpheApp** path and copy.

Step 2: Open Your Node.js Command Prompt paste the copied path and execute **npm install** command.

Step 3: Once the **npm install** done successfully than execute **ng build --watch** command.
        So, some of you wondering that what is **ng build and --watch**. Here it is
	**ng build** ( It build you angular code) and
	**--watch** ( It runs in background so that whenever you change the code and save it. It gets build automatically.)
	
## Note :
 you can also open Angular Project in visual studio code from there you will do **npm install** and **ng build --watch**.
 
 ## DanpheEMR Basic Changes, Build and Run Project
 
 Step 1: Go to **DanpheEMR\DanpheEMR\Code\Solutions** path and double click on solution file to open project in Visual Studio 2017.
 
 Step 2: Open Solution Explorer and find **appsetting.json** file into DanpheEMR Web Application and change the **connectionstring**   properties as per database and server name.
 
 Step 3: Once changes done than save the file.
 
 Step 4: Now build **DanpheEMR** web Application and run it.
 
 

 
 




