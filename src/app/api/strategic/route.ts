import { NextResponse } from 'next/server';

const STRATEGIC_BASES = [
  {
    "id": "strat-1",
    "lat": 41.13306,
    "lng": -104.86694,
    "type": "CONTROL_CENTER",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "F.E.WARREN AFB"
  },
  {
    "id": "strat-2",
    "lat": 41.32889,
    "lng": -104.26556,
    "type": "CONTROL_CENTER",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-01"
  },
  {
    "id": "strat-3",
    "lat": 41.4175,
    "lng": -104.19472,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-02"
  },
  {
    "id": "strat-4",
    "lat": 41.38806,
    "lng": -104.07833,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-03"
  },
  {
    "id": "strat-5",
    "lat": 41.31778,
    "lng": -104.17472,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-04"
  },
  {
    "id": "strat-6",
    "lat": 41.30306,
    "lng": -104.07917,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-05"
  },
  {
    "id": "strat-7",
    "lat": 41.2425,
    "lng": -104.25194,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-06"
  },
  {
    "id": "strat-8",
    "lat": 41.17361,
    "lng": -104.30139,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-07"
  },
  {
    "id": "strat-9",
    "lat": 41.21528,
    "lng": -104.38944,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-08"
  },
  {
    "id": "strat-10",
    "lat": 41.29,
    "lng": -104.34778,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-09"
  },
  {
    "id": "strat-11",
    "lat": 41.36,
    "lng": -104.35,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-10"
  },
  {
    "id": "strat-12",
    "lat": 41.41944,
    "lng": -104.28444,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-11"
  },
  {
    "id": "strat-13",
    "lat": 41.51139,
    "lng": -103.99472,
    "type": "CONTROL_CENTER",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-01"
  },
  {
    "id": "strat-14",
    "lat": 41.63889,
    "lng": -103.94528,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-02"
  },
  {
    "id": "strat-15",
    "lat": 41.63889,
    "lng": -103.84306,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-03"
  },
  {
    "id": "strat-16",
    "lat": 41.53556,
    "lng": -103.90667,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-04"
  },
  {
    "id": "strat-17",
    "lat": 41.4725,
    "lng": -103.88806,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-05"
  },
  {
    "id": "strat-18",
    "lat": 41.42111,
    "lng": -103.97722,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-06"
  },
  {
    "id": "strat-19",
    "lat": 41.43917,
    "lng": -104.09083,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-07"
  },
  {
    "id": "strat-20",
    "lat": 41.50333,
    "lng": -104.12611,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-08"
  },
  {
    "id": "strat-21",
    "lat": 41.65917,
    "lng": -104.24194,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-09"
  },
  {
    "id": "strat-22",
    "lat": 41.62917,
    "lng": -104.13194,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-10"
  },
  {
    "id": "strat-23",
    "lat": 41.63861,
    "lng": -104.05444,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "B-11"
  },
  {
    "id": "strat-24",
    "lat": 41.58056,
    "lng": -103.67361,
    "type": "CONTROL_CENTER",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-01"
  },
  {
    "id": "strat-25",
    "lat": 41.68278,
    "lng": -103.67528,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-02"
  },
  {
    "id": "strat-26",
    "lat": 41.64639,
    "lng": -103.52028,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-03"
  },
  {
    "id": "strat-27",
    "lat": 41.58222,
    "lng": -103.55333,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-04"
  },
  {
    "id": "strat-28",
    "lat": 41.51167,
    "lng": -103.49444,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-05"
  },
  {
    "id": "strat-29",
    "lat": 41.465,
    "lng": -103.42722,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-06"
  },
  {
    "id": "strat-30",
    "lat": 41.48278,
    "lng": -103.58139,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-07"
  },
  {
    "id": "strat-31",
    "lat": 41.51639,
    "lng": -103.65639,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-08"
  },
  {
    "id": "strat-32",
    "lat": 41.48611,
    "lng": -103.79139,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-09"
  },
  {
    "id": "strat-33",
    "lat": 41.58111,
    "lng": -103.80306,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-10"
  },
  {
    "id": "strat-34",
    "lat": 41.63917,
    "lng": -103.75139,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "C-11"
  },
  {
    "id": "strat-35",
    "lat": 47.50472,
    "lng": -111.18722,
    "type": "CONTROL_CENTER",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "MALMSTROM AFB"
  },
  {
    "id": "strat-36",
    "lat": 47.28167,
    "lng": -110.80083,
    "type": "CONTROL_CENTER",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-01 MT"
  },
  {
    "id": "strat-37",
    "lat": 47.3725,
    "lng": -110.79222,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-02 MT"
  },
  {
    "id": "strat-38",
    "lat": 47.33972,
    "lng": -110.6725,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-03 MT"
  },
  {
    "id": "strat-39",
    "lat": 47.18222,
    "lng": -110.72778,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-04 MT"
  },
  {
    "id": "strat-40",
    "lat": 47.05111,
    "lng": -110.71972,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-05 MT"
  },
  {
    "id": "strat-41",
    "lat": 47.06167,
    "lng": -110.81056,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-06 MT"
  },
  {
    "id": "strat-42",
    "lat": 47.1625,
    "lng": -110.84361,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-07 MT"
  },
  {
    "id": "strat-43",
    "lat": 47.17889,
    "lng": -110.97,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-08 MT"
  },
  {
    "id": "strat-44",
    "lat": 47.2775,
    "lng": -111.15056,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-09 MT"
  },
  {
    "id": "strat-45",
    "lat": 47.30417,
    "lng": -111.02139,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-10 MT"
  },
  {
    "id": "strat-46",
    "lat": 47.39167,
    "lng": -110.91444,
    "type": "ICBM_SILO",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "A-11 MT"
  },
  {
    "id": "strat-47",
    "lat": 48.41583,
    "lng": -101.35806,
    "type": "CONTROL_CENTER",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "MINOT AFB"
  },
  {
    "id": "strat-48",
    "lat": 53.7982,
    "lng": 35.8039,
    "type": "ICBM_SILO",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "KOZELSK"
  },
  {
    "id": "strat-49",
    "lat": 51.0934,
    "lng": 59.8446,
    "type": "ICBM_SILO",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "DOMBAROVSKY"
  },
  {
    "id": "strat-50",
    "lat": 52.5085,
    "lng": 104.3933,
    "type": "ICBM_SILO",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "IRKUTSK"
  },
  {
    "id": "strat-51",
    "lat": 42.34,
    "lng": 92.52,
    "type": "ICBM_SILO",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "HAMI"
  },
  {
    "id": "strat-52",
    "lat": 40.13,
    "lng": 96.6,
    "type": "ICBM_SILO",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "YUMEN"
  },
  {
    "id": "strat-53",
    "lat": 38.5847,
    "lng": 126.1079,
    "type": "CONVENTIONAL",
    "country": "North Korea",
    "status": "ACTIVE",
    "callsign": "SAKKANMOL"
  },
  {
    "id": "strat-54",
    "lat": 40.31625,
    "lng": 125.27651,
    "type": "CONVENTIONAL",
    "country": "North Korea",
    "status": "ACTIVE",
    "callsign": "SINPUNG-DONG"
  },
  {
    "id": "strat-55",
    "lat": 41.36988,
    "lng": 126.91363,
    "type": "CONVENTIONAL",
    "country": "North Korea",
    "status": "ACTIVE",
    "callsign": "HOEJUNG-NI"
  },
  {
    "id": "strat-56",
    "lat": 38.67425,
    "lng": 126.7277,
    "type": "CONVENTIONAL",
    "country": "North Korea",
    "status": "ACTIVE",
    "callsign": "KAL-GOL"
  },
  {
    "id": "strat-57",
    "lat": 51.0628,
    "lng": 60.2119,
    "type": "CONTROL_CENTER",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "DOMBAROVSKY CC"
  },
  {
    "id": "strat-58",
    "lat": 42.46,
    "lng": 92.35,
    "type": "CONTROL_CENTER",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "HAMI CC"
  },
  {
    "id": "strat-59",
    "lat": 51.767,
    "lng": 45.568,
    "type": "ICBM_SILO",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "TATISHCHEVO"
  },
  {
    "id": "strat-60",
    "lat": 55.289,
    "lng": 89.816,
    "type": "ICBM_SILO",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "UZHUR"
  },
  {
    "id": "strat-61",
    "lat": 62.927,
    "lng": 40.574,
    "type": "ICBM_SILO",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "PLESETSK"
  },
  {
    "id": "strat-62",
    "lat": 48.566,
    "lng": 45.728,
    "type": "CONVENTIONAL",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "KAPUSTIN YAR"
  },
  {
    "id": "strat-63",
    "lat": 56.873,
    "lng": 40.551,
    "type": "CONTROL_CENTER",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "TEIKOVO"
  },
  {
    "id": "strat-64",
    "lat": 39.782,
    "lng": 105.845,
    "type": "ICBM_SILO",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "JILANTAI"
  },
  {
    "id": "strat-65",
    "lat": 29.712,
    "lng": 118.307,
    "type": "CONTROL_CENTER",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "BASE 61 HUANGSHAN"
  },
  {
    "id": "strat-66",
    "lat": 27.55,
    "lng": 109.967,
    "type": "CONTROL_CENTER",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "BASE 63 HUAIHUA"
  },
  {
    "id": "strat-67",
    "lat": 26.233,
    "lng": 109.783,
    "type": "ICBM_SILO",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "TONGDAO"
  },
  {
    "id": "strat-68",
    "lat": 33.133,
    "lng": 112.433,
    "type": "ICBM_SILO",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "SUNDIAN"
  },
  {
    "id": "strat-69",
    "lat": 39.638,
    "lng": 125.358,
    "type": "CONVENTIONAL",
    "country": "North Korea",
    "status": "ACTIVE",
    "callsign": "SINO-RI"
  },
  {
    "id": "strat-70",
    "lat": 38.842,
    "lng": 126.115,
    "type": "CONVENTIONAL",
    "country": "North Korea",
    "status": "ACTIVE",
    "callsign": "SANGWON-NI"
  },
  {
    "id": "strat-71",
    "lat": 34.385,
    "lng": 47.039,
    "type": "ICBM_SILO",
    "country": "Iran",
    "status": "ACTIVE",
    "callsign": "IMAM ALI BASE"
  },
  {
    "id": "strat-72",
    "lat": 38.073,
    "lng": 46.213,
    "type": "CONVENTIONAL",
    "country": "Iran",
    "status": "ACTIVE",
    "callsign": "TABRIZ BASE"
  },
  {
    "id": "strat-73",
    "lat": 35.234,
    "lng": 53.921,
    "type": "CONTROL_CENTER",
    "country": "Iran",
    "status": "ACTIVE",
    "callsign": "SEMNAN RANGE"
  },
  {
    "id": "strat-74",
    "lat": 31.738,
    "lng": 34.921,
    "type": "ICBM_SILO",
    "country": "Israel",
    "status": "ACTIVE",
    "callsign": "SDOT MICHA"
  },
  {
    "id": "strat-75",
    "lat": 31.884,
    "lng": 34.68,
    "type": "CONTROL_CENTER",
    "country": "Israel",
    "status": "ACTIVE",
    "callsign": "PALMACHIM"
  },
  {
    "id": "strat-76",
    "lat": 20.757,
    "lng": 87.011,
    "type": "CONTROL_CENTER",
    "country": "India",
    "status": "ACTIVE",
    "callsign": "ABDUL KALAM IS"
  },
  {
    "id": "strat-77",
    "lat": 17.433,
    "lng": 78.5,
    "type": "CONVENTIONAL",
    "country": "India",
    "status": "ACTIVE",
    "callsign": "SECUNDERABAD"
  },
  {
    "id": "strat-78",
    "lat": 32,
    "lng": 72.54,
    "type": "CONVENTIONAL",
    "country": "Pakistan",
    "status": "ACTIVE",
    "callsign": "SARGODHA"
  },
  {
    "id": "strat-79",
    "lat": 27.8,
    "lng": 66.601,
    "type": "CONVENTIONAL",
    "country": "Pakistan",
    "status": "ACTIVE",
    "callsign": "KHUZDAR"
  },
  {
    "id": "strat-80",
    "lat": 34.742,
    "lng": -120.5724,
    "type": "CONTROL_CENTER",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "VANDENBERG SFB"
  },
  {
    "id": "strat-81",
    "lat": 44.012,
    "lng": 5.495,
    "type": "ICBM_SILO",
    "country": "France",
    "status": "INACTIVE",
    "callsign": "PLATEAU D ALBION"
  },
  {
    "id": "strat-82",
    "lat": 43.523,
    "lng": 4.923,
    "type": "CONTROL_CENTER",
    "country": "France",
    "status": "ACTIVE",
    "callsign": "ISTRES AB"
  },
  {
    "id": "strat-83",
    "lat": 47.048,
    "lng": 2.632,
    "type": "CONTROL_CENTER",
    "country": "France",
    "status": "ACTIVE",
    "callsign": "AVORD AB"
  },
  {
    "id": "strat-84",
    "lat": 30.79,
    "lng": -81.528,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "SUBASE KINGS BAY"
  },
  {
    "id": "strat-85",
    "lat": 47.715,
    "lng": -122.729,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "SUBASE KITSAP BANGOR"
  },
  {
    "id": "strat-86",
    "lat": 41.398,
    "lng": -72.087,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "SUBASE NEW LONDON"
  },
  {
    "id": "strat-87",
    "lat": 21.354,
    "lng": -157.962,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "PEARL HARBOR"
  },
  {
    "id": "strat-88",
    "lat": 13.444,
    "lng": 144.642,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "APRA HARBOR GUAM"
  },
  {
    "id": "strat-89",
    "lat": 36.937,
    "lng": -76.302,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "NAVAL STATION NORFOLK"
  },
  {
    "id": "strat-90",
    "lat": 43.08,
    "lng": -70.738,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "PORTSMOUTH NAVAL SY"
  },
  {
    "id": "strat-91",
    "lat": 47.562,
    "lng": -122.627,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United States",
    "status": "ACTIVE",
    "callsign": "BREMERTON NAVAL SY"
  },
  {
    "id": "strat-92",
    "lat": 56.066,
    "lng": -4.817,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United Kingdom",
    "status": "ACTIVE",
    "callsign": "HMNB CLYDE FASLANE"
  },
  {
    "id": "strat-93",
    "lat": 50.377,
    "lng": -4.184,
    "type": "NUCLEAR_SUB_BASE",
    "country": "United Kingdom",
    "status": "ACTIVE",
    "callsign": "HMNB DEVONPORT"
  },
  {
    "id": "strat-94",
    "lat": 48.303,
    "lng": -4.502,
    "type": "NUCLEAR_SUB_BASE",
    "country": "France",
    "status": "ACTIVE",
    "callsign": "ILE LONGUE BREST"
  },
  {
    "id": "strat-95",
    "lat": 43.116,
    "lng": 5.918,
    "type": "NUCLEAR_SUB_BASE",
    "country": "France",
    "status": "ACTIVE",
    "callsign": "TOULON NAVAL BASE"
  },
  {
    "id": "strat-96",
    "lat": 69.259,
    "lng": 33.322,
    "type": "NUCLEAR_SUB_BASE",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "GADZHIYEVO"
  },
  {
    "id": "strat-97",
    "lat": 69.349,
    "lng": 32.808,
    "type": "NUCLEAR_SUB_BASE",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "VIDYAYEVO ARA BAY"
  },
  {
    "id": "strat-98",
    "lat": 69.431,
    "lng": 32.441,
    "type": "NUCLEAR_SUB_BASE",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "ZAOZERSK"
  },
  {
    "id": "strat-99",
    "lat": 64.575,
    "lng": 39.818,
    "type": "NUCLEAR_SUB_BASE",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "SEVMASH SEVERODVINSK"
  },
  {
    "id": "strat-100",
    "lat": 52.923,
    "lng": 158.495,
    "type": "NUCLEAR_SUB_BASE",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "RYBACHIY PETROPAVLOVSK"
  },
  {
    "id": "strat-101",
    "lat": 53.119,
    "lng": 132.338,
    "type": "NUCLEAR_SUB_BASE",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "BOLSHOY KAMEN ZVEZDA"
  },
  {
    "id": "strat-102",
    "lat": 69.25,
    "lng": 33.35,
    "type": "NUCLEAR_SUB_BASE",
    "country": "Russia",
    "status": "ACTIVE",
    "callsign": "OLENYA BAY"
  },
  {
    "id": "strat-103",
    "lat": 18.211,
    "lng": 109.645,
    "type": "NUCLEAR_SUB_BASE",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "LONGPO YULIN"
  },
  {
    "id": "strat-104",
    "lat": 36.103,
    "lng": 120.603,
    "type": "NUCLEAR_SUB_BASE",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "JIANGGEZHUANG QINGDAO"
  },
  {
    "id": "strat-105",
    "lat": 40.716,
    "lng": 120.978,
    "type": "NUCLEAR_SUB_BASE",
    "country": "China",
    "status": "ACTIVE",
    "callsign": "HULUDAO SHIPYARD"
  },
  {
    "id": "strat-106",
    "lat": 17.689,
    "lng": 83.275,
    "type": "NUCLEAR_SUB_BASE",
    "country": "India",
    "status": "ACTIVE",
    "callsign": "VISAKHAPATNAM SBC"
  },
  {
    "id": "strat-107",
    "lat": 17.441,
    "lng": 82.996,
    "type": "NUCLEAR_SUB_BASE",
    "country": "India",
    "status": "ACTIVE",
    "callsign": "INS VARSHA RAMBILLI"
  },
  {
    "id": "strat-108",
    "lat": 9.957,
    "lng": 76.273,
    "type": "NUCLEAR_SUB_BASE",
    "country": "India",
    "status": "ACTIVE",
    "callsign": "INS VENDURUTHY KOCHI"
  },
  {
    "id": "strat-109",
    "lat": 14.814,
    "lng": 74.108,
    "type": "NUCLEAR_SUB_BASE",
    "country": "India",
    "status": "ACTIVE",
    "callsign": "INS KADAMBA KARWAR"
  }
];

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    bases: STRATEGIC_BASES
  });
}
