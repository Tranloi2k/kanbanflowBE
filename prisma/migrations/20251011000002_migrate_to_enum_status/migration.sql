-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('TODO', 'INPROGRESS', 'REVIEW', 'DONE');

-- First, add the new status column with enum type
ALTER TABLE "issues" ADD COLUMN "status_new" "IssueStatus" NOT NULL DEFAULT 'TODO';

-- Migrate existing data from issue_statuses to the new enum status
-- Map based on position: 1->TODO, 2->INPROGRESS, 3->REVIEW, >=4->DONE
UPDATE "issues" SET "status_new" = 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM "issue_statuses" 
      WHERE "issue_statuses"."id" = "issues"."status_id" 
      AND "issue_statuses"."position" = 1
    ) THEN 'TODO'::"IssueStatus"
    WHEN EXISTS (
      SELECT 1 FROM "issue_statuses" 
      WHERE "issue_statuses"."id" = "issues"."status_id" 
      AND "issue_statuses"."position" = 2
    ) THEN 'INPROGRESS'::"IssueStatus"
    WHEN EXISTS (
      SELECT 1 FROM "issue_statuses" 
      WHERE "issue_statuses"."id" = "issues"."status_id" 
      AND "issue_statuses"."position" = 3
    ) THEN 'REVIEW'::"IssueStatus"
    WHEN EXISTS (
      SELECT 1 FROM "issue_statuses" 
      WHERE "issue_statuses"."id" = "issues"."status_id" 
      AND "issue_statuses"."position" >= 4
    ) THEN 'DONE'::"IssueStatus"
    ELSE 'TODO'::"IssueStatus"
  END;

-- Drop foreign key constraint on status_id
ALTER TABLE "issues" DROP CONSTRAINT IF EXISTS "issues_status_id_fkey";

-- Drop the old status_id column
ALTER TABLE "issues" DROP COLUMN "status_id";

-- Rename the new column to status
ALTER TABLE "issues" RENAME COLUMN "status_new" TO "status";

-- Drop the issue_statuses table
DROP TABLE "issue_statuses";

-- Recreate indexes with new status column
DROP INDEX IF EXISTS "idx_issues_status_id";
DROP INDEX IF EXISTS "idx_issues_position";

CREATE INDEX "idx_issues_status" ON "issues"("status");
CREATE INDEX "idx_issues_position" ON "issues"("status", "position");