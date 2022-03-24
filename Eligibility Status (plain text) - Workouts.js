/////////////////////// Participation Forms

// Converts current date to a SY value that can be matched against what is entered in the [Consent Form - Valid School Year] field. Example: "October 10, 2018" becomes "2018-19". The SY transitions on July 1. This variable is different from the one called earlier in the script ($currentSy)
var text currentSYwithHyphen = If(
  Month(Today())>=7, Year(Today()) &"-" & Right(ToText(Year(AdjustYear(Today(),1))), 2),
  Month(Today())<=6, Year(AdjustYear(Today(),-1)) & "-" & Right(ToText(Year(Today())),2)
  );
var text nextSYwithHyphen = If(
  Month(Today())>=7, AdjustYear(Today(),1) &"-" & Right(ToText(Year(AdjustYear(Today(),2))), 2),
  Month(Today())<=6, Year(AdjustYear(Today(),0)) & "-" & Right(ToText(AdjustYear(Today(),1)),2)
  );

// Must have a UHC <1 year old and an uploaded Consent and Medical Packet with a valid school year value

var bool participationForms = If(
  [Override - Missing Paperwork]=true and [Override - Missing Paperwork - Expiration]>=Today(), true,
  [Consent and Medical Packet]<>"" and [Consent Packet - Valid School Year]=$currentSYwithHyphen and [UHC Form - Date of Exam]>=(Today()-Days(365)), true,
  [Consent and Medical Packet]<>"" and [Consent Packet - Valid School Year]=$nextSYwithHyphen and [UHC Form - Date of Exam]>=(Today()-Days(365)), true,
  false);





/////////////////////// Overall Status

var text overallStatus = If(
  $participationForms = true, "Eligible",
  "Missing Paperwork"
);


$overallStatus
