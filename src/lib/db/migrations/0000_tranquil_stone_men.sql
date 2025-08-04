CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"table_name" text NOT NULL,
	"record_id" text NOT NULL,
	"operation" text NOT NULL,
	"user_id" text,
	"user_email" text,
	"user_role" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_fields" jsonb,
	"ip_address" text,
	"user_agent" text,
	"request_id" text,
	"session_id" text,
	"reason" text,
	"source" text DEFAULT 'web' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"total_attempts" integer DEFAULT 0 NOT NULL,
	"successful_reservations" integer DEFAULT 0 NOT NULL,
	"failed_reservations" integer DEFAULT 0 NOT NULL,
	"cancelled_reservations" integer DEFAULT 0 NOT NULL,
	"timeout_reservations" integer DEFAULT 0 NOT NULL,
	"unique_users" integer DEFAULT 0 NOT NULL,
	"average_execution_time" integer,
	"peak_hour" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_retention_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"table_name" text NOT NULL,
	"retention_days" integer NOT NULL,
	"archive_before_delete" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_cleanup_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "data_retention_policies_table_name_unique" UNIQUE("table_name")
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"web_push_notifications" boolean DEFAULT false NOT NULL,
	"sms_notifications" boolean DEFAULT false NOT NULL,
	"notify_on_success" boolean DEFAULT true NOT NULL,
	"notify_on_failure" boolean DEFAULT true NOT NULL,
	"notify_on_error" boolean DEFAULT true NOT NULL,
	"notify_on_schedule" boolean DEFAULT false NOT NULL,
	"schedule_notify_minutes" integer DEFAULT 30,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"reservation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"message" text,
	"error_details" jsonb,
	"execution_time" integer,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"time_slot" text NOT NULL,
	"court_number" integer NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurring_days" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"retry_interval" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"target_users" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tennis_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"resource" text,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_logs" ADD CONSTRAINT "reservation_logs_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_logs" ADD CONSTRAINT "reservation_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tennis_accounts" ADD CONSTRAINT "tennis_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_table_name_idx" ON "audit_logs" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX "audit_logs_record_id_idx" ON "audit_logs" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_operation_idx" ON "audit_logs" USING btree ("operation");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_table_record_idx" ON "audit_logs" USING btree ("table_name","record_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_time_idx" ON "audit_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_stats_date_idx" ON "daily_stats" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "data_retention_policies_table_name_idx" ON "data_retention_policies" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX "data_retention_policies_active_idx" ON "data_retention_policies" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_settings_user_id_idx" ON "notification_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reservation_logs_reservation_id_idx" ON "reservation_logs" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "reservation_logs_status_idx" ON "reservation_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reservation_logs_executed_at_idx" ON "reservation_logs" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "reservation_logs_user_id_idx" ON "reservation_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reservation_logs_status_date_idx" ON "reservation_logs" USING btree ("status","executed_at");--> statement-breakpoint
CREATE INDEX "reservations_user_id_idx" ON "reservations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reservations_date_idx" ON "reservations" USING btree ("date");--> statement-breakpoint
CREATE INDEX "reservations_active_idx" ON "reservations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "reservations_user_date_idx" ON "reservations" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "system_notifications_type_idx" ON "system_notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "system_notifications_active_idx" ON "system_notifications" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "system_notifications_created_at_idx" ON "system_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "system_settings_key_idx" ON "system_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "system_settings_category_idx" ON "system_settings" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "tennis_accounts_user_id_idx" ON "tennis_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_logs_user_id_idx" ON "user_activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_logs_action_idx" ON "user_activity_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "user_activity_logs_created_at_idx" ON "user_activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");