# Image Watermark Studio (Flask)

A web-based **image watermarking app** built with **Flask**. Users can upload a main image and apply either:
- **Text watermark** (custom text, color, font size)
- **Image/logo watermark** (upload a logo, scale it)

Both watermark types support:
- **Rotation**
- **Opacity**
- **Position presets** (top/bottom/center variants)
- **Tiled (repeated)** watermark layout with adjustable spacing

---

## Features

- Upload main image (any common image format supported by Pillow)
- Add **text** watermark
  - Custom text
  - Color picker
  - Font size
- Add **logo** watermark
  - Upload logo file
  - Scale (%)
- Watermark options
  - Rotation (-180° to 180°)
  - Opacity (0%–100%)
  - Position presets
  - Tiled mode with spacing control
- Download the processed image directly as **watermarked.jpg**

---

## Tech Stack

- **Backend:** Flask
- **Image Processing:** Pillow (PIL)
- **Frontend:** HTML + CSS + Vanilla JavaScript (canvas preview)

---

## Project Structure

- `app.py` - Flask application routes and image processing logic
- `templates/index.html` - UI for uploading and configuring watermark settings
- `static/css/style.css` - Styling
- `static/scripts/scripts.js` - Canvas preview + form submission
- `requirements.txt` - Python dependencies

---

## Setup & Installation

### 1) Create a virtual environment (recommended)

```bash
python -m venv venv
```

Activate it:

- **Windows (cmd):**
```bash
venv\Scripts\activate
```

### 2) Install dependencies

```bash
pip install -r requirements.txt
```

---

## Run the App

```bash
python app.py
```

Open in your browser:
- **http://127.0.0.1:5000**

---

## How to Use

1. Open the homepage.
2. Upload the **main image**.
3. Choose watermark type:
   - **Text**: enter watermark text, set color and font size.
   - **Logo**: upload a PNG/logo and set scale.
4. Configure appearance:
   - Rotation, opacity
   - Choose a position preset
   - If **Tiled (Repeated)** is selected, adjust spacing
5. Click **Process & Download**.
6. Your watermarked image downloads as **watermarked.jpg**.

---

## Notes / Implementation Details

- Processing happens server-side in `/process`.
- The app returns the final image using Flask `send_file` from an in-memory buffer.
- Preview is rendered on the client using the HTML canvas.

---

## Troubleshooting

- **Font loading issue:** If `arial.ttf` is missing on the system, the app falls back to Pillow’s default font.
- **Logo transparency:** For best results, upload logos with transparency (e.g., PNG).

---

## License

Add your preferred license here (MIT, GPL, etc.).

