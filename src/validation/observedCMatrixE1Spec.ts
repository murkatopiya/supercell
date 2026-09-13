/** Literal binary64 transcription of protocol §13 and frozen implementation §4.1.
 * No production imports. Reconstruct independently in preflight; never replace literals. */
type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
function immutable<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) immutable(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
export const FROZEN_E1_STORM_ONLY = immutable({
  "updraft": {
    "centerX": 0,
    "centerZ": 0,
    "peakVerticalVelocity": 30,
    "sigma": 4000,
    "baseHeight": 0,
    "topHeight": 8000
  },
  "rotation": {
    "centerX": 0,
    "centerZ": 0,
    "angularVelocity": 0.005,
    "sigma": 4000,
    "baseHeight": 0,
    "topHeight": 6500
  },
  "lowerRadialInflow": {
    "centerX": 0,
    "centerZ": 0,
    "radialStrainRate": 0.00125,
    "sigma": 4000,
    "baseHeight": 1500,
    "topHeight": 4500
  },
  "upperRadialOutflow": {
    "centerX": 0,
    "centerZ": 0,
    "outflowStrainRate": 0.0025,
    "sigma": 4000,
    "baseHeight": 5000,
    "topHeight": 9000
  },
  "downdraft": {
    "centerX": 5000,
    "centerZ": 0,
    "peakDownwardVelocity": 20,
    "sigma": 2000,
    "baseHeight": -400,
    "topHeight": 3600
  },
  "nearGroundOutflow": {
    "centerX": 3000,
    "centerZ": 4000,
    "outflowStrainRate": 0.010991,
    "sigma": 1500,
    "baseHeight": 0,
    "topHeight": 800
  }
} as const);
export const E1_SPEC = immutable({
  "matrixId": "observed-c-matrix-e1/source-L500-3000-C0e10n0-alpha0p5/v1",
  "arithmeticSpecId": "observed-c-matrix-protocol/section-13",
  "implementationContractId": "observed-c-matrix-e1-implementation/v1",
  "evidenceSchemaId": "observed-c-matrix-e1-evidence/v1",
  "arithmeticBaseline": "f3451a197228f0ac7901f98c2e926d11883f65ba",
  "designBaseline": "9f3dfbca2e87b7755bcc2bdc7c93433161f839f5",
  "freezeCommit": "636deb316fdb50ff73b61c66524fbc829dec3f23",
  "layer": [
    500,
    3000
  ],
  "C0": [
    10,
    0
  ],
  "alpha": 0.5,
  "memberIds": [
    "C0",
    "parallel_plus",
    "parallel_minus",
    "right_plus",
    "right_minus"
  ],
  "probes": [
    {
      "id": "P1",
      "position": {
        "x": 2000,
        "y": 1750,
        "z": 4000
      }
    },
    {
      "id": "P2",
      "position": {
        "x": -4000,
        "y": 1750,
        "z": 2000
      }
    }
  ],
  "time": 0,
  "decompositionPolicy": "EXACT_ZERO_ONLY",
  "minimumReferenceSpeed": 5.820294390363779,
  "kernel": {
    "path": "src/data/escHrTimeAnalysis/escHrTimeHammingSincKernel.v1.json",
    "hash": "8658c3069dadb45ef63793a2b08ede15ebea73de26bcab9cfafcbcd648f3cdcc",
    "transformId": "esc-hr-time-hamming-sinc-lowpass",
    "transformVersion": "v1",
    "halfWidthS": 40,
    "provenance": {
      "transformId": "esc-hr-time-hamming-sinc-lowpass",
      "transformVersion": "v1",
      "samplingClass": "high-resolution-mobile-esc",
      "domain": "TIME",
      "cutoffWavelengthS": 40,
      "sampleIntervalS": 1,
      "tapCount": 81,
      "window": "Hamming",
      "phase": "zero",
      "gapPolicy": "integer-linear-uvh-max-5s",
      "boundaryPolicy": "half-sample-mirror",
      "outputCoordinate": "Source heights"
    }
  },
  "tolerances": {
    "hypot": {
      "factor": 8,
      "u": 1.1102230246251565e-16,
      "units": "m/s"
    },
    "wind": {
      "value": 1e-11,
      "units": "m/s"
    },
    "finiteOmega": {
      "value": 1e-14,
      "units": "s^-1"
    },
    "basis": {
      "value": 1e-12,
      "units": "1"
    },
    "decomposition": {
      "value": 1e-13,
      "units": "s^-1"
    },
    "squaredMagnitude": {
      "value": 1e-15,
      "units": "s^-2"
    },
    "localOmega": {
      "value": 1e-12,
      "units": "s^-1"
    },
    "gradient": {
      "value": 1e-15,
      "units": "s^-1"
    },
    "T1": {
      "value": 1e-12,
      "units": "s^-2"
    },
    "SRH": {
      "value": 0.000001,
      "units": "m^2/s^2"
    }
  },
  "cases": [
    {
      "id": "goshen-2009-observed",
      "sourceIdentity": "EOL 114.114 / DOI 10.5065/D6CC0Z0Q / Bushnell/NSSL1 / UTC 2009-06-05 21:55:22 / native concatenated NSSL_MGAUS_20090605.cls",
      "heightDatum": "ESC Alt minus header launch elevation 1557.9 m, rounded to 0.1 m → world Y, implied flat ground",
      "fixturePath": "src/data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json",
      "fixtureHash": "2658b6badd92694f7387eea31b957c4e5ccc19bcacf23f092561ba981f32c25e",
      "timePath": "src/data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.retained-time.json",
      "timeHash": "4101174b90769e6c53e0d9a987746e3a1aee6877b35494f4a0eeab9981637ace",
      "coverage": {
        "minHeight": 2.4,
        "maxHeight": 12261.8,
        "nativeDataRecordCount": 2082,
        "keptLevelCount": 2029,
        "droppedLevelCount": 53,
        "gapSpansOver50m": []
      },
      "brackets": [
        {
          "height": 500,
          "lower": {
            "index": 97,
            "knot": [
              497.6,
              -3,
              8.1
            ]
          },
          "upper": {
            "index": 98,
            "knot": [
              502.7,
              -3,
              8.1
            ]
          },
          "fraction": 0.4705882352941163
        },
        {
          "height": 3000,
          "lower": {
            "index": 502,
            "knot": [
              2993.6,
              8.8,
              6.3
            ]
          },
          "upper": {
            "index": 503,
            "knot": [
              3000.2,
              8.8,
              6.3
            ]
          },
          "fraction": 0.9696969696969968
        }
      ],
      "q0": [
        -3,
        8.1
      ],
      "q1": [
        8.8,
        6.3
      ],
      "delta": [
        11.8,
        -1.7999999999999998
      ],
      "S": 11.936498649101418,
      "Q": 142.48000000000002,
      "qRef": [
        2.9000000000000004,
        7.199999999999999
      ],
      "probeSegment": {
        "indices": [
          314,
          315
        ],
        "knots": [
          [
            1745.1,
            3.7,
            9.1
          ],
          [
            1751.8,
            3.7,
            9.2
          ]
        ],
        "times": [
          314,
          315
        ],
        "fullSupport": [
          40,
          2040
        ],
        "analysis": "FULL_SUPPORT"
      },
      "members": [
        {
          "id": "C0",
          "C": [
            10,
            0
          ],
          "reference": [
            -7.1,
            7.199999999999999
          ],
          "speed": 10.111874208078342,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "parallel_plus",
          "C": [
            15.9,
            -0.8999999999999999
          ],
          "reference": [
            -13,
            8.1
          ],
          "speed": 15.316984037335809,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "parallel_minus",
          "C": [
            4.1,
            0.8999999999999999
          ],
          "reference": [
            -1.1999999999999993,
            6.299999999999999
          ],
          "speed": 6.413267497929585,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "right_plus",
          "C": [
            9.1,
            -5.9
          ],
          "reference": [
            -6.199999999999999,
            13.1
          ],
          "speed": 14.49310180741169,
          "deltaSRH": 71.24000000000001,
          "normalized": 0.5
        },
        {
          "id": "right_minus",
          "C": [
            10.9,
            5.9
          ],
          "reference": [
            -8,
            1.299999999999999
          ],
          "speed": 8.104936767180853,
          "deltaSRH": -71.24000000000001,
          "normalized": -0.5
        }
      ]
    },
    {
      "id": "prospect-valley-2010-observed",
      "sourceIdentity": "EOL 114.114 / DOI 10.5065/D6CC0Z0Q / Mobile System/NSSL1 / UTC 2010-05-26 22:23:46 / native concatenated NSSL_MGAUS_20100526.cls",
      "heightDatum": "ESC Alt minus header launch elevation 1358.9 m, rounded to 0.1 m → world Y, implied flat ground",
      "fixturePath": "src/data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.normalized.json",
      "fixtureHash": "ae63145f676f6dc959dedef9ab0765ad26043df1fc40122da251e21c9fa80f63",
      "timePath": "src/data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.retained-time.json",
      "timeHash": "d48e944d1886b04551ff543c4e64a00e7b4452ea1e63c692d6ba41a68abf96e5",
      "coverage": {
        "minHeight": -0.1,
        "maxHeight": 14017.9,
        "nativeDataRecordCount": 2824,
        "keptLevelCount": 2733,
        "droppedLevelCount": 91,
        "gapSpansOver50m": []
      },
      "brackets": [
        {
          "height": 500,
          "lower": {
            "index": 87,
            "knot": [
              497.5,
              -8.3,
              12
            ]
          },
          "upper": {
            "index": 88,
            "knot": [
              502,
              -8.3,
              12.1
            ]
          },
          "fraction": 0.5555555555555556
        },
        {
          "height": 3000,
          "lower": {
            "index": 592,
            "knot": [
              2997.3,
              6.2,
              16
            ]
          },
          "upper": {
            "index": 593,
            "knot": [
              3001.4,
              6.2,
              16.1
            ]
          },
          "fraction": 0.6585365853658239
        }
      ],
      "q0": [
        -8.3,
        12.055555555555555
      ],
      "q1": [
        6.2,
        16.065853658536582
      ],
      "delta": [
        14.5,
        4.010298102981027
      ],
      "S": 15.044350796055415,
      "Q": 226.3324908747732,
      "qRef": [
        -1.0500000000000003,
        14.06070460704607
      ],
      "probeSegment": {
        "indices": [
          318,
          319
        ],
        "knots": [
          [
            1744.6,
            -0.8,
            14.4
          ],
          [
            1751.2,
            -0.7,
            14.3
          ]
        ],
        "times": [
          329,
          330
        ],
        "fullSupport": [
          39,
          2782
        ],
        "analysis": "FULL_SUPPORT"
      },
      "members": [
        {
          "id": "C0",
          "C": [
            10,
            0
          ],
          "reference": [
            -11.05,
            14.06070460704607
          ],
          "speed": 17.88311812986221,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "parallel_plus",
          "C": [
            17.25,
            2.0051490514905135
          ],
          "reference": [
            -18.3,
            12.055555555555557
          ],
          "speed": 21.914068991245934,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "parallel_minus",
          "C": [
            2.75,
            -2.0051490514905135
          ],
          "reference": [
            -3.8000000000000003,
            16.065853658536582
          ],
          "speed": 16.509138492892752,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "right_plus",
          "C": [
            12.005149051490513,
            -7.25
          ],
          "reference": [
            -13.055149051490513,
            21.31070460704607
          ],
          "speed": 24.991659560849662,
          "deltaSRH": 113.1662454373866,
          "normalized": 0.5
        },
        {
          "id": "right_minus",
          "C": [
            7.9948509485094865,
            7.25
          ],
          "reference": [
            -9.044850948509486,
            6.81070460704607
          ],
          "speed": 11.322324228054569,
          "deltaSRH": -113.1662454373866,
          "normalized": -0.5
        }
      ]
    },
    {
      "id": "dumas-2010-observed",
      "sourceIdentity": "EOL 114.114 / DOI 10.5065/D6CC0Z0Q / Mobile System/NSSL2 / UTC 2010-05-18 21:52:18 / native concatenated NSSL_MGAUS_20100518.cls",
      "heightDatum": "ESC Alt minus header launch elevation 1122.1 m, rounded to 0.1 m → world Y, implied flat ground",
      "fixturePath": "src/data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.normalized.json",
      "fixtureHash": "0c6d4546c61978599f31d152b27d564224792d9ccaba863ba0bb06537a1214b6",
      "timePath": "src/data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.retained-time.json",
      "timeHash": "43aa8dfe626a91ebe9ae4c96386cdd85b9f76e309c7626f978a05a6630134aba",
      "coverage": {
        "minHeight": -0.5,
        "maxHeight": 16025.6,
        "nativeDataRecordCount": 3022,
        "keptLevelCount": 2917,
        "droppedLevelCount": 105,
        "gapSpansOver50m": []
      },
      "brackets": [
        {
          "height": 500,
          "lower": {
            "index": 82,
            "knot": [
              494.5,
              -1.4,
              11.4
            ]
          },
          "upper": {
            "index": 83,
            "knot": [
              500.5,
              -1.5,
              11.3
            ]
          },
          "fraction": 0.9166666666666666
        },
        {
          "height": 3000,
          "lower": {
            "index": 611,
            "knot": [
              2998,
              10,
              18.2
            ]
          },
          "upper": {
            "index": 612,
            "knot": [
              3001.5,
              10,
              18.2
            ]
          },
          "fraction": 0.5714285714285714
        }
      ],
      "q0": [
        -1.4916666666666667,
        11.308333333333334
      ],
      "q1": [
        10,
        18.2
      ],
      "delta": [
        11.491666666666667,
        6.891666666666666
      ],
      "S": 13.399756423988542,
      "Q": 179.5534722222222,
      "qRef": [
        4.254166666666666,
        14.754166666666666
      ],
      "probeSegment": {
        "indices": [
          321,
          322
        ],
        "knots": [
          [
            1748.2,
            9.2,
            13.2
          ],
          [
            1752.5,
            9.2,
            13.2
          ]
        ],
        "times": [
          331,
          332
        ],
        "fullSupport": [
          39,
          2980
        ],
        "analysis": "FULL_SUPPORT"
      },
      "members": [
        {
          "id": "C0",
          "C": [
            10,
            0
          ],
          "reference": [
            -5.745833333333334,
            14.754166666666666
          ],
          "speed": 15.833509867436916,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "parallel_plus",
          "C": [
            15.745833333333334,
            3.445833333333333
          ],
          "reference": [
            -11.491666666666667,
            11.308333333333334
          ],
          "speed": 16.122555800975093,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "parallel_minus",
          "C": [
            4.254166666666666,
            -3.445833333333333
          ],
          "reference": [
            0,
            18.2
          ],
          "speed": 18.2,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "right_plus",
          "C": [
            13.445833333333333,
            -5.745833333333334
          ],
          "reference": [
            -9.191666666666666,
            20.5
          ],
          "speed": 22.46634674599124,
          "deltaSRH": 89.7767361111111,
          "normalized": 0.5
        },
        {
          "id": "right_minus",
          "C": [
            6.554166666666667,
            5.745833333333334
          ],
          "reference": [
            -2.3000000000000007,
            9.008333333333333
          ],
          "speed": 9.29731517398676,
          "deltaSRH": -89.7767361111111,
          "normalized": -0.5
        }
      ]
    },
    {
      "id": "moore-2013-observed",
      "sourceIdentity": "IGRA v2.2 USM00072357 / NCDC DSI-6301 (ncdc6301) / 2013-05-20 nominal 17 UTC / RELTIME 1651 / native POR USM00072357-data.txt",
      "heightDatum": "IGRA GPH minus sounding surface GPH 345 m → world Y, implied flat ground; station-list 344.9 m is not the subtracted datum",
      "fixturePath": "src/data/igra/fixtures/ounMoore20130520.normalized.json",
      "fixtureHash": "02d57851210da2213cd636c3ed88feb954c84018caa598f2f3401d97f2de47c2",
      "timePath": null,
      "timeHash": null,
      "coverage": {
        "minHeight": 0,
        "maxHeight": 30700,
        "nativeDataRecordCount": 165,
        "keptLevelCount": 165,
        "droppedLevelCount": 0,
        "gapSpansOver50m": [
          {
            "fromHeight": 0,
            "toHeight": 81,
            "delta": 81
          },
          {
            "fromHeight": 81,
            "toHeight": 362,
            "delta": 281
          },
          {
            "fromHeight": 385,
            "toHeight": 493,
            "delta": 108
          },
          {
            "fromHeight": 493,
            "toHeight": 663,
            "delta": 170
          },
          {
            "fromHeight": 663,
            "toHeight": 857,
            "delta": 194
          },
          {
            "fromHeight": 857,
            "toHeight": 1005,
            "delta": 148
          },
          {
            "fromHeight": 1005,
            "toHeight": 1116,
            "delta": 111
          },
          {
            "fromHeight": 1116,
            "toHeight": 1172,
            "delta": 56
          },
          {
            "fromHeight": 1172,
            "toHeight": 1263,
            "delta": 91
          },
          {
            "fromHeight": 1263,
            "toHeight": 1366,
            "delta": 103
          },
          {
            "fromHeight": 1419,
            "toHeight": 1496,
            "delta": 77
          },
          {
            "fromHeight": 1496,
            "toHeight": 1652,
            "delta": 156
          },
          {
            "fromHeight": 1744,
            "toHeight": 1840,
            "delta": 96
          },
          {
            "fromHeight": 1840,
            "toHeight": 2004,
            "delta": 164
          },
          {
            "fromHeight": 2004,
            "toHeight": 2331,
            "delta": 327
          },
          {
            "fromHeight": 2331,
            "toHeight": 2662,
            "delta": 331
          },
          {
            "fromHeight": 2662,
            "toHeight": 2758,
            "delta": 96
          },
          {
            "fromHeight": 2758,
            "toHeight": 2974,
            "delta": 216
          },
          {
            "fromHeight": 2974,
            "toHeight": 3321,
            "delta": 347
          },
          {
            "fromHeight": 3321,
            "toHeight": 3662,
            "delta": 341
          },
          {
            "fromHeight": 3662,
            "toHeight": 3781,
            "delta": 119
          },
          {
            "fromHeight": 3781,
            "toHeight": 4009,
            "delta": 228
          },
          {
            "fromHeight": 4009,
            "toHeight": 4193,
            "delta": 184
          },
          {
            "fromHeight": 4193,
            "toHeight": 4368,
            "delta": 175
          },
          {
            "fromHeight": 4368,
            "toHeight": 4730,
            "delta": 362
          },
          {
            "fromHeight": 4730,
            "toHeight": 5073,
            "delta": 343
          },
          {
            "fromHeight": 5080,
            "toHeight": 5381,
            "delta": 301
          },
          {
            "fromHeight": 5430,
            "toHeight": 5557,
            "delta": 127
          },
          {
            "fromHeight": 5557,
            "toHeight": 5716,
            "delta": 159
          },
          {
            "fromHeight": 5716,
            "toHeight": 6023,
            "delta": 307
          },
          {
            "fromHeight": 6023,
            "toHeight": 6335,
            "delta": 312
          },
          {
            "fromHeight": 6335,
            "toHeight": 6636,
            "delta": 301
          },
          {
            "fromHeight": 6636,
            "toHeight": 6968,
            "delta": 332
          },
          {
            "fromHeight": 6968,
            "toHeight": 7101,
            "delta": 133
          },
          {
            "fromHeight": 7101,
            "toHeight": 7337,
            "delta": 236
          },
          {
            "fromHeight": 7337,
            "toHeight": 7694,
            "delta": 357
          },
          {
            "fromHeight": 7694,
            "toHeight": 8027,
            "delta": 333
          },
          {
            "fromHeight": 8027,
            "toHeight": 8227,
            "delta": 200
          },
          {
            "fromHeight": 8227,
            "toHeight": 8388,
            "delta": 161
          },
          {
            "fromHeight": 8388,
            "toHeight": 8567,
            "delta": 179
          },
          {
            "fromHeight": 8567,
            "toHeight": 8685,
            "delta": 118
          },
          {
            "fromHeight": 8685,
            "toHeight": 8955,
            "delta": 270
          },
          {
            "fromHeight": 8955,
            "toHeight": 9096,
            "delta": 141
          },
          {
            "fromHeight": 9135,
            "toHeight": 9195,
            "delta": 60
          },
          {
            "fromHeight": 9195,
            "toHeight": 9425,
            "delta": 230
          },
          {
            "fromHeight": 9425,
            "toHeight": 9662,
            "delta": 237
          },
          {
            "fromHeight": 9662,
            "toHeight": 9913,
            "delta": 251
          },
          {
            "fromHeight": 9913,
            "toHeight": 10188,
            "delta": 275
          },
          {
            "fromHeight": 10188,
            "toHeight": 10356,
            "delta": 168
          },
          {
            "fromHeight": 10356,
            "toHeight": 10495,
            "delta": 139
          },
          {
            "fromHeight": 10495,
            "toHeight": 10666,
            "delta": 171
          },
          {
            "fromHeight": 10666,
            "toHeight": 10792,
            "delta": 126
          },
          {
            "fromHeight": 10792,
            "toHeight": 11064,
            "delta": 272
          },
          {
            "fromHeight": 11077,
            "toHeight": 11314,
            "delta": 237
          },
          {
            "fromHeight": 11314,
            "toHeight": 11577,
            "delta": 263
          },
          {
            "fromHeight": 11577,
            "toHeight": 11730,
            "delta": 153
          },
          {
            "fromHeight": 11730,
            "toHeight": 11792,
            "delta": 62
          },
          {
            "fromHeight": 11866,
            "toHeight": 12093,
            "delta": 227
          },
          {
            "fromHeight": 12093,
            "toHeight": 12176,
            "delta": 83
          },
          {
            "fromHeight": 12176,
            "toHeight": 12229,
            "delta": 53
          },
          {
            "fromHeight": 12229,
            "toHeight": 12443,
            "delta": 214
          },
          {
            "fromHeight": 12443,
            "toHeight": 12710,
            "delta": 267
          },
          {
            "fromHeight": 12710,
            "toHeight": 12785,
            "delta": 75
          },
          {
            "fromHeight": 12785,
            "toHeight": 13066,
            "delta": 281
          },
          {
            "fromHeight": 13066,
            "toHeight": 13249,
            "delta": 183
          },
          {
            "fromHeight": 13249,
            "toHeight": 13350,
            "delta": 101
          },
          {
            "fromHeight": 13350,
            "toHeight": 13557,
            "delta": 207
          },
          {
            "fromHeight": 13557,
            "toHeight": 13642,
            "delta": 85
          },
          {
            "fromHeight": 13662,
            "toHeight": 13975,
            "delta": 313
          },
          {
            "fromHeight": 13975,
            "toHeight": 14217,
            "delta": 242
          },
          {
            "fromHeight": 14217,
            "toHeight": 14287,
            "delta": 70
          },
          {
            "fromHeight": 14287,
            "toHeight": 14342,
            "delta": 55
          },
          {
            "fromHeight": 14342,
            "toHeight": 14562,
            "delta": 220
          },
          {
            "fromHeight": 14611,
            "toHeight": 14906,
            "delta": 295
          },
          {
            "fromHeight": 14906,
            "toHeight": 14979,
            "delta": 73
          },
          {
            "fromHeight": 14979,
            "toHeight": 15063,
            "delta": 84
          },
          {
            "fromHeight": 15063,
            "toHeight": 15141,
            "delta": 78
          },
          {
            "fromHeight": 15141,
            "toHeight": 15235,
            "delta": 94
          },
          {
            "fromHeight": 15235,
            "toHeight": 15526,
            "delta": 291
          },
          {
            "fromHeight": 15526,
            "toHeight": 15765,
            "delta": 239
          },
          {
            "fromHeight": 15765,
            "toHeight": 15816,
            "delta": 51
          },
          {
            "fromHeight": 15816,
            "toHeight": 16101,
            "delta": 285
          },
          {
            "fromHeight": 16101,
            "toHeight": 16161,
            "delta": 60
          },
          {
            "fromHeight": 16161,
            "toHeight": 16404,
            "delta": 243
          },
          {
            "fromHeight": 16404,
            "toHeight": 16711,
            "delta": 307
          },
          {
            "fromHeight": 16711,
            "toHeight": 17004,
            "delta": 293
          },
          {
            "fromHeight": 17004,
            "toHeight": 17173,
            "delta": 169
          },
          {
            "fromHeight": 17173,
            "toHeight": 17293,
            "delta": 120
          },
          {
            "fromHeight": 17293,
            "toHeight": 17420,
            "delta": 127
          },
          {
            "fromHeight": 17420,
            "toHeight": 17529,
            "delta": 109
          },
          {
            "fromHeight": 17529,
            "toHeight": 17602,
            "delta": 73
          },
          {
            "fromHeight": 17602,
            "toHeight": 17935,
            "delta": 333
          },
          {
            "fromHeight": 17935,
            "toHeight": 18238,
            "delta": 303
          },
          {
            "fromHeight": 18238,
            "toHeight": 18324,
            "delta": 86
          },
          {
            "fromHeight": 18324,
            "toHeight": 18550,
            "delta": 226
          },
          {
            "fromHeight": 18550,
            "toHeight": 18868,
            "delta": 318
          },
          {
            "fromHeight": 18910,
            "toHeight": 19178,
            "delta": 268
          },
          {
            "fromHeight": 19178,
            "toHeight": 19346,
            "delta": 168
          },
          {
            "fromHeight": 19346,
            "toHeight": 19488,
            "delta": 142
          },
          {
            "fromHeight": 19488,
            "toHeight": 19642,
            "delta": 154
          },
          {
            "fromHeight": 19642,
            "toHeight": 19809,
            "delta": 167
          },
          {
            "fromHeight": 19809,
            "toHeight": 20124,
            "delta": 315
          },
          {
            "fromHeight": 20124,
            "toHeight": 20393,
            "delta": 269
          },
          {
            "fromHeight": 20432,
            "toHeight": 20626,
            "delta": 194
          },
          {
            "fromHeight": 20626,
            "toHeight": 20754,
            "delta": 128
          },
          {
            "fromHeight": 20754,
            "toHeight": 21078,
            "delta": 324
          },
          {
            "fromHeight": 21078,
            "toHeight": 21217,
            "delta": 139
          },
          {
            "fromHeight": 21217,
            "toHeight": 21408,
            "delta": 191
          },
          {
            "fromHeight": 21408,
            "toHeight": 21742,
            "delta": 334
          },
          {
            "fromHeight": 21742,
            "toHeight": 21870,
            "delta": 128
          },
          {
            "fromHeight": 21870,
            "toHeight": 22076,
            "delta": 206
          },
          {
            "fromHeight": 22076,
            "toHeight": 22410,
            "delta": 334
          },
          {
            "fromHeight": 22410,
            "toHeight": 22744,
            "delta": 334
          },
          {
            "fromHeight": 22744,
            "toHeight": 23082,
            "delta": 338
          },
          {
            "fromHeight": 23082,
            "toHeight": 23410,
            "delta": 328
          },
          {
            "fromHeight": 23427,
            "toHeight": 23624,
            "delta": 197
          },
          {
            "fromHeight": 23624,
            "toHeight": 23747,
            "delta": 123
          },
          {
            "fromHeight": 23784,
            "toHeight": 24144,
            "delta": 360
          },
          {
            "fromHeight": 24144,
            "toHeight": 24499,
            "delta": 355
          },
          {
            "fromHeight": 24499,
            "toHeight": 24836,
            "delta": 337
          },
          {
            "fromHeight": 24836,
            "toHeight": 25170,
            "delta": 334
          },
          {
            "fromHeight": 25170,
            "toHeight": 25457,
            "delta": 287
          },
          {
            "fromHeight": 25457,
            "toHeight": 25517,
            "delta": 60
          },
          {
            "fromHeight": 25517,
            "toHeight": 25879,
            "delta": 362
          },
          {
            "fromHeight": 25879,
            "toHeight": 26228,
            "delta": 349
          },
          {
            "fromHeight": 26242,
            "toHeight": 26581,
            "delta": 339
          },
          {
            "fromHeight": 26581,
            "toHeight": 26693,
            "delta": 112
          },
          {
            "fromHeight": 26693,
            "toHeight": 26915,
            "delta": 222
          },
          {
            "fromHeight": 26915,
            "toHeight": 27272,
            "delta": 357
          },
          {
            "fromHeight": 27272,
            "toHeight": 27389,
            "delta": 117
          },
          {
            "fromHeight": 27389,
            "toHeight": 27635,
            "delta": 246
          },
          {
            "fromHeight": 27635,
            "toHeight": 27994,
            "delta": 359
          },
          {
            "fromHeight": 27994,
            "toHeight": 28352,
            "delta": 358
          },
          {
            "fromHeight": 28352,
            "toHeight": 28570,
            "delta": 218
          },
          {
            "fromHeight": 28570,
            "toHeight": 28743,
            "delta": 173
          },
          {
            "fromHeight": 28743,
            "toHeight": 29067,
            "delta": 324
          },
          {
            "fromHeight": 29067,
            "toHeight": 29139,
            "delta": 72
          },
          {
            "fromHeight": 29139,
            "toHeight": 29499,
            "delta": 360
          },
          {
            "fromHeight": 29499,
            "toHeight": 29655,
            "delta": 156
          },
          {
            "fromHeight": 29655,
            "toHeight": 29834,
            "delta": 179
          },
          {
            "fromHeight": 29834,
            "toHeight": 30192,
            "delta": 358
          },
          {
            "fromHeight": 30192,
            "toHeight": 30262,
            "delta": 70
          },
          {
            "fromHeight": 30262,
            "toHeight": 30589,
            "delta": 327
          },
          {
            "fromHeight": 30589,
            "toHeight": 30700,
            "delta": 111
          }
        ]
      },
      "brackets": [
        {
          "height": 500,
          "lower": {
            "index": 4,
            "knot": [
              493,
              2.0563361125971737,
              8.24751367334597
            ]
          },
          "upper": {
            "index": 5,
            "knot": [
              663,
              2.6140723555354555,
              9.755850845519591
            ]
          },
          "fraction": 0.041176470588235294
        },
        {
          "height": 3000,
          "lower": {
            "index": 23,
            "knot": [
              2974,
              14.935154964868444,
              15.465805707280998
            ]
          },
          "upper": {
            "index": 24,
            "knot": [
              3321,
              14.990663761154806,
              14.99066376115481
            ]
          },
          "fraction": 0.07492795389048991
        }
      ],
      "q0": [
        2.0793017226005146,
        8.309621674553119
      ],
      "q1": [
        14.939314125397106,
        15.430204293450217
      ],
      "delta": [
        12.860012402796592,
        7.120582618897098
      ],
      "S": 14.699748835698575,
      "Q": 216.08261583262163,
      "qRef": [
        8.50930792399881,
        11.869912984001669
      ],
      "probeSegment": {
        "indices": [
          17,
          18
        ],
        "knots": [
          [
            1744,
            16.531755057978962,
            12.457570979247398
          ],
          [
            1840,
            15.21215699367874,
            14.185565889299978
          ]
        ],
        "times": null,
        "fullSupport": null,
        "analysis": "COLUMN_UNAVAILABLE"
      },
      "members": [
        {
          "id": "C0",
          "C": [
            10,
            0
          ],
          "reference": [
            -1.4906920760011904,
            11.869912984001669
          ],
          "speed": 11.963151637976681,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "parallel_plus",
          "C": [
            16.430006201398296,
            3.560291309448549
          ],
          "reference": [
            -7.920698277399486,
            8.30962167455312
          ],
          "speed": 11.479863830891121,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "parallel_minus",
          "C": [
            3.569993798601704,
            -3.560291309448549
          ],
          "reference": [
            4.939314125397106,
            15.430204293450217
          ],
          "speed": 16.201482295362883,
          "deltaSRH": 0,
          "normalized": 0
        },
        {
          "id": "right_plus",
          "C": [
            13.560291309448548,
            -6.430006201398296
          ],
          "reference": [
            -5.050983385449738,
            18.299919185399965
          ],
          "speed": 18.984190142122443,
          "deltaSRH": 108.04130791631081,
          "normalized": 0.5
        },
        {
          "id": "right_minus",
          "C": [
            6.439708690551451,
            6.430006201398296
          ],
          "reference": [
            2.0695992334473585,
            5.439906782603373
          ],
          "speed": 5.820294390363779,
          "deltaSRH": -108.04130791631081,
          "normalized": -0.5
        }
      ]
    }
  ]
} as const);
/** SHA-256 of JSON.stringify({spec:E1_SPEC,storm:FROZEN_E1_STORM_ONLY}). */
export const FROZEN_MANIFEST_SHA256 = '13d0073d1babe3b571f4ddeaade35851e6b7224d0b92dd87f4cf057bcdd55765';
export type E1Case = (typeof E1_SPEC.cases)[number];
export type E1Member = E1Case['members'][number];
