// src/components/ImageCropperModal.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  cropType = 'avatar', // 'avatar' (1:1) | 'cover' (3:1)
  onClose,
  onCropComplete
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Reset state when opening new image
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setImgLoaded(false);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        setImgLoaded(true);
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Dimensions of the viewport crop box
  const cropBoxWidth = cropType === 'avatar' ? 260 : 380;
  const cropBoxHeight = cropType === 'avatar' ? 260 : 130;

  // Render on canvas
  const drawCropPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current || !imgLoaded) return;

    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = cropBoxWidth;
    canvas.height = cropBoxHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Center point for rotation and pan
    ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate base aspect fit
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const drawW = img.width * ratio;
    const drawH = img.height * ratio;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [cropBoxWidth, cropBoxHeight, position, rotation, zoom, imgLoaded]);

  useEffect(() => {
    drawCropPreview();
  }, [drawCropPreview]);

  // Mouse / Touch Drag Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Perform Final High-Res Crop and Export
  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export as high quality JPEG DataURL
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  const isAvatar = cropType === 'avatar';

  const modalContent = (
    <div className="full-viewport-blur-overlay modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel logout-confirm-box clay-card-3d image-cropper-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '92%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.3rem' }}>{isAvatar ? '👤' : '🖼️'}</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              {isAvatar ? 'Crop Profile Photo' : 'Crop Cover Banner'}
            </h3>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose} title="Close">✕</button>
        </div>

        <div className="modal-body modal-body-padded">
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500, #64748b)', margin: '0 0 1rem 0' }}>
            Drag to reposition. Use the slider below to zoom in or rotate.
          </p>

          {/* Interactive Crop Frame Box */}
          <div 
            className="crop-canvas-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            style={{
              width: '100%',
              height: '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0f172a',
              borderRadius: '18px',
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              position: 'relative'
            }}
          >
            {/* The live Canvas */}
            <canvas 
              ref={canvasRef} 
              style={{
                borderRadius: isAvatar ? '50%' : '10px',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.72)',
                border: '2px solid var(--violet-primary, #6c5ce7)',
                pointerEvents: 'none'
              }}
            />

            {/* Grid overlay lines */}
            <div 
              style={{
                position: 'absolute',
                width: `${cropBoxWidth}px`,
                height: `${cropBoxHeight}px`,
                borderRadius: isAvatar ? '50%' : '10px',
                pointerEvents: 'none',
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.4)'
              }}
            />
          </div>

          {/* Controls: Zoom Slider & Rotate */}
          <div className="cropper-controls-row" style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600, #475569)', minWidth: '45px' }}>
                Zoom:
              </span>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.05"
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--violet-primary, #6c5ce7)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700, #334155)', minWidth: '40px', textAlign: 'right' }}>
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button" 
                className="action-btn"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              >
                🔄 Rotate 90°
              </button>

              <button 
                type="button" 
                className="action-btn"
                onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); setRotation(0); }}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.4rem' }}>
            <button type="button" className="action-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleApplyCrop}
              style={{ padding: '0.65rem 1.4rem' }}
            >
              Apply &amp; Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
