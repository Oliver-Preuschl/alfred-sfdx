const alfy = require("alfy");

alfy.output([
  {
    title: "Auth",
    arg: "auth ",
  },
  {
    title: "Org",
    arg: "org ",
  },
  {
    title: "Package",
    arg: "package ",
    force:user:display                                              -- displays information about a user of a scratch org
force:user:list                                                 -- lists all users of a scratch org
force:user:password:generate                                    -- generate a password for scratch org users
force:user:permset:assign                                       -- assign a permission set to one or more users of an org
force:visualforce:component:create                              -- create a Visualforce component
force:visualforce:page:create                                   -- create a Visualforce page
❯ sfdx force:package:list
=== Packages [23]
Namespace Prefix  Name                               Id                  Alias  Description  Type
────────────────  ─────────────────────────────────  ──────────────────  ─────  ───────────  ────────
                  apexClientCredentialsAuthProvider  0Ho4T000000fxY4SAI                      Unlocked
ApexKeyValueConfig                 0Ho4T000000fxXuSAI                      Unlocked
Deprecated1                        0Ho4P000000005uSAA                      Unlocked
LwcApplicationStateNN              0Ho4P000000004XSAQ                      Unlocked
LwcCoreNN                          0Ho4P000000004NSAQ                      Unlocked
LwcDocumentGeneratorNN             0Ho4T000000fxV0SAI                      Unlocked
LwcUiControlsNN                    0Ho4P000000004SSAQ                      Unlocked
ReweDigital_Object_Account         0Ho4T000000fxXkSAI                      Unlocked
ReweDigital_Object_Case            0Ho4T000000fxXpSAI                      Unlocked
ReweDigital_SkoposRestService      0Ho4T000000fxXfSAI                      Unlocked
hwc               ApexCore                           0Ho4P000000GmdSSAS                      Unlocked
hwc               ApexLogger                         0Ho4P000000GmdXSAS                      Unlocked
hwc               ApexOpportunityQuoteSyncer         0Ho4P000000005zSAA                      Unlocked
hwc               ApexRecordLinker                   0Ho4P000000GmeVSAS                      Unlocked
hwc               ApexRecordMassProcessor            0Ho4P000000GmdcSAC                      Unlocked
hwc               ApexRestServiceResourceHandler     0Ho4T000000fxXaSAI                      Unlocked
  },
  {
    title: "User",
    arg: "user ",
  },
  {
    title: "Clear Cache",
    arg: "clearCache",
  },
]);
