-- CreateIndex
CREATE INDEX "FaqItem_question_idx" ON "FaqItem"("question");

-- CreateIndex
CREATE INDEX "ForumThread_title_idx" ON "ForumThread"("title");

-- CreateIndex
CREATE INDEX "ImportantContact_typeOfService_idx" ON "ImportantContact"("typeOfService");

-- CreateIndex
CREATE INDEX "ImportantContact_name_idx" ON "ImportantContact"("name");

-- CreateIndex
CREATE INDEX "Notice_title_idx" ON "Notice"("title");

-- CreateIndex
CREATE INDEX "Pet_name_idx" ON "Pet"("name");

-- CreateIndex
CREATE INDEX "Pet_breed_idx" ON "Pet"("breed");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Vehicle_make_idx" ON "Vehicle"("make");
