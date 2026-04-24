-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "permission_key" VARCHAR(250) NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "service_code" VARCHAR(100) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "scope" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_key_key" ON "permissions"("permission_key");
