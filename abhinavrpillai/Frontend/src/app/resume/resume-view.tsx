"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  ArrowLeft,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PenTool,
  Trash2,
  Check,
  FileText,
  Sparkles,
  Layers,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FunnyThemeToggle from "@/components/theme/funny-theme-toggle";
import { cn } from "@/lib/utils";

const RESUME_PATH = "/ABHINAV_R_PILLAI_FlowCV_Resume_2026-10-18.pdf";
const DOODLE_COLORS = [
  "hsl(20, 100%, 65%)", // theme accent orange
  "#38bdf8",           // sky blue
  "#4ade80",           // emerald green
  "#f43f5e",           // rose
  "#ffffff",           // white
  "#09090b",           // dark
];

export default function ResumeView() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [viewMode, setViewMode] = useState<"canvas" | "native">("canvas");
  const [containerWidth, setContainerWidth] = useState(800);

  // Doodle state
  const [doodleActive, setDoodleActive] = useState(false);
  const [doodleColor, setDoodleColor] = useState(DOODLE_COLORS[0]);
  const [hasDoodle, setHasDoodle] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const doodleCanvasesRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const drawingStateRef = useRef<{ isDrawing: boolean; lastX: number; lastY: number }>({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
  });

  // Track container width for responsive scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setContainerWidth(Math.min(rect.width - 24, 860));
      }
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    window.addEventListener("resize", updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Initialize PDF.js once script is loaded or already on window
  useEffect(() => {
    const initPdf = async () => {
      const pdfjs = (window as any).pdfjsLib;
      if (!pdfjs) return;

      try {
        setIsLoading(true);
        pdfjs.GlobalWorkerOptions.workerSrc = "/assets/pdfjs/pdf.worker.min.js";
        const loadingTask = pdfjs.getDocument(RESUME_PATH);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages || 2);
        setIsLoading(false);
        setHasError(false);
      } catch (err) {
        console.error("PDF.js loading failed:", err);
        setHasError(true);
        setIsLoading(false);
        // Fall back to native viewer if PDF.js fails
        setViewMode("native");
      }
    };

    if (scriptLoaded || (window as any).pdfjsLib) {
      initPdf();
    }
  }, [scriptLoaded]);

  // Fallback timer: if script takes more than 4s, fallback gracefully
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !pdfDoc) {
        const pdfjs = (window as any).pdfjsLib;
        if (!pdfjs) {
          setViewMode("native");
          setIsLoading(false);
        }
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isLoading, pdfDoc]);

  // Clear all doodles
  const clearDoodles = useCallback(() => {
    doodleCanvasesRef.current.forEach((canvas) => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    setHasDoodle(false);
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.15).toFixed(2)), 1.8));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.15).toFixed(2)), 0.65));
  const handleZoomReset = () => setZoom(1.0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* Load Mozilla PDF.js from local public assets */}
      <Script
        src="/assets/pdfjs/pdf.min.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          setViewMode("native");
          setIsLoading(false);
        }}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Back & Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-2.5 sm:px-3 py-1.5 rounded-lg border border-border/60 hover:bg-secondary/40 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Portfolio</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border/50 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Abhinav R Pillai</span>
             
            </div>
          </div>

          {/* Middle: Zoom Controls (canvas mode) */}
          {viewMode === "canvas" && !isLoading && (
            <div className="flex items-center gap-1 bg-secondary/30 dark:bg-slate-900/40 p-1 rounded-xl border border-border/40">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.65}
                className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-2 py-1 text-[11px] font-mono font-medium text-foreground hover:bg-secondary/80 rounded-lg transition-colors"
                title="Reset Zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 1.8}
                className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Right Actions: Theme Toggle, Doodle, Open, Download */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View mode toggle on medium+ screens */}
            <div className="hidden lg:flex items-center bg-secondary/30 rounded-lg p-0.5 border border-border/40 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("canvas")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all font-medium",
                  viewMode === "canvas"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Document
              </button>
              <button
                type="button"
                onClick={() => setViewMode("native")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all font-medium",
                  viewMode === "native"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Native PDF
              </button>
            </div>

            {/* Doodle Toggle */}
            {viewMode === "canvas" && (
              <Button
                variant={doodleActive ? "default" : "outline"}
                size="sm"
                onClick={() => setDoodleActive(!doodleActive)}
                className={cn(
                  "h-8 sm:h-9 px-2 sm:px-3 text-xs gap-1.5 transition-all",
                  doodleActive
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold border-amber-400"
                    : "hover:border-primary/50"
                )}
              >
                <PenTool className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {doodleActive ? "Done" : "Annotate"}
                </span>
              </Button>
            )}

            {/* Open Raw Tab */}
            <a
              href={RESUME_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xs:inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-secondary/40 transition-all"
              title="Open raw PDF in new browser tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tab</span>
            </a>

            {/* Download PDF Button */}
            <Button
              asChild
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <a
                href={RESUME_PATH}
                download="Abhinav_R_Pillai_Resume.pdf"
                className="flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </a>
            </Button>

            {/* Theme Toggle */}
            <FunnyThemeToggle className="w-5 h-5 ml-1 hidden sm:flex" />
          </div>
        </div>
      </header>

      {/* Main Document Area */}
      <main
        ref={containerRef}
        className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-start min-h-[calc(100vh-4rem)]"
      >
        {/* Mobile Header Info Bar */}
        <div className="w-full flex md:hidden items-center justify-between pb-4 text-xs text-muted-foreground border-b border-border/30 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Abhinav R Pillai</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Verified
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            2 Pages • PDF
          </span>
        </div>

        {/* Loading State */}
        {isLoading && viewMode === "canvas" && (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <FileText className="absolute inset-0 m-auto h-5 w-5 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">Rendering Résumé...</p>
              <p className="text-xs text-muted-foreground font-mono">Loading vector pages</p>
            </div>
            <div className="w-full max-w-sm h-80 rounded-2xl bg-secondary/20 animate-pulse border border-border/40" />
          </div>
        )}

        {/* Canvas Mode: Rendered Pages */}
        {viewMode === "canvas" && pdfDoc && (
          <div className="w-full flex flex-col items-center gap-8 sm:gap-12 relative">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <ResumePageItem
                key={pageNum}
                pageNumber={pageNum}
                pdfDoc={pdfDoc}
                zoom={zoom}
                containerWidth={containerWidth}
                doodleActive={doodleActive}
                doodleColor={doodleColor}
                onDoodleDrawn={() => setHasDoodle(true)}
                onCanvasRegistered={(canvas) => {
                  if (canvas) {
                    doodleCanvasesRef.current.set(pageNum, canvas);
                  } else {
                    doodleCanvasesRef.current.delete(pageNum);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Native Viewer Mode (iframe) */}
        {viewMode === "native" && (
          <div className="w-full max-w-4xl h-[82vh] rounded-2xl overflow-hidden border border-border/60 bg-white shadow-2xl relative">
            <iframe
              src={`${RESUME_PATH}#toolbar=1&navpanes=0&view=FitH`}
              title="Abhinav R Pillai - Résumé"
              className="w-full h-full border-0 block"
            />
          </div>
        )}
      </main>

      {/* Floating Doodle Toolbar when Doodle is active */}
      <AnimatePresence>
        {doodleActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-2 rounded-2xl bg-background/95 border border-border/80 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-1.5 px-1">
              {DOODLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDoodleColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform border border-black/20",
                    doodleColor === c
                      ? "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "hover:scale-110 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={clearDoodles}
              disabled={!hasDoodle}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setDoodleActive(false)}
              className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Done</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Page Item with PDF.js Rendered Canvas + Overlay Doodle Canvas
 */
function ResumePageItem({
  pageNumber,
  pdfDoc,
  zoom,
  containerWidth,
  doodleActive,
  doodleColor,
  onDoodleDrawn,
  onCanvasRegistered,
}: {
  pageNumber: number;
  pdfDoc: any;
  zoom: number;
  containerWidth: number;
  doodleActive: boolean;
  doodleColor: string;
  onDoodleDrawn: () => void;
  onCanvasRegistered: (canvas: HTMLCanvasElement | null) => void;
}) {
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const doodleCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeRenderTaskRef = useRef<any>(null);
  const [rendered, setRendered] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Render the PDF page onto the page canvas safely handling React StrictMode
  useEffect(() => {
    if (!pdfDoc || !pageCanvasRef.current) return;
    let isCancelled = false;

    const renderPage = async () => {
      // If a task is already rendering on this canvas, cancel it and wait
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
          await activeRenderTaskRef.current.promise.catch(() => {});
        } catch (e) {}
      }

      if (isCancelled) return;

      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = pageCanvasRef.current;
        if (!canvas) return;

        const baseViewport = page.getViewport({ scale: 1.0 });
        // Calculate responsive width (max 850px)
        const targetWidth = Math.min(containerWidth, 840);
        const computedScale = (targetWidth / baseViewport.width) * zoom;
        const viewport = page.getViewport({ scale: computedScale });

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const cssWidth = Math.floor(viewport.width);
        const cssHeight = Math.floor(viewport.height);

        setDimensions({ width: cssWidth, height: cssHeight });

        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const renderTask = page.render(renderContext);
        activeRenderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!isCancelled) {
          setRendered(true);
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.warn("Page render issue:", err);
        }
      } finally {
        activeRenderTaskRef.current = null;
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [pdfDoc, pageNumber, zoom, containerWidth]);

  // Adjust doodle canvas size to match rendered page
  useEffect(() => {
    const doodleCanvas = doodleCanvasRef.current;
    if (!doodleCanvas || dimensions.width === 0) return;

    onCanvasRegistered(doodleCanvas);

    const dpr = window.devicePixelRatio || 1;
    doodleCanvas.width = Math.floor(dimensions.width * dpr);
    doodleCanvas.height = Math.floor(dimensions.height * dpr);
    doodleCanvas.style.width = `${dimensions.width}px`;
    doodleCanvas.style.height = `${dimensions.height}px`;

    const ctx = doodleCanvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    return () => {
      onCanvasRegistered(null);
    };
  }, [dimensions, onCanvasRegistered]);

  // Doodle event handlers
  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = doodleCanvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!doodleActive) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const pt = getPoint(e);
    lastPoint.current = pt;

    const ctx = doodleCanvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.fillStyle = doodleColor;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    onDoodleDrawn();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!doodleActive || !isDrawing.current || !lastPoint.current) return;
    const ctx = doodleCanvasRef.current?.getContext("2d");
    if (!ctx) return;

    const pt = getPoint(e);
    ctx.strokeStyle = doodleColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();

    lastPoint.current = pt;
  };

  const onPointerUp = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Page Badge */}
      <div className="w-full max-w-[840px] flex items-center justify-between pb-2 px-1 text-xs text-muted-foreground select-none">
        <span className="font-mono text-[11px] bg-secondary/40 px-2 py-0.5 rounded-md border border-border/40">
          Page {pageNumber}
        </span>
        <span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
          {pageNumber === 1 ? "Experience & Profile" : "Projects & Education"}
        </span>
      </div>

      {/* Card Container */}
      <div
        className={cn(
          "relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-xl sm:shadow-2xl border border-border/50 transition-all",
          doodleActive && "ring-2 ring-amber-500/50 shadow-amber-500/10"
        )}
        style={{
          width: dimensions.width ? `${dimensions.width}px` : "100%",
          minHeight: dimensions.height ? `${dimensions.height}px` : "600px",
        }}
      >
        {/* PDF Page Canvas */}
        <canvas
          ref={pageCanvasRef}
          className="block w-full bg-white select-none pointer-events-none"
        />

        {/* Doodle Canvas Overlay */}
        <canvas
          ref={doodleCanvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "absolute inset-0 z-10",
            doodleActive
              ? "pointer-events-auto cursor-crosshair touch-none"
              : "pointer-events-none"
          )}
        />
      </div>
    </div>
  );
}
