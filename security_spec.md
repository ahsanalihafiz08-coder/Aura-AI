# Aura AI Security Specification

## 1. Data Invariants
- **User profiles**: Only the owner of the UID can create, read, or write their profile. The fields `subscriptionTier` and `whatsappConnected` are protected and cannot be escalated without system verification.
- **Leads and CRM Contacts**: A lead or contact cannot be created or accessed unless its `ownerId` strictly matches the active authenticated user's UID.
- **AI Chats**: A user can only access chats that they own or that correspond to their active sessions. Users cannot access other users' chat logs.
- **Voice Sessions**: Voice sessions and transcripts are isolated. Call session ownership belongs strictly to the authenticated `userId`.
- **Activity Logs**: Activity logs are immutable audit trails. Users can create a log corresponding to their action, but cannot update or delete any log.
- **Notifications**: Notifications can only be read, updated, or deleted by the targeted recipient (`userId == auth.uid`).
- **Billing Invoices**: Only read-only access is granted to owners of the `userId` field. No client writes are allowed.

---

## 2. The "Dirty Dozen" Malicious Payloads

### Payload 1: Identity Spoofing (Leads hijacking)
An attacker attempts to create a lead for a target victim `user_abc` to inject junk data.
```json
{
  "id": "malicious_lead_1",
  "ownerId": "user_abc",
  "name": "Malicious Attacker",
  "email": "attacker@spam.com",
  "phone": "+1234567890",
  "value": 1000000,
  "status": "Hot",
  "source": "Hack",
  "createdAt": "2026-07-10T06:58:00Z"
}
```
**Expectation:** `PERMISSION_DENIED` since `ownerId` doesn't match `request.auth.uid`.

### Payload 2: Admin Privilege Escalation
A user tries to upgrade their subscription tier to `Enterprise` through a direct Firestore client update.
```json
{
  "subscriptionTier": "Enterprise"
}
```
**Expectation:** `PERMISSION_DENIED` since RBAC/Subscription changes are locked.

### Payload 3: Lead Deletion Theft
An authenticated user attempts to delete a lead document belonging to another user.
**Expectation:** `PERMISSION_DENIED` because `existing().ownerId` is not equal to `request.auth.uid`.

### Payload 4: Activity Log Tampering
An attacker attempts to delete or rewrite a security activity log to cover their tracks.
```json
{
  "actionType": "MALICIOUS_CLEANUP",
  "description": "Log has been corrupted"
}
```
**Expectation:** `PERMISSION_DENIED` since activity logs are strictly immutable (writes/deletes not allowed).

### Payload 5: ID Poisoning (Resource Exhaustion)
An attacker attempts to create a Lead with a massive 2KB custom document ID to flood Firestore database indexes.
```
Document Path: /leads/a_very_long_garbage_id_of_over_500_characters_designed_to_exhaust_wallet_resources...
```
**Expectation:** `PERMISSION_DENIED` because `isValidId(leadId)` constrains size to `128` characters.

### Payload 6: Value Type Poisoning (Contract value spoofing)
A user attempts to set a negative number or a string to `value` field in `leads` collection.
```json
{
  "value": -99999
}
```
**Expectation:** `PERMISSION_DENIED` as schema asserts `value is number && value >= 0`.

### Payload 7: State Machine Shortcutting
A user tries to directly bypass client limits on WhatsApp synchronization flags.
```json
{
  "whatsappConnected": true
}
```
**Expectation:** `PERMISSION_DENIED` because only backend can write user subscription / integration updates.

### Payload 8: Blanket Query Scrape
An attacker runs a collection query on `/users` without specifying a `where("uid", "==", uid)` clause to scrape usernames.
**Expectation:** `PERMISSION_DENIED` as the list rule checks `resource.data.uid == request.auth.uid`.

### Payload 9: Invalid String Overflow (XSS payload in lead notes)
An attacker tries to write a note field containing a 10MB string to overflow server logs.
**Expectation:** `PERMISSION_DENIED` due to a strict maximum size constraint (e.g., `incoming().notes.size() <= 10000`).

### Payload 10: Sibling Document Modification
An attacker tries to update a Voice Session's `userId` field to match a victim user ID to view their calls.
```json
{
  "userId": "victim_uid_123"
}
```
**Expectation:** `PERMISSION_DENIED` because ownership cannot be transferred.

### Payload 11: Fake Verification Spoofing
A user tries to access write operations by logging in with an unverified email address and spoofing headers.
**Expectation:** `PERMISSION_DENIED` because `request.auth.token.email_verified == true` is strictly required.

### Payload 12: Orphaned Notification Inject
An attacker attempts to create a notification for another user `victim_user` with high importance to trigger a spam alert.
```json
{
  "id": "spam_notif",
  "userId": "victim_user",
  "title": "Spam Urgent Notice",
  "body": "Your bank is compromised"
}
```
**Expectation:** `PERMISSION_DENIED` since `userId` must equal `request.auth.uid`.

---

## 3. Test Suite Runner (`firestore.rules.test.ts`)
We specify a declarative test suite verifying that all these payloads fail synchronously when evaluated against our rules.
