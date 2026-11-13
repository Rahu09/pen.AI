import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// UploadThing's endpoints for the Next App Router. The browser asks here for
// permission to upload (this runs the middleware in core.ts), and UploadThing
// calls back here when the file is stored (onUploadComplete). Reads
// UPLOADTHING_TOKEN from the environment.
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
