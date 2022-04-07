
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



  /////////////////////// COVID-19 Vaccination

  // Vaccination card (file upload) and date of last shot are required
  // [CURRENT RULES] Students are required to be fully vaccinated 2 months after turning 12 years old.
  // [OLD PHASE IN PERIOD RULES] Effective Dec 1 2021, students aged 12 or older must be vaccinated. Students who will turn 12 between the Sept 20 and Nov 1 inclusive must be vaccinated before Dec 13 2021. Students turning 12 after Nov 1 have two months from their birthday to be vaccinated
  // Religious/medical exemptions last for one school year. Forms expire on Aug 1 (this is different from participation packets which expire on July 1).
  // Below returns T/F if student has met vaccine requirement. Students not subject to mandate return True

  var number currentSyForCovidExemption = If(Month(Today())<=7, Year(Today()), Month(Today())>=8, Year(Today())+1);

  var number medicalExpirationSy = ToNumber(Right([COVID-19 Medical Exemption Expiration], 2)) + 2000;
  var number religiousExpirationSy = ToNumber(Right([COVID-19 Religious Exemption Expiration], 2)) + 2000;

  var date birthdayTwelve = AdjustYear([Date of Birth], 12);
  var date gracePeriod = AdjustMonth($birthdayTwelve, 2);

  var bool covidVaccineReligiousExemption = If(
    [COVID-19 Approved Religious Exemption Form]<>"" and $religiousExpirationSy = $currentSyForCovidExemption, true, false);

  var bool covidVaccineMedicalExemption = If(
    [COVID-19 Approved Medical Exemption Form]<>"" and $medicalExpirationSy = $currentSyForCovidExemption, true, false);

  var bool covidVaccineOverride = If(
    [Override - Covid Vaccine]=true and [Override - Covid Vaccine - Expiration Date]>=Today(), true,
    false);

  var bool covidVaccineCard = If(
    Today() >= $gracePeriod and [COVID-19 Vaccination Card]<>"" and [Date of Last COVID-19 Shot]<=Today(), true,
    false);

  var bool covidVaccination = If(
    Today() < $gracePeriod, true,
    $covidVaccineCard = true, true,
    $covidVaccineReligiousExemption = true, true,
    $covidVaccineMedicalExemption = true, true,
    $covidVaccineOverride = true, true,
    false
  );




/////////////////////// Overall Status

var text overallStatus = If(
  $participationForms = true and $covidVaccination = true, "Eligible",
  $participationForms = true and $covidVaccination = false, "Missing COVID Vaccine",
  $participationForms = false and [Paperwork Ready for Review] = true, "Ready for AT Review",
  $participationForms = false, "Missing Paperwork",
  "Error"
);


$overallStatus
