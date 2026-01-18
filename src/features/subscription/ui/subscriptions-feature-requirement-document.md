# Subscription Feature Requirements & Documentation

This document outlines the requirements and implementation details for the Subscription management feature in the Expense Tracker application.

## 1. Feature Overview
The Subscription feature allows users to track their recurring payments, providing visibility into their total financial commitments on a monthly and yearly basis. It supports different billing cycles and provides a clear distinction between active and cancelled services.

## 2. User Interface (UI) Structure

### 2.1 Main Page (`/subscription`)
- **Header**: Displays "Subscriptions" with a right-aligned "Add" button (pill-shaped, rounded-full).
- **Tabs**: Two main views using Shadcn UI Tabs:
  - **Active**: Shows current subscriptions and a financial summary.
  - **Inactive**: Shows cancelled or expired subscriptions.

### 2.2 Financial Summary (Active Tab Only)
- A high-impact, elegant summary card at the top of the Active tab.
- **Monthly Commitment**: Displays the normalized monthly cost of all active subscriptions.
- **Yearly Total**: Displays the total annual cost of all active subscriptions.
- **Styling**: White background, subtle gray-100 border, and refined typography (`text-[10px]` uppercase labels).

### 2.3 Subscription List
- Subscriptions are grouped by their billing cycle in the following order:
  1. **Yearly**
  2. **Quarterly**
  3. **Monthly**
- **Dynamic Hiding**: If a specific billing cycle has zero subscriptions (e.g., no "Quarterly" items), the entire section header and its corresponding list must be hidden from view.
- Each visible group header displays the section title (e.g., "MONTHLY") and the subtotal for that specific group (Active tab only).

### 2.4 Subscription Card
- **Design**: Subtle rounded cards with a clean horizontal layout.
- **Information Displayed**:
  - **Name**: The name of the service.
  - **Status Badge**: An "Expiring" badge (amber) if the subscription is set to expire.
  - **Dates**: 
    - Active: "Renewal: [Date]" or "Expires: [Date]" if expiring.
    - Inactive: "Expired: [Date]".
  - **Amount**: The cost formatted in SGD.
  - **Billing Period**: Labeled as "per year", "per quarter", or "per month".
- **Visual Feedback**: Active cards are bright white; Inactive cards are muted with reduced opacity and a light gray background.

## 3. Data Model

```typescript
type SubscriptionPeriod = "Yearly" | "Quarterly" | "Monthly";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextPaymentDate: string; // YYYY-MM-DD
  period: SubscriptionPeriod;
  isActive: boolean;
  isExpiring?: boolean;    // Indicates if the user has set it to expire
  expireDate?: string;     // The date it actually expired
}
```

### 3.1 Date Logic Mapping

To maintain clarity between what the user enters and what is displayed on the cards, use the following mapping:

| Subscription State | Modal Input Label | Database Property | UI Card Label |
| :--- | :--- | :--- | :--- |
| **Standard Active** | Next Payment Date | `nextPaymentDate` | **Renewal:** [Date] |
| **Expiring** (Active) | Final Payment Date | `nextPaymentDate` | **Expires:** [Date] |
| **Inactive** | N/A | `expireDate` | **Expired:** [Date] |

## 4. Interactivity & Gestures

### 4.1 Swipe to Delete
- Users can swipe left on any subscription card (Active or Inactive) to reveal a red **Delete** button.
- The delete button reveals a trash icon and is perfectly aligned with the card's height.
- Clicking the delete button removes the entry from the list.

### 4.2 Click to Edit
- Clicking on an **Active** subscription card opens the **Edit Subscription Modal**.
- Inactive cards are non-clickable for editing.

### 4.3 Add Subscription
- Clicking the "Add" button opens the **Add Subscription Modal**.

## 5. Modals (Add & Edit)

### 5.1 Common Design
- **Animation**: Smooth slide-in from bottom and zoom-in effect.
- **Backdrop**: Dark overlay with blur effect.
- **Scroll Management**: Prevents underlying page scroll when open (compatible with iOS Safari).

### 5.2 Form Fields
- **Amount**: High-impact numeric input with a dollar sign prefix.
- **Subscription Name**: Text input for the service name.
- **Billing Cycle**: Dropdown (Select) with options: **Monthly**, **Quarterly**, **Yearly**.
- **Next Payment Date**: Date picker input.
- **Expire Checkbox**: "Subscription expires on this date".
  - **Logic**: Checking this changes the date label to "Final Payment Date".

### 5.3 Validation & Safety
- **Required Fields**: Save/Update buttons are disabled until Name, Amount, and Date are provided.
- **Date Restriction**: Users cannot select a date before "Today".
- **Cross-Platform Consistency**: 
  - Uses local timezone calculation for "Today" to avoid UTC day-offset issues.
  - Implements manual JavaScript validation in the `onChange` handler to override browsers (like Mobile Safari) that ignore the `min` attribute on native date pickers.

## 6. Business Logic & Calculations

### 6.1 Normalization
To calculate the "Monthly Commitment", subscriptions are normalized:
- **Yearly**: Amount / 12
- **Quarterly**: Amount / 3
- **Monthly**: Amount (as is)

### 6.2 Rolling Logic (Future Backend Requirement)

The system must handle the transition of dates as time passes:
- **Automatic Rollover**: When the current date passes `nextPaymentDate`, if `isExpiring` is **false**, the system increments `nextPaymentDate` by the `period` (e.g., +1 month, +3 months, or +1 year).
- **Expiration Transition**: When the current date passes `nextPaymentDate`, if `isExpiring` is **true**:
  1. Set `isActive` to `false`.
  2. Set `expireDate` to the value of `nextPaymentDate`.
  3. The subscription moves from the "Active" tab to the "Inactive" tab.
