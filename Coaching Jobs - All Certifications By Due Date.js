var number seasonCertsDeadlineSy = If(Month([season - Certifications Due])<=7, Year([season - Certifications Due]), Month([season - Certifications Due])>=8, Year([season - Certifications Due])+1);
var number coachesAgreementSy = ToNumber(Right([Coaches Agreement], 2)) + 2000;

var bool allCertsByDeadline = If(
  [Requires Coaches Meeting?] = true and IsNull([Coaches Meeting]), false,
  IsNull([CPR/AED Certification]), false,
  [Coaches Agreement] = "", false,
  IsNull([Concussion Training]), false,
  IsNull([DCIAA Coaches Test]), false,
  IsNull([Fingerprint Clearance (most recent)]), false,
  IsNull([Heat Acclimatization]), false,
  [Fingerprint Clearance (most recent)] + Days(365*2) <= [season - Certifications Due], false,
  [DCIAA Coaches Test] + Days(365*2) <= [season - Certifications Due], false,
  [Concussion Training] + Days(365*2) <= [season - Certifications Due], false,
  $coachesAgreementSy < $seasonCertsDeadlineSy, false,
  [CPR/AED Certification] + Days(365*2) <= [season - Certifications Due], false,
  [Heat Acclimatization] + Days(365*2) <= [season - Certifications Due], false,
  true
);

$allCertsByDeadline
