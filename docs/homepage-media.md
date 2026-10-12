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
