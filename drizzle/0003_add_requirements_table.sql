CREATE TABLE "requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"opportunity_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"job_description_excerpt" text NOT NULL,
	"coverage_state" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_daily_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"date" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_usage" ADD CONSTRAINT "user_daily_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "requirements_opportunity_id_idx" ON "requirements" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "requirements_user_id_idx" ON "requirements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "requirements_opp_order_idx" ON "requirements" USING btree ("opportunity_id","order_index");--> statement-breakpoint
CREATE INDEX "user_daily_usage_user_id_idx" ON "user_daily_usage" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_daily_usage_user_action_date_idx" ON "user_daily_usage" USING btree ("user_id","action","date");