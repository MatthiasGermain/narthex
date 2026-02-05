# Story 3.7: Delete Event with Confirmation

**Epic:** 3 - Event Management (Core MVP)
**FRs:** FR13

---

**As a** volunteer,
**I want** to delete an event with confirmation,
**So that** I don't accidentally remove important events.

## Acceptance Criteria

**Given** I click "Supprimer" on an event
**When** a confirmation dialog appears: "Supprimer cet événement ?"
**And** I click "Confirmer"
**Then** the event is deleted via Payload REST API
**And** I see a Toast: "Événement supprimé"
**And** the event list refreshes

**Given** I click "Annuler" in the dialog
**Then** the event is not deleted
**And** the dialog closes

## Technical Notes

- Uses Shadcn/ui Dialog component
