// Same picture for Twitter/X cards as for Open Graph.
// (Route config has to be declared here, not re-exported, for Next to read it.)
import OpengraphImage from "./opengraph-image";

// Edge runtime: on Windows, Next 14 cannot load the default font for
// ImageResponse in the Node runtime (it builds an invalid file path).
export const runtime = "edge";

export const alt = "pen.AI. Ask your PDFs anything.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OpengraphImage;
