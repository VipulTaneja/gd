-- Prevent two ACTIVE visitor passes from ever sharing the same OTP.
-- A partial unique index (rather than a full unique constraint on `otp`) allows
-- USED/EXPIRED/CANCELLED passes to keep their historical OTP values without
-- blocking OTP reuse once a pass leaves the ACTIVE state.
CREATE UNIQUE INDEX "VisitorPass_otp_active_key" ON "VisitorPass"("otp") WHERE "status" = 'ACTIVE';