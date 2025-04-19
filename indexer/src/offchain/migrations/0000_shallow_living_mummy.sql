CREATE TABLE "offchain"."profiles" (
	"address" text PRIMARY KEY NOT NULL,
	"ens" text,
	"data" jsonb,
	"updated_at" timestamp,
	CONSTRAINT "profiles_ens_unique" UNIQUE("ens")
);
