# CLS Grow Database Design v1.0

## Purpose

The database stores business information, AI insights, reports, subscriptions and system data securely.

---

# Core Tables

## profiles

Stores user account information.

Fields:

- id
- full_name
- email
- phone
- created_at

---

## businesses

Stores basic business information.

Fields:

- id
- user_id
- business_name
- category
- address
- city
- state
- country
- created_at

---

## business_profiles

Stores detailed business profile.

Fields:

- business_id
- years_in_business
- employees
- products
- services
- target_customers
- business_goal

---

## business_scores

Stores Business Score.

Fields:

- business_id
- score
- updated_at

---

## growth_scores

Stores Growth Score.

Fields:

- business_id
- score
- updated_at

---

## ai_recommendations

Stores AI suggestions.

Fields:

- id
- business_id
- title
- description
- priority
- status
- created_at

---

## reports

Stores generated reports.

Fields:

- id
- business_id
- report_type
- report_url
- created_at

---

## notifications

Stores notifications.

Fields:

- id
- business_id
- title
- message
- is_read
- created_at

---

## subscriptions

Stores subscription details.

Fields:

- id
- business_id
- plan
- status
- start_date
- end_date

---

# Database Rules

- Every business belongs to one user.
- Every report belongs to one business.
- Every recommendation belongs to one business.
- Every notification belongs to one business.
- Every subscription belongs to one business.

---

Version: 1.0

Status: Draft

Date: 31 July 2026