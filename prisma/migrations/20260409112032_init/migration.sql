-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TrackedFlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "destCity" TEXT NOT NULL,
    "departDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "isRoundTrip" BOOLEAN NOT NULL DEFAULT false,
    "lowestPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "lastChecked" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrackedFlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricePoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackedFlightId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "airline" TEXT,
    "deepLink" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PricePoint_trackedFlightId_fkey" FOREIGN KEY ("trackedFlightId") REFERENCES "TrackedFlight" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
