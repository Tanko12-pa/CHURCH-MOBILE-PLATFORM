# Firebase Security Specification & TDD Spec

## 1. Data Invariants

*   **Identity Pinning**: When creating a member, visitor, email campaign, or logging attendance, the user must be authenticated.
*   **Timestamp Integrity**: Fields like `createdAt` or `updatedAt` must match the server's state time (`request.time`).
*   **Static Guard checks**: Document structures must match required fields exactly (no shadow attributes allowed).
*   **Immutability Gates**: Key primary keys such as `id` or critical associations cannot be altered once written.

## 2. The Dirty Dozen Payloads (Target rejection checks)

1.  **Impersonation Attack**: Setting `id` of a new member record to spoof another account.
2.  **Shadow Schema Injection**: Storing extra non-existent parameters like `isAdmin: true` in member records.
3.  **Invalid Demographic Enumeration**: Storing `demographic: "Alien"`.
4.  **Improper Status Enumeration**: Submitting `status: "Banned"` in newcomers.
5.  **Negative Attendance Count**: Logging `attendanceCount: -5`.
6.  **Unauthenticated Write**: Writing to `members` collection as non-signed-in client.
7.  **Unverified Email Write**: Writing to collections before verifying registered credentials.
8.  **Invalid ID Format Injection**: Injecting deep characters/paths `./%2Fguest` as IDs.
9.  **Arbitrary Time Stamp spoofing**: Setting a client clock time 3 years in the future for `joinedAt` or similar.
10. **Bypassing Read Limits**: Querying general collections without matching permissions.
11. **Malicious Quote Modification**: Modifying an archive key illustration for a finished sermon.
12. **Malicious Email campaign state overwrite**: Rewriting history to set sent state back to draft.

## 3. Test Runner Specifications
Tests require mock Firestore environments verifying these structures return standard `PERMISSION_DENIED` errors.
