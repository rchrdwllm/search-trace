CREATE TABLE "feedback_items" (
	"id" text PRIMARY KEY NOT NULL,
	"opportunity_id" text NOT NULL,
	"user_id" text NOT NULL,
	"feedback_date" text NOT NULL,
	"text" text NOT NULL,
	"source_type" text NOT NULL,
	"provenance" text NOT NULL,
	"ai_opt_in" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback_items" ADD CONSTRAINT "feedback_items_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_items" ADD CONSTRAINT "feedback_items_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_items_opportunity_id_idx" ON "feedback_items" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "feedback_items_user_id_idx" ON "feedback_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feedback_items_opp_date_idx" ON "feedback_items" USING btree ("opportunity_id","feedback_date");