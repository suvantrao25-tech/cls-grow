# Database Schema

Version: 1.0

Status: Draft

Last Updated: 31 July 2026

---

# Objective

Design a scalable database for CLS Grow.

The database should support multiple business types,
AI analysis, reports, subscriptions, and future expansion.

---

# Core Tables

## 1. users

Purpose

Store account information.

Fields

- id
- full_name
- email
- mobile
- created_at
- updated_at

---

## 2. businesses

Purpose

Store business information.

Fields

- id
- user_id
- business_name
- business_type
- business_category
- owner_name
- phone
- email
- website
- google_business_url
- created_at

---

## 3. business_locations

Purpose

Store business location.

Fields

- id
- business_id
- address
- city
- state
- pin_code
- country
- latitude
- longitude

---

## 4. business_profiles

Purpose

Store detailed business profile.

Fields

- id
- business_id
- years_in_business
- employees
- products_services
- business_goals
- profile_completion

---

## 5. business_scores

Purpose

Store Business Score history.

Fields

- id
- business_id
- score
- score_level
- calculated_at

---

## 6. growth_scores

Purpose

Store Growth Score history.

Fields

- id
- business_id
- score
- trend
- calculated_at

---

## 7. ai_recommendations

Purpose

Store AI-generated recommendations.

Fields

- id
- business_id
- priority
- category
- recommendation
- status
- created_at

---

## 8. reports

Purpose

Store generated reports.

Fields

- id
- business_id
- report_type
- report_title
- generated_at

---

## 9. notifications

Purpose

Store notifications.

Fields

- id
- business_id
- title
- message
- priority
- is_read
- created_at

---

## 10. subscriptions

Purpose

Store subscription details.

Fields

- id
- business_id
- plan
- status
- start_date
- end_date

---

# Relationships

User

↓

Business

↓

Business Profile

↓

Business Score

↓

Growth Score

↓

AI Recommendations

↓

Reports

↓

Notifications

---

# Database Goals

- Scalable
- Secure
- Fast
- AI Ready
- Multi-Business Support

---

Version: 1.0

Status: Draft