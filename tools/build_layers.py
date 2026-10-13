# Builds the 2.5D layers for the hero portrait from the source image + character mask.
import sys, os, numpy as np
from PIL import Image, ImageFilter
SRC, MASK, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert('RGB')
W, H = img.size
I = np.asarray(img, dtype=np.float32) / 255.0
A = np.asarray(Image.open(MASK).convert('L'), dtype=np.float32) / 255.0
a = np.clip((A - 0.06) / 0.88, 0, 1)                      # tighten the soft matte

def pil(x): return Image.fromarray(np.clip(x * 255, 0, 255).astype(np.uint8))
def arr(im): return np.asarray(im, dtype=np.float32) / 255.0
def blur(x, r): return arr(pil(x).filter(ImageFilter.GaussianBlur(r)))
def dilate(x, size): return arr(pil(x).filter(ImageFilter.MaxFilter(size)))

# 1. Sky plate: remove the character and fill the hole by push-pull interpolation.
unknown = dilate((a > 0.02).astype(np.float32), 13) > 0.5
known = (~unknown).astype(np.float32)
def up2(x, shape):
    # Smooth (bilinear) upsampling, channel by channel.
    return np.stack([np.asarray(Image.fromarray(x[..., c].astype(np.float32), 'F').resize((shape[1], shape[0]), Image.BILINEAR)) for c in range(x.shape[2])], -1)
def push_pull(img, w):
    # img holds colour*weight sums, w holds weight sums. Returns normalised colours.
    if min(img.shape[:2]) <= 4:
        total = img.reshape(-1, 3).sum(0) / max(w.sum(), 1e-6)
        return np.where(w[..., None] > 0, img / np.maximum(w[..., None], 1e-6), total)
    h2, w2 = img.shape[0] // 2, img.shape[1] // 2
    ci = img[:h2*2, :w2*2].reshape(h2, 2, w2, 2, 3).sum((1, 3))
    cw = w[:h2*2, :w2*2].reshape(h2, 2, w2, 2).sum((1, 3))
    up = up2(push_pull(ci, cw), img.shape[:2])
    est = img / np.maximum(w[..., None], 1e-6)
    t = np.clip(w, 0, 1)[..., None]
    return est * t + up * (1 - t)
filled = push_pull(I * known[..., None], known)
filled = np.stack([blur(np.clip(filled[..., c], 0, 1), 8) for c in range(3)], -1)
plate = np.where(unknown[..., None], filled, I)
edge = blur(unknown.astype(np.float32), 5)[..., None]          # feather the seam
plate = filled * edge + I * (1 - edge)
pil(plate).save(os.path.join(OUT, 'sky.webp'), quality=88, method=6)

# 2. Character with sky-coloured fringes removed: F = (I - (1-a)·B) / a.
aa = a[..., None]
F = np.where(aa > 0.98, I, np.clip((I - (1 - aa) * plate) / np.maximum(aa, 0.05), 0, 1))
F = np.where(aa < 0.02, plate, F)
char = Image.fromarray(np.concatenate([np.clip(F * 255, 0, 255), a[..., None] * 255], -1).astype(np.uint8), 'RGBA')
char.save(os.path.join(OUT, 'character.webp'), quality=90, alpha_quality=100, method=6)

# 3. Region masks.
R, G, B = I[..., 0], I[..., 1], I[..., 2]
lum = 0.299 * R + 0.587 * G + 0.114 * B
yy, xx = np.mgrid[0:H, 0:W]
u, v = xx / W, yy / H

face_box = ((u > 0.35) & (u < 0.64) & (v > 0.37) & (v < 0.60)).astype(np.float32)
eye_core = ((lum > 0.80) & (B > 0.88) & (B > R + 0.04) & (u > 0.38) & (u < 0.58) & (v > 0.40) & (v < 0.47) & (a > 0.5)).astype(np.float32)
skin = ((R > B + 0.05) & (R > 0.35) & (a > 0.5)).astype(np.float32)
hair_raw = ((B >= R + 0.02) & (lum > 0.42) & (a > 0.5) & (v < 0.62)).astype(np.float32)
hair_raw = arr(pil(hair_raw).filter(ImageFilter.MedianFilter(5)))
hair_raw = hair_raw * (1 - dilate(eye_core, 15))

# Hair sway weight: zero near the scalp and over the face, rising toward the tips.
ys, xs = np.nonzero(hair_raw > 0.5)
cx, cy = xs.mean(), ys.mean() + 0.05 * H                     # pivot a little below the hair centroid
dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / W
tips = np.clip((dist - 0.10) / 0.16, 0, 1)
hair_w = blur(dilate(hair_raw, 11), 5) * tips * (1 - blur(face_box, 12))
hair_w = np.clip(hair_w / max(hair_w.max(), 1e-6), 0, 1)

# Depth: sky 0; character from 0.6 (lower body) to 0.9 (head and hand), as one smooth
# vertical gradient so no feature crosses a depth step and nothing shears.
grad = np.clip((0.78 - v) / 0.33, 0, 1)
depth = blur(a, 3) * (0.6 + 0.3 * grad)

# Eye glow: a bright core plus a soft halo.
glow = blur(eye_core, 3) * 0.6 + blur(eye_core, 12) * 3.0
glow = np.clip(glow / max(glow.max(), 1e-6), 0, 1)

maps = np.stack([depth, hair_w, glow], -1)
pil(maps).save(os.path.join(OUT, 'maps.png'), optimize=True)

# Static fallback / poster.
img.save(os.path.join(OUT, 'poster.jpg'), quality=86, optimize=True, progressive=True)
img.save(os.path.join(OUT, 'poster.webp'), quality=84, method=6)
print('eyes px:', int(eye_core.sum()), 'hair px:', int(hair_raw.sum()), 'pivot:', round(cx), round(cy))
for f in sorted(os.listdir(OUT)): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
