-- CreateTable
CREATE TABLE "EventSync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleID" TEXT NOT NULL,
    "todoistID" TEXT NOT NULL,
    "lastUpdate" DATETIME NOT NULL
);
