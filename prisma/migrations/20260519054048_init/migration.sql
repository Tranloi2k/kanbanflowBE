-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('TODO', 'INPROGRESS', 'REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROJECT_INVITATION', 'ISSUE_ASSIGNED', 'ISSUE_COMMENT', 'ISSUE_STATUS_CHANGE', 'PROJECT_MEMBER_ADDED', 'PROJECT_ROLE_UPDATED', 'GENERAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "role" VARCHAR(50) DEFAULT 'user',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "key" VARCHAR(10) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "template" VARCHAR(20) NOT NULL,
    "lead_id" UUID,
    "avatar_color" VARCHAR(20) DEFAULT 'bg-blue-500',
    "is_starred" BOOLEAN DEFAULT false,
    "is_archived" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID,
    "user_id" UUID,
    "role" VARCHAR(50) DEFAULT 'member',
    "joined_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "inviter_id" UUID NOT NULL,
    "invitee_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'member',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "invited_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(6),
    "expires_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "project_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "issue_type" VARCHAR(50) DEFAULT 'task',
    "priority" VARCHAR(20) DEFAULT 'medium',
    "assignee_id" UUID,
    "reporter_id" UUID NOT NULL,
    "story_points" INTEGER,
    "position" INTEGER,
    "due_date" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" "IssueStatus" NOT NULL DEFAULT 'TODO',

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_labels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(20) DEFAULT 'bg-blue-500',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_label_relations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "issue_id" UUID,
    "label_id" UUID,

    CONSTRAINT "issue_label_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "issue_id" UUID,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID,
    "issue_id" UUID,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_project_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "project_id" UUID,
    "is_starred" BOOLEAN DEFAULT false,
    "last_visited" TIMESTAMP(6),
    "preferences" JSONB,

    CONSTRAINT "user_project_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_id" UUID,
    "related_type" VARCHAR(50),
    "action_url" VARCHAR(500),
    "metadata" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(6),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "projects_key_key" ON "projects"("key");

-- CreateIndex
CREATE INDEX "idx_projects_lead_id" ON "projects"("lead_id");

-- CreateIndex
CREATE INDEX "idx_project_members_project_id" ON "project_members"("project_id");

-- CreateIndex
CREATE INDEX "idx_project_members_user_id" ON "project_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_invitations_invitee_id" ON "project_invitations"("invitee_id");

-- CreateIndex
CREATE INDEX "idx_invitations_project_id" ON "project_invitations"("project_id");

-- CreateIndex
CREATE INDEX "idx_invitations_status" ON "project_invitations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_invitations_project_id_email_key" ON "project_invitations"("project_id", "email");

-- CreateIndex
CREATE INDEX "idx_issues_assignee_id" ON "issues"("assignee_id");

-- CreateIndex
CREATE INDEX "idx_issues_position" ON "issues"("status", "position");

-- CreateIndex
CREATE INDEX "idx_issues_project_id" ON "issues"("project_id");

-- CreateIndex
CREATE INDEX "idx_issues_status" ON "issues"("status");

-- CreateIndex
CREATE UNIQUE INDEX "issue_labels_project_id_name_key" ON "issue_labels"("project_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "issue_label_relations_issue_id_label_id_key" ON "issue_label_relations"("issue_id", "label_id");

-- CreateIndex
CREATE INDEX "idx_activities_created_at" ON "activities"("created_at");

-- CreateIndex
CREATE INDEX "idx_activities_project_id" ON "activities"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_project_preferences_user_id_project_id_key" ON "user_project_preferences"("user_id", "project_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_read" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issue_labels" ADD CONSTRAINT "issue_labels_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issue_label_relations" ADD CONSTRAINT "issue_label_relations_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issue_label_relations" ADD CONSTRAINT "issue_label_relations_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "issue_labels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issue_comments" ADD CONSTRAINT "issue_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issue_comments" ADD CONSTRAINT "issue_comments_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_project_preferences" ADD CONSTRAINT "user_project_preferences_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_project_preferences" ADD CONSTRAINT "user_project_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
