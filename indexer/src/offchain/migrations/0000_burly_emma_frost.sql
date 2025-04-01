CREATE TABLE "offchain"."profiles" (
	"address" varchar(42) PRIMARY KEY NOT NULL,
	"ens" text NOT NULL,
	"data" jsonb
);
--> statement-breakpoint
CREATE INDEX "ens_idx" ON "offchain"."profiles" USING btree ("ens");