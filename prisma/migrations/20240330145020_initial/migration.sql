-- CreateTable
CREATE TABLE "GoogleUser" (
    "email" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "GoogleUser_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "EventSync" (
    "id" TEXT NOT NULL,
    "todoistID" TEXT NOT NULL,
    "googleUserEmail" TEXT NOT NULL,
    "googleCalendarID" TEXT NOT NULL,
    "googleEventID" TEXT NOT NULL,
    "googleLastUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSync_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventSync" ADD CONSTRAINT "EventSync_googleUserEmail_fkey" FOREIGN KEY ("googleUserEmail") REFERENCES "GoogleUser"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
