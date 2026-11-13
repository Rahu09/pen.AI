-- Why an upload failed, and how many pages the PDF has. Both columns are
-- nullable, so existing rows and older deployments keep working.

-- CreateEnum
CREATE TYPE "UploadFailure" AS ENUM ('TOO_MANY_PAGES', 'NO_TEXT', 'PROCESSING_ERROR');

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "failureReason" "UploadFailure",
ADD COLUMN     "pageCount" INTEGER;
