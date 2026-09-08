CREATE TABLE "evidence_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"opportunity_id" text NOT NULL,
	"evidence_item_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_evidence" ADD CONSTRAINT "opportunity_evidence_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_evidence" ADD CONSTRAINT "opportunity_evidence_evidence_item_id_evidence_items_id_fk" FOREIGN KEY ("evidence_item_id") REFERENCES "public"."evidence_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_evidence" ADD CONSTRAINT "opportunity_evidence_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evidence_items_user_id_idx" ON "evidence_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "evidence_items_user_updated_idx" ON "evidence_items" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "opportunity_evidence_opp_evidence_idx" ON "opportunity_evidence" USING btree ("opportunity_id","evidence_item_id");--> statement-breakpoint
CREATE INDEX "opportunity_evidence_opportunity_id_idx" ON "opportunity_evidence" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "opportunity_evidence_evidence_item_id_idx" ON "opportunity_evidence" USING btree ("evidence_item_id");--> statement-breakpoint
CREATE INDEX "opportunity_evidence_user_id_idx" ON "opportunity_evidence" USING btree ("user_id");