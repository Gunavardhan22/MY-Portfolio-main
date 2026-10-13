# Runs the isnet-anime model directly (same pre/post-processing as rembg's DisSession).
import sys, numpy as np, onnxruntime as ort
from PIL import Image
src, model, out = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGB')
x = np.asarray(im.resize((1024, 1024), Image.LANCZOS), dtype=np.float32) / 255.0
x = (x - np.array([0.485, 0.456, 0.406], dtype=np.float32)) / np.array([1.0, 1.0, 1.0], dtype=np.float32)
x = x.transpose(2, 0, 1)[None].astype(np.float32)
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
pred = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
mask = Image.fromarray((pred * 255).astype(np.uint8)).resize(im.size, Image.LANCZOS)
mask.save(out)
cut = im.copy(); cut.putalpha(mask)
cut.save(out.replace('.png', '-cutout.png'))
print('done', mask.size)
