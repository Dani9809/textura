import { useState, useRef, useCallback, useEffect } from "react";

interface PanState {
    x: number;
    y: number;
}

export function useZoomPan() {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<PanState>({ x: 0, y: 0 });

    const resetZoomPan = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoom((z) => Math.min(3, z + 0.25));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((z) => Math.max(0.5, z - 0.25));
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent, currentPan: PanState) => {
        if (zoom <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - currentPan.x, y: e.clientY - currentPan.y };
    }, [zoom]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPan({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y
        });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Wheel Zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        // e.preventDefault() is handled by the browser if we use passive: false,
        // but React's synthetic event wrapper might need explicit handling or just relying on state.
        // For standard scroll zoom:
        const delta = e.deltaY * -0.01;
        const newZoom = Math.min(3, Math.max(0.5, zoom + delta));
        setZoom(newZoom);
    }, [zoom]);

    // Touch Support
    const handleTouchStart = useCallback((e: React.TouchEvent, currentPan: PanState) => {
        if (zoom <= 1) return;
        // Only single touch for panning
        if (e.touches.length === 1) {
            setIsDragging(true);
            const touch = e.touches[0];
            dragStartRef.current = { x: touch.clientX - currentPan.x, y: touch.clientY - currentPan.y };
        }
    }, [zoom]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        // Prevent default to stop scrolling the page while panning the image
        // Note: 'touch-action: none' CSS is also recommended on the element.
        const touch = e.touches[0];
        setPan({
            x: touch.clientX - dragStartRef.current.x,
            y: touch.clientY - dragStartRef.current.y
        });
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    return {
        zoom,
        pan,
        isDragging,
        resetZoomPan,
        handleZoomIn,
        handleZoomOut,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave,
        handleWheel,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        setZoom,
        setPan
    };
}
