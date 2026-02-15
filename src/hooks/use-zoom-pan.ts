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
        setZoom,
        setPan
    };
}
