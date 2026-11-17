CREATE TABLE "shares" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "shares_document_id_user_id_pk" PRIMARY KEY("document_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "shares" ADD CONSTRAINT "shares_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shares" ADD CONSTRAINT "shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shares_user_idx" ON "shares" USING btree ("user_id");