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
        className="glass-panel clay-card-3d cropper-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="cropper-title-row">
            <span className="cropper-title-icon">{isAvatar ? '👤' : '🖼️'}</span>
            <h3 className="cropper-title-text">
              {isAvatar ? 'Crop Profile Photo' : 'Crop Cover Banner'}
            </h3>
          </div>
          <button type="button" className="close-modal-btn user-modal-close-btn" onClick={onClose} title="Close">✕</button>
        </div>

        <div className="modal-body modal-body-padded">
          <p className="cropper-instructions">
            Drag to reposition. Use the slider below to zoom in or rotate.
          </p>

          {/* Interactive Crop Frame Box */}
          <div 
            className={`crop-canvas-container ${isDragging ? 'is-dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            {/* The live Canvas */}
            <canvas 
              ref={canvasRef} 
              className={`cropper-canvas ${isAvatar ? 'avatar' : 'banner'}`}
            />

            {/* Grid overlay lines */}
            <div 
              className={`cropper-grid-overlay ${isAvatar ? 'avatar' : 'banner'}`}
              style={{
                width: `${cropBoxWidth}px`,
                height: `${cropBoxHeight}px`
              }}
            />
          </div>

          {/* Controls: Zoom Slider & Rotate */}
          <div className="cropper-controls-row">
            <div className="cropper-slider-row">
              <span className="cropper-slider-label">
                Zoom:
              </span>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.05"
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="cropper-slider-input"
              />
              <span className="cropper-slider-val">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="cropper-actions-bar">
              <button 
                type="button" 
                className="action-btn cropper-btn-compact"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
              >
                🔄 Rotate 90°
              </button>

              <button 
                type="button" 
                className="action-btn cropper-btn-compact"
                onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); setRotation(0); }}
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-action-buttons cropper-modal-actions">
            <button type="button" className="action-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary cropper-btn-apply" 
              onClick={handleApplyCrop}
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
