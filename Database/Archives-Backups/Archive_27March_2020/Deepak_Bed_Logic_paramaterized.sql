
-- Deepak Start: 12th March, 2020: For Bed Logic
GO
DECLARE @ParameterId int
insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('ADT', 'CheckoutTimeIncremental', '0.5', 'string', 'for the checkout time incremental i.e 0.5,1,1.5, etc', 'custom')

insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description, ParameterType)
values('ADT', 'OneDayFormat', '24:00', 'string', 'Format-1(old format) - ParameterValue: "00:00", Format-2- ParameterValue:"24:00" i.e 12:00 AM- this will enable with 1 day increment after every 12:A.M, Format-3-ParameterValue:"skip" i.e 12:00 AM- this will enable with 1 day increment after skipping first night  12:A.M', 'custom')
SET @ParameterId = SCOPE_IDENTITY()
GO
-- End Deepak Start: 12th March, 2020: For Bed Logic

-- Deepak Start: 12th March, 2020 IP-Billing --> Settlement
GO
ALTER PROCEDURE [dbo].[SP_TXNS_BILL_SettlementSummary] 
AS

BEGIN
 Select pat.PatientId, pat.PatientCode, 
       pat.FirstName+' '+ISNULL(pat.MiddleName+' ','')+ pat.LastName 'PatientName', 
     pat.DateOfBirth,
     pat.Gender,
     ISNULL( credit.CreditTotal,0) 'CreditTotal', 
    cast(round(ISNULL(prov.ProvisionalTotal,0),2) as numeric(16,2))  'ProvisionalTotal', 

   cast(
        round( 
             (ISNULL(dep.TotalDeposit,0)- ISNULL(dep.DepositDeduction,0) - ISNULL(dep.DepositReturn,0))
           ,2) as numeric(16,2)) 'DepositBalance', 
     --- comparing between DepositCreatedDate, provisionalCreatedDate and CreditInvoiceCreatedDate--
     --- 2010-01-01 is taken instead as default instead of null -- since our application doesn't have data before that.---
    Case WHEN ISNULL(Dep_CreatedOn,'2010-01-01') > ISNULL(Prov_CreatedOn,'2010-01-01') AND  ISNULL(Dep_CreatedOn,'2010-01-01') > ISNULL(Inv_CreatedOn,'2010-01-01') THEN Dep_CreatedOn
         WHEN ISNULL(Prov_CreatedOn,'2010-01-01') > ISNULL(Dep_CreatedOn,'2010-01-01')  AND ISNULL(Prov_CreatedOn,'2010-01-01')   >ISNULL(Inv_CreatedOn,'2010-01-01')  THEN Prov_CreatedOn
       ELSE Inv_CreatedOn END  
        AS   LastTxnDate
       --credit.CreatedOnDate
from PAT_Patient pat
LEFT JOIN
(
  Select txn.PatientId,

  (select top 1 CreatedOn from BIL_TXN_BillingTransaction 
     where BillStatus ='unpaid' 
     AND ISNULL(ReturnStatus,0) != 1 
   AND ISNULL(IsInsuranceBilling,0) != 1 
   AND (PatientId = txn.PatientId) order by CreatedOn desc) 
  
  as 'CreatedOnDate' ,
  SUM(txn.TotalAmount) 'CreditTotal',
  
    max(txn.CreatedOn) 'Inv_CreatedOn'  -- sud
  
  from BIL_TXN_BillingTransaction txn
  where txn.BillStatus ='unpaid' 
    AND ISNULL(txn.ReturnStatus,0) != 1 AND ISNULL(txn.IsInsuranceBilling,0) != 1
  Group by txn.PatientId
) credit on pat.PatientId = credit.PatientId 
LEFT JOIN
(
   Select txnItm.PatientId, SUM(txnItm.TotalAmount) 'ProvisionalTotal', 
     MAX(CreatedOn) 'Prov_CreatedOn'   -- sud
     from BIL_TXN_BillingTransactionItems txnItm
       where txnItm.BillStatus!='provisional' and txnItm.BillingTransactionId is not null AND ISNULL(txnItm.ReturnStatus,0) != 1 AND ISNULL(txnItm.IsInsurance,0) != 1 

     Group By txnItm.PatientId
) prov
ON pat.PatientId = prov.PatientId
LEFT JOIN
( 
  Select dep.PatientId,
    SUM(Case WHEN dep.DepositType='Deposit' THEN ISNULL(dep.Amount,0) ELSE 0  END ) AS 'TotalDeposit',
    SUM(Case WHEN dep.DepositType='depositdeduct' THEN ISNULL(dep.Amount,0) ELSE 0  END ) AS 'DepositDeduction',
    SUM(Case WHEN dep.DepositType='ReturnDeposit' THEN ISNULL(dep.Amount,0) ELSE 0  END ) AS 'DepositReturn',
  MAX(dep.CreatedOn) 'Dep_CreatedOn'   -- sud
   FROM BIL_TXN_Deposit dep
   Group by dep.PatientId
) dep
ON dep.PatientId = pat.PatientId

---show only those patients which has either amount > 0
where ISNULL(credit.CreditTotal,0) > 1 
      OR ISNULL(prov.ProvisionalTotal,0) > 1  
    OR ( dep.TotalDeposit-dep.DepositDeduction - dep.DepositReturn) > 1

Order by LastTxnDate DESC
END
GO
-- End Deepak Start: 12th March, 2020   IP-Billing --> Settlement