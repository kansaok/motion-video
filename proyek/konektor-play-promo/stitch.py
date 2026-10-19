# Usage: stitch.py out.png part1.png part2.png  (two 780x844 halves of a 390x844 @2x phone screen)
import sys
from PIL import Image
out, *parts = sys.argv[1:]
ims = [Image.open(p).convert('RGB') for p in parts]
c = Image.new('RGB', (ims[0].width, sum(i.height for i in ims)))
y = 0
for i in ims:
    c.paste(i, (0, y)); y += i.height
c.save(out)
print(out, c.size)
