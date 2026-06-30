import os
import io
from flask import Flask, render_template, request, send_file
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/process', methods=['POST'])
def process_image():
    file = request.files.get('image')
    if not file:
        return "No image uploaded", 400

    img = Image.open(file.stream).convert("RGBA")

    wm_type = request.form.get('type', 'text')
    opacity = float(request.form.get('opacity', 0.7))
    rotation = -int(request.form.get('rotation', 0))  # FIX rotation direction
    position = request.form.get('position', 'bottom-right')
    spacing = int(request.form.get('spacing', 100))

    txt_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    margin = 40
    watermark_item = None

    # ================= TEXT WATERMARK =================
    if wm_type == 'text':
        text = request.form.get('text', 'Copyright')
        color_hex = request.form.get('color', '#ffffff')
        font_size = int(request.form.get('size', 48))

        r = int(color_hex[1:3], 16)
        g = int(color_hex[3:5], 16)
        b = int(color_hex[5:7], 16)
        fill_color = (r, g, b, int(255 * opacity))

        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

        # 🔥 REAL TEXT SIZE (matches canvas)
        temp_draw = ImageDraw.Draw(txt_layer)
        bbox = temp_draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

        # Padding only for rotation safety (NOT for spacing)
        pad = int(font_size * 1.5)

        watermark_item = Image.new('RGBA', (tw + pad, th + pad), (0, 0, 0, 0))
        item_draw = ImageDraw.Draw(watermark_item)
        item_draw.text((pad // 2, pad // 2), text, font=font, fill=fill_color)

        # ✅ USE TEXT SIZE FOR TILING (IMPORTANT FIX)
        orig_w, orig_h = tw, th

        if rotation != 0:
            watermark_item = watermark_item.rotate(rotation, expand=True, resample=Image.BICUBIC)

    # ================= IMAGE WATERMARK =================
    elif wm_type == 'image':
        logo_file = request.files.get('logo')
        if logo_file:
            logo = Image.open(logo_file.stream).convert("RGBA")

            scale_percent = float(request.form.get('scale', 20))
            new_w = int(img.width * (scale_percent / 100))
            new_h = int(logo.height * (new_w / logo.width))
            logo = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)

            logo_alpha = logo.split()[3].point(lambda p: p * opacity)
            logo.putalpha(logo_alpha)

            # For logo, size is fine directly
            orig_w, orig_h = logo.size

            if rotation != 0:
                logo = logo.rotate(rotation, expand=True, resample=Image.BICUBIC)

            watermark_item = logo

    # ================= APPLY WATERMARK =================
    if watermark_item:
        rw, rh = watermark_item.size  # rotated size

        # ======== TILED ========
        if position == 'tiled':
            for x in range(0, img.width, orig_w + spacing):
                for y in range(0, img.height, orig_h + spacing):

                    cx = x + orig_w // 2
                    cy = y + orig_h // 2

                    new_x = int(cx - rw / 2)
                    new_y = int(cy - rh / 2)

                    txt_layer.paste(watermark_item, (new_x, new_y), watermark_item)

        # ======== SINGLE POSITION ========
        else:
            if position == 'top-left':
                x, y = margin, margin
            elif position == 'top-right':
                x, y = img.width - orig_w - margin, margin
            elif position == 'top-center':
                x, y = (img.width - orig_w) // 2, margin
            elif position == 'bottom-left':
                x, y = margin, img.height - orig_h - margin
            elif position == 'bottom-right':
                x, y = img.width - orig_w - margin, img.height - orig_h - margin
            elif position == 'bottom-center':
                x, y = (img.width - orig_w) // 2, img.height - orig_h - margin
            elif position == 'center-left':
                x, y = margin, (img.height - orig_h) // 2
            elif position == 'center-right':
                x, y = img.width - orig_w - margin, (img.height - orig_h) // 2
            else:
                x, y = (img.width - orig_w) // 2, (img.height - orig_h) // 2

            cx = x + orig_w // 2
            cy = y + orig_h // 2

            new_x = int(cx - rw / 2)
            new_y = int(cy - rh / 2)

            txt_layer.paste(watermark_item, (new_x, new_y), watermark_item)

    # ================= FINAL OUTPUT =================
    watermarked = Image.alpha_composite(img, txt_layer).convert("RGB")

    img_io = io.BytesIO()
    watermarked.save(img_io, 'JPEG', quality=95)
    img_io.seek(0)

    return send_file(
        img_io,
        mimetype='image/jpeg',
        as_attachment=True,
        download_name='watermarked.jpg'
    )


if __name__ == '__main__':
    app.run(debug=True, port=5000)