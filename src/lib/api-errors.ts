import { NextResponse } from "next/server";

export const API_ERRORS = {
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  approvalRequired: "Approval required",
  notFound: "Not found",
  tooManyRequests: "Too many requests. Please try again shortly.",
} as const;

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorizedResponse() {
  return jsonError(API_ERRORS.unauthorized, 401);
}

export function forbiddenResponse() {
  return jsonError(API_ERRORS.forbidden, 403);
}

export function approvalRequiredResponse() {
  return jsonError(API_ERRORS.approvalRequired, 403);
}
