"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { Document, Page } from "@/lib/pdfjs";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import PdfFullscreen from "./PdfFullscreen";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface PDFRendererProps {
  url: string;
}

const ZOOM_LEVELS = [1, 1.5, 2, 2.5];

const PdfRenderer = ({ url }: PDFRendererProps) => {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale;
  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  // Debounced: while the divider next to the PDF is dragged the width changes
  // on every frame, and each change re-renders the page canvas.
  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: "debounce",
    refreshRate: 150,
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

  const goToPage = (page: number) => {
    setCurrPage(page);
    setValue("page", String(page));
  };

  return (
    <div className="flex h-full w-full flex-col bg-card">
      <div className="flex h-12 w-full shrink-0 items-center justify-between border-b px-2">
        <div className="flex items-center gap-1">
          <Button
            disabled={currPage <= 1}
            onClick={() => goToPage(Math.max(currPage - 1, 1))}
            variant="ghost"
            size="sm"
            aria-label="Previous page"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              aria-label="Page number"
              inputMode="numeric"
              className={cn(
                "h-8 w-12 px-2 text-center",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="space-x-1 text-sm text-muted-foreground">
              <span>/</span>
              <span>{numPages ?? "–"}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || currPage === numPages}
            onClick={() => goToPage(Math.min(currPage + 1, numPages!))}
            variant="ghost"
            size="sm"
            aria-label="Next page"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="gap-1.5"
                aria-label={`Zoom, currently ${scale * 100}%`}
                variant="ghost"
                size="sm"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                {scale * 100}%
                <ChevronDown className="h-3 w-3 opacity-50" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {ZOOM_LEVELS.map((level) => (
                <DropdownMenuItem key={level} onSelect={() => setScale(level)}>
                  {level * 100}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
            size="sm"
            aria-label="Rotate 90 degrees"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      {/* The page itself stays white in dark mode: it is a document. */}
      <div className="scroll-thin min-h-0 flex-1 overflow-auto bg-muted/40 p-4">
        <div ref={ref}>
          <Document
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
            error={
              <p
                role="alert"
                className="py-24 text-center text-sm text-muted-foreground"
              >
                This PDF could not be displayed.
              </p>
            }
            onLoadError={() => {
              toast({
                title: "Error loading PDF",
                description: "Please try again later",
                variant: "destructive",
              });
            }}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            file={url}
            className="mx-auto w-fit shadow-sm"
          >
            {isLoading && renderedScale ? (
              <Page
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + renderedScale}
              />
            ) : null}

            <Page
              className={cn(isLoading ? "hidden" : "")}
              width={width ? width : 1}
              pageNumber={currPage}
              scale={scale}
              rotate={rotation}
              key={"@" + scale}
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              }
              onRenderSuccess={() => setRenderedScale(scale)}
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
