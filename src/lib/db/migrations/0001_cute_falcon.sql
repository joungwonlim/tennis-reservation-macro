CREATE TYPE "public"."audit_operation" AS ENUM('INSERT', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."audit_source" AS ENUM('web', 'api', 'system', 'migration');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'warning', 'error', 'success');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'success', 'failed', 'cancelled', 'timeout');--> statement-breakpoint
CREATE TYPE "public"."system_settings_category" AS ENUM('general', 'macro', 'notification', 'security');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "operation" SET DATA TYPE "public"."audit_operation" USING "operation"::"public"."audit_operation";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "source" SET DEFAULT 'web'::"public"."audit_source";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "source" SET DATA TYPE "public"."audit_source" USING "source"::"public"."audit_source";--> statement-breakpoint
ALTER TABLE "reservation_logs" ALTER COLUMN "status" SET DATA TYPE "public"."reservation_status" USING "status"::"public"."reservation_status";--> statement-breakpoint
ALTER TABLE "system_notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";--> statement-breakpoint
ALTER TABLE "system_settings" ALTER COLUMN "category" SET DEFAULT 'general'::"public"."system_settings_category";--> statement-breakpoint
ALTER TABLE "system_settings" ALTER COLUMN "category" SET DATA TYPE "public"."system_settings_category" USING "category"::"public"."system_settings_category";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";