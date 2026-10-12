# Homepage abstract and camera previews

The abstract is restored verbatim from the reviewed ICRA manuscript, with only
LaTeX dashes converted for the web. Its source revision is retained in
`data/project-abstract.json`. Do not replace it with a short website blurb.

The five GIFs are recovered from the local
`VIOverse_Supplementary_Video_paper_matched.pptx`, which also accompanies
`VIOverse_ICRA2027_Final.mp4`. Dataset-to-asset mapping is explicit in slide 2;
slide 1 notes record the underlying footage sources. The original video and
PowerPoint remain unchanged.

These are dataset input previews. They are not estimator outputs or the fixed
profiling inputs. In particular, AQUALOC uses Harbor 07, while GrandTour uses
mission 2024-10-01-11-29-55. LaMAria uses the R_02_easy black-and-white preview;
its combined views do not imply stereo evaluation. EuRoC and UZH-FPV sequence
names are unspecified in the recovered source records.

Dataset source pages and credits appear in the preview metadata and image
titles. The older detailed source files named in the slides, SOURCES_AND_USAGE.md
and GRANDTOUR_GIF_SOURCE.md, were not found; do not invent their contents or
reuse a static thumbnail URL as a GIF source. No numerical result is copied
from the supplementary video.

To regenerate the previews from the preserved source package:

```sh
python3 -m pip install Pillow imageio-ffmpeg
python3 scripts/build-homepage-previews.py /path/to/VIOverse_Supplementary_Video_paper_matched.pptx
```

The script preserves all source frames and their combined duration, reduces
display resolution and palette size, and exports first-frame posters for
the pause control and reduced-motion preference. Browsers use a smaller
animated WebP of the same source frames; the actual GIF is retained as the
fallback. Exactly identical adjacent frames may share one WebP frame with
their combined duration; distinct frames and playback duration are preserved.
Hashes and source identities
are retained in `data/dataset-input-previews.json`.

## Scientific result previews

The homepage result section displays the approved paper SR, ATE/RPE, and Desktop resource SVGs
at full width, switching between them to preserve readable system and numeric
labels. It does not introduce new aggregates or discussion cases. On narrow
screens, the plot scrolls horizontally instead of shrinking all labels.

```sh
python3 scripts/sync-homepage-result-figures.py /path/to/paper-checkout
```

The script checks the paper aggregate source hashes against the current
website source metadata before copying the trajectory figures. For the resource
figure, it checks the source revision and Desktop source-table hash, then compares
every plotted configuration/input identity, reported mean, and timing definition
against `current-efficiency.json`. SVG point identities, coordinates, CPU colors,
and circle diameters are also checked against the paper plotting CSV.
The current 39 points include SVO on all five
inputs; SVO's source-reported frontend-plus-backend sum is identified in the caption.
Source identities,
figure hashes, and dimensions are retained in `data/homepage-result-figures.json`.
Do not copy numbers from these rendered previews to update any result table.

The resource SVG uses the Computer Modern `cmex10` font's encoded `p` glyph
for the square-root symbol. Browsers without that font display a literal p.
The import script outlines only these five radical glyphs, using their original
font geometry, size, and baseline; it preserves the VINS text, overbar, labels,
and all measured marks. The original paper SHA and webpage derivative SHA
are recorded separately. SR and ATE/RPE SVGs are copied byte-for-byte.

## Tutorial entry

The homepage groups the existing nine chapter outlines into notation and sensing,
calibration and estimation, and evaluation and implementation. A visible entry
links to the full contents. The preparation notice remains: chapter text is not
yet supplied. Do not replace the withdrawn material with invented teaching text
or a third-party reading list.
