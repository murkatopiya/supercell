# Third-party notices and data attribution

## License scope

[LICENSE.md](LICENSE.md) applies to Iryna-owned Supercell Explorer code.
It does not relicense external observations, third-party dependencies/assets,
or adapted upstream material. Those materials retain the terms identified
below. This notice attributes source data separately from
[the software citation](CITATION.cff); it claims no ownership of observations.

## EOL 114.114 — Goshen, Prospect Valley and Dumas

Citation: NSF NCAR Earth Observing Laboratory. (2010).
*NOAA/NSSL MGAUS Radiosonde Data — EOL Sounding Composite Format*. Version 1.0.
NSF NCAR Earth Observing Laboratory.
DOI: [10.5065/D6CC0Z0Q](https://doi.org/10.5065/D6CC0Z0Q).

[Dataset metadata](https://data.ucar.edu/dataset/noaa-nssl-mgaus-radiosonde-data-eol-sounding-composite-format)
reports no legal/access constraints.
[UCAR data-repository terms](https://www.ucar.edu/terms-of-use/data) apply
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode) to
copyright-protected materials unless otherwise stated; unprotected materials
may be used for any lawful purpose. Preserve these source terms when
redistributing the subsets; the project-code license does not restrict
rights granted in the source data. UCAR supplies repository materials
as-is, without warranties, including non-infringement, merchantability or
fitness for a particular purpose; see the linked terms for the full disclaimer.

Included transformed subsets in `src/data/eolNsslMgausEsc/fixtures/`:

| Files | Selected launch (UTC) | Native source |
| --- | --- | --- |
| `nssl1Goshen2155.normalized.json`, `nssl1Goshen2155.retained-time.json` | NSSL1 / Bushnell, 2009-06-05 21:55:22 | `NSSL_MGAUS_20090605.cls` |
| `nssl1ProspectValley222346.normalized.json`, `nssl1ProspectValley222346.retained-time.json` | NSSL1, 2010-05-26 22:23:46 | `NSSL_MGAUS_20100526.cls` |
| `nssl2Dumas215218.normalized.json`, `nssl2Dumas215218.retained-time.json` | NSSL2, 2010-05-18 21:52:18 | `NSSL_MGAUS_20100518.cls` |

These are normalized/transformed subsets, not native archive bytes.
The adapter selects the launch, excludes missing/bad wind and missing altitude,
preserves native order and U/V in m/s, subtracts launch elevation from altitude,
and rounds height to 0.1 m. Retained-time siblings preserve matching time samples.
Production Analysis reconstructs a 1 s time grid with bounded interpolation
and applies an 81-tap Hamming-sinc low-pass with mirror boundaries; it is a
processed explanation, not a replacement for observed Source wind.

Source-derived summaries and plots in `docs/research/artifacts/` (EOL case
qualification, hodographs, flight-phase, spectral/processing and filter
comparisons) also use these observations and retain this data attribution.
Their project-authored analysis does not confer ownership over measurements.
See [source qualification](docs/research/2026-08-28-vortex2-source-qualification.md)
and [Analysis transform methodology](docs/research/2026-08-28-high-resolution-esc-analysis-transform-decision.md).

Acknowledgement: operational, technical and scientific support was provided
by NSF NCAR Earth Observing Laboratory, sponsored by the National Science
Foundation. Attribution does not imply endorsement of Supercell Explorer.

## NOAA/NCEI IGRA — Moore / OUN

Dataset citation: Durre, Imke; Yin, Xungang; Vose, Russell S.; Applequist, Scott;
Arnfield, Jeff; Korzeniewski, Bryant; Hundermark, Bruce. (2016).
*Integrated Global Radiosonde Archive (IGRA), Version 2*.
Subset: USM00072357 / Norman (OUN), 2013-05-20 nominal 17 UTC, RELTIME 1651.
NOAA National Centers for Environmental Information.
DOI: [10.7289/V5X63K0Q](https://doi.org/10.7289/V5X63K0Q).
Files used are IGRA v2.2. The original retrieval date is not established here.

[IGRA archive metadata](https://www.ncei.noaa.gov/metadata/geoportal/rest/metadata/item/gov.noaa.ncdc:C00975/html)
identifies archive DSI 6353_01. The selected sounding's `P_SRC` and `NP_SRC`
are `ncdc6301`: NCDC U.S. Rawindsonde Data / DSI-6301, an underlying input
source identifier, not a license or identifier for the whole IGRA archive.

Included subset:
`src/data/igra/fixtures/ounMoore20130520.normalized.json`.
Processing excludes missing GPH/WDIR/WSPD, converts meteorological
direction/speed to U/V, subtracts sounding surface GPH 345 m and orders
levels by height. No native station archive is included.
[Source-qualification evidence](docs/research/2026-08-28-moore-oun-igra-source-qualification.md)
and its research summary retain this attribution.

[NOAA/NCEI data policy](https://www.ncei.noaa.gov/data-submission/data-licensing)
places federal observations in the public domain in the United States.
This statement concerns the selected U.S. source, not every international
input to IGRA. Preserve the dataset citation and applicable source terms.
NOAA/NCEI provides no warranty of accuracy, reliability or completeness;
users are responsible for determining suitability and their application results.
The normalized observations are excluded from the project-code license.

## Leise research sampler — adapted upstream material

`docs/research/sample-leise-filter-response.mjs` adapts the one-dimensional
Leise T5FLTR filtering/control sequence (Jim Leise, 8/80) to JavaScript,
with project-specific sampling, comparisons and reporting. It is modified
research software, not the original UCAR implementation and not a production filter.

Upstream: [NCAR/lrose-cedric, T5FLTR.f](https://github.com/NCAR/lrose-cedric/blob/master/cedric/legacy/svn-trunk/T5FLTR.f).
This file matches the referenced NCAR/RadarAnalysisTools CEDRIC source.
Permission: [LROSE COPYING](https://github.com/NCAR/lrose-cedric/blob/master/COPYING).
The adapted upstream portions retain the following license, outside the
project-code license. Scientific citation alone does not replace this notice.

```text
LROSE BSD LICENSE
=================

Copyright (c) 1990 - 2016, University Corporation for Atmospheric
Research (UCAR), Boulder, Colorado, USA.  All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

1) If the software is modified to produce derivative works, such
modified software should be clearly marked, so as not to confuse it
with the version available from UCAR.

2) Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.

3) Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

4) Neither the name of UCAR nor the names of its contributors, if any,
may be used to endorse or promote products derived from this software
without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## Production dependencies

React, React DOM and scheduler retain Meta's MIT notice. Three.js retains
the three.js authors' MIT notice. The project license does not relicense them.
Preserve these notices with redistributed builds containing their code.
Installed development/build dependencies retain their own package licenses;
`package-lock.json` identifies the resolved packages. This notice does not
claim that all development dependencies use MIT.

### React / React DOM / scheduler

```text
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Three.js

```text
The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Logo provenance

Supercell Explorer logo generated with ChatGPT at Iryna Hnatovska's
request and selected by Iryna. It was created specifically for this project,
not knowingly taken from third-party artwork. This statement does not claim
exclusive copyright or uniqueness of the generated image. The project-code
license does not itself grant an asset license.
