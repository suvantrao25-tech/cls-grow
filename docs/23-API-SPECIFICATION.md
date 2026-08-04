# API Specification

Version: 1.0

Status: Draft

Last Updated: 31 July 2026

---

# Objective

Define all APIs required for CLS Grow.

All APIs should follow REST principles.

Response Format

{
  success: boolean,
  message: string,
  data: object
}

---

# Authentication

## POST /api/auth/signup

Purpose

Create a new account.

---

## POST /api/auth/login

Purpose

Login user.

---

## POST /api/auth/logout

Purpose

Logout current user.

---

## GET /api/profile

Purpose

Get logged-in user profile.

---

# Business

## POST /api/business

Purpose

Register a new business.

---

## GET /api/business

Purpose

Get business details.

---

## PUT /api/business

Purpose

Update business information.

---

# Dashboard

## GET /api/dashboard

Purpose

Load dashboard data.

Returns

- Business Score
- Growth Score
- AI Recommendations
- Notifications
- Reports

---

# Business Score

## GET /api/business-score

Purpose

Get current Business Score.

---

# Growth Score

## GET /api/growth-score

Purpose

Get current Growth Score.

---

# AI Recommendations

## GET /api/recommendations

Purpose

Fetch AI recommendations.

---

## POST /api/recommendations/refresh

Purpose

Generate fresh AI recommendations.

---

# Reports

## GET /api/reports

Purpose

List all reports.

---

## GET /api/reports/{id}

Purpose

View a report.

---

## POST /api/reports/generate

Purpose

Generate a new report.

---

# Notifications

## GET /api/notifications

Purpose

Get notifications.

---

## PUT /api/notifications/{id}/read

Purpose

Mark notification as read.

---

# Subscription

## GET /api/subscription

Purpose

Get current plan.

---

## POST /api/subscription/upgrade

Purpose

Upgrade subscription.

---

# Health Check

## GET /api/health

Purpose

Check API status.

Returns

- API Status
- Database Status
- AI Engine Status

---

# API Principles

- Secure
- Fast
- Versioned
- RESTful
- JSON Responses
- Authentication Required (except signup/login)

---

Version: 1.0

Status: Draft