#!/bin/bash
# Render every roster deck to PNGs so the visual result can actually be checked.
#   ./scripts/render.sh            -> /tmp/png/*.png + /tmp/covers.png + /tmp/content.png
set -e
SOF=/Applications/LibreOffice.app/Contents/MacOS/soffice
rm -rf /tmp/pdf /tmp/png && mkdir -p /tmp/pdf /tmp/png
"$SOF" --headless --norestore --convert-to pdf --outdir /tmp/pdf /tmp/pptx/*.pptx >/dev/null 2>&1
cd /tmp/pdf
for f in *.pdf; do pdftoppm -png -r 60 -f 1 -l 6 "$f" "/tmp/png/${f%.pdf}"; done
python3 - <<'PY'
import glob
from PIL import Image
for sel, out in (('*-01.png','/tmp/covers.png'), ('*-04.png','/tmp/content.png')):
    fs = sorted(glob.glob('/tmp/png/'+sel))
    if not fs: continue
    ims=[Image.open(f) for f in fs]; w,h=ims[0].size
    cols=3; rows=(len(ims)+cols-1)//cols
    sheet=Image.new('RGB',(w*cols,h*rows),(40,40,40))
    for i,im in enumerate(ims): sheet.paste(im.resize((w,h)),((i%cols)*w,(i//cols)*h))
    sheet.save(out); print('wrote', out, len(ims), 'pages')
PY
