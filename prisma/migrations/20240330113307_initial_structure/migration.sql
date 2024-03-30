-- CreateTable
CREATE TABLE "GoogleUser" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "refreshToken" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EventSync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "todoistID" TEXT NOT NULL,
    "googleUserEmail" TEXT NOT NULL,
    "googleCalendarID" TEXT NOT NULL,
    "googleEventID" TEXT NOT NULL,
    "googleLastUpdate" DATETIME NOT NULL,
    CONSTRAINT "EventSync_googleUserEmail_fkey" FOREIGN KEY ("googleUserEmail") REFERENCES "GoogleUser" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);
