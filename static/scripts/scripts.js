document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');
    const placeholder = document.getElementById('placeholder');
    let baseImage = null, logoImage = null;

    const updateLabels = () => {
        document.getElementById('fontSizeVal').innerText = document.getElementById('wmSize').value;
        document.getElementById('rotationVal').innerText = document.getElementById('wmRotation').value + '°';
        document.getElementById('opacityVal').innerText = Math.round(document.getElementById('wmOpacity').value * 100) + '%';
        
        const spacingInput = document.getElementById('wmSpacing');
        if(spacingInput) document.getElementById('spacingVal').innerText = spacingInput.value;
        
        const scaleVal = document.getElementById('scaleVal');
        if(scaleVal) scaleVal.innerText = document.getElementById('logoScale').value + '%';
        
        const isTiled = document.getElementById('positionPreset').value === 'tiled';
        document.getElementById('tilingControls').style.display = isTiled ? 'block' : 'none';
    };

    const drawRotated = (drawFn, x, y, w, h, rotationDegrees) => {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(rotationDegrees * Math.PI / 180);
        drawFn(-w / 2, -h / 2);
        ctx.restore();
    };

    const drawPreview = () => {
        if (!baseImage) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1; 
        ctx.drawImage(baseImage, 0, 0);

        const type = document.querySelector('.type-btn.active').dataset.type;
        const opacity = document.getElementById('wmOpacity').value;
        const rotation = parseInt(document.getElementById('wmRotation').value);
        const position = document.getElementById('positionPreset').value;
        const spacing = parseInt(document.getElementById('wmSpacing').value);

        ctx.save(); 
        ctx.globalAlpha = opacity;

        if (type === 'text') {
            const size = parseInt(document.getElementById('wmSize').value);
            ctx.font = `${size}px Arial`; 
            // Color Fix: Ensure the hex value from the picker is applied
            ctx.fillStyle = document.getElementById('wmColor').value;
            const text = document.getElementById('wmText').value;
            const m = ctx.measureText(text);
            const w = m.width, h = size, mar = 40;
            
            const renderText = (dx, dy) => {
                ctx.textBaseline = 'middle';
                ctx.fillText(text, dx, dy + h/2);
            };

            if (position === 'tiled') {
                for (let x = 0; x < canvas.width; x += (w + spacing)) {
                    for (let y = 0; y < canvas.height; y += (h + spacing)) {
                        drawRotated(renderText, x, y, w, h, rotation);
                    }
                }
            } else {
                let x, y;
                if (position === 'top-left') { x = mar; y = mar; }
                else if (position === 'top-right') { x = canvas.width - w - mar; y = mar; }
                else if (position === 'top-center') { x = (canvas.width - w) / 2; y = mar; }
                else if (position === 'bottom-left') { x = mar; y = canvas.height - h - mar; }
                else if (position === 'bottom-right') { x = canvas.width - w - mar; y = canvas.height - h - mar; }
                else if (position === 'bottom-center') { x = (canvas.width - w) / 2; y = canvas.height - h - mar; }
                else if (position === 'center-left') { x = mar; y = (canvas.height - h) / 2; }
                else if (position === 'center-right') { x = canvas.width - w - mar; y = (canvas.height - h) / 2; }
                else { x = (canvas.width - w)/2; y = (canvas.height - h)/2; }
                drawRotated(renderText, x, y, w, h, rotation);
            }
        } else if (type === 'image' && logoImage) {
            const scale = document.getElementById('logoScale').value / 100;
            const w = canvas.width * scale, h = logoImage.height * (w / logoImage.width), mar = 40;
            const renderLogo = (dx, dy) => ctx.drawImage(logoImage, dx, dy, w, h);

            if (position === 'tiled') {
                for (let x = 0; x < canvas.width; x += (w + spacing)) {
                    for (let y = 0; y < canvas.height; y += (h + spacing)) {
                        drawRotated(renderLogo, x, y, w, h, rotation);
                    }
                }
            } else {
                let x, y;
                if (position === 'top-left') { x = mar; y = mar; }
                else if (position === 'top-right') { x = canvas.width - w - mar; y = mar; }
                else if (position === 'top-center') { x = (canvas.width - w) / 2; y = mar; }
                else if (position === 'bottom-left') { x = mar; y = canvas.height - h - mar; }
                else if (position === 'bottom-right') { x = canvas.width - w - mar; y = canvas.height - h - mar; }
                else if (position === 'bottom-center') { x = (canvas.width - w) / 2; y = canvas.height - h - mar; }
                else if (position === 'center-left') { x = mar; y = (canvas.height - h) / 2; }
                else if (position === 'center-right') { x = canvas.width - w - mar; y = (canvas.height - h) / 2; }
                else { x = (canvas.width - w)/2; y = (canvas.height - h)/2; }
                drawRotated(renderLogo, x, y, w, h, rotation);
            }
        }
        ctx.restore();
    };

    document.querySelectorAll('input, select').forEach(i => i.addEventListener('input', () => { updateLabels(); drawPreview(); }));
    
    document.getElementById('imageInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => { 
                baseImage = img; canvas.width = img.width; canvas.height = img.height; 
                placeholder.style.display = 'none'; drawPreview(); 
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.parentElement.querySelector('.file-msg').innerText = file.name;
    });

    document.getElementById('logoInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => { logoImage = img; drawPreview(); };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.parentElement.querySelector('.file-msg').innerText = file.name;
    });

    document.querySelectorAll('.type-btn').forEach(b => b.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        const isText = b.dataset.type === 'text';
        document.getElementById('textControls').style.display = isText ? 'block' : 'none';
        document.getElementById('imageControls').style.display = isText ? 'none' : 'block';
        drawPreview();
    }));

    document.getElementById('downloadBtn').addEventListener('click', () => {
        const formData = new FormData();
        const mainFile = document.getElementById('imageInput').files[0];
        if (!mainFile) { alert("Select an image first"); return; }
        
        formData.append('image', mainFile);
        formData.append('type', document.querySelector('.type-btn.active').dataset.type);
        formData.append('opacity', document.getElementById('wmOpacity').value);
        formData.append('rotation', document.getElementById('wmRotation').value);
        formData.append('position', document.getElementById('positionPreset').value);
        formData.append('spacing', document.getElementById('wmSpacing').value);
        
        if (formData.get('type') === 'text') {
            formData.append('text', document.getElementById('wmText').value);
            formData.append('color', document.getElementById('wmColor').value);
            formData.append('size', document.getElementById('wmSize').value);
        } else {
            const logoFile = document.getElementById('logoInput').files[0];
            if (logoFile) formData.append('logo', logoFile);
            formData.append('scale', document.getElementById('logoScale').value);
        }
        
        fetch('/process', { method: 'POST', body: formData }).then(r => r.blob()).then(b => {
            const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'watermarked.jpg'; a.click();
        });
    });
});