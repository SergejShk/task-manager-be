DO $$ BEGIN
 CREATE TYPE "task_status" AS ENUM('open', 'in_progress', 'done');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"assignee" varchar,
	"due_date" varchar,
	"status" "task_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
