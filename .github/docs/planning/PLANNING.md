# Planning during development

## Feature: User Groups for Leaderboards

**Status**: Planned  
**Date**: March 9, 2026

### Overview

Allow users to create and join groups so they can compete on separate leaderboards with their friends, while maintaining a "default" group for all users who haven't chosen a specific group.

### User Flow

1. On registration, users are automatically assigned to "default" group
2. When logged in, users see two forms below the leaderboard:
   - **CreateGroup**: Input field + button to create/join a group with a custom name
   - **ChooseGroup**: Dropdown with all existing groups + button to switch groups
3. Leaderboard only shows users from the same group
4. Users can only be in one group at a time

### Implementation Plan

#### Phase 1: User Model & Registration

- **Update User Model** (`src/models/User.ts`)
  - Add `group` field (string, default: "default")
  - Case-insensitive storage (stored lowercase)
  - Max 30 characters, alphanumeric + spaces/dashes
- **Update Registration** (`src/app/api/auth/register/route.ts`)
  - No code change needed (default value in schema handles this)

#### Phase 2: Backend API Routes

- **Create Group Management API** (`src/app/api/user/group/route.ts`)
  - `PUT /api/user/group` - Update current user's group
  - Requires authentication
  - Validates group name format
- **Create Groups List API** (`src/app/api/groups/route.ts`)
  - `GET /api/groups` - Get all unique group names from users
  - Public endpoint (for the dropdown)
  - Returns sorted array of group names

- **Update Leaderboard API** (`src/app/api/leaderboard/route.ts`)
  - Add group filtering based on current user's group
  - If no user authenticated, show "default" group
  - Join users with bets filtered by group

#### Phase 3: Frontend Components

- **Create GroupManagement Component** (`src/components/GroupManagement.tsx`)
  - Client component with auth context
  - Contains both CreateGroup and ChooseGroup forms
  - Shows current group name prominently
  - Form validations matching backend rules
- **Update Main Page** (`src/app/page.tsx`)
  - Add GroupManagement component below leaderboard
  - Pass necessary props (tournament ID, current user)
- **Update Leaderboard Component** (`src/components/Leaderboard.tsx`)
  - Pass user's group to API (from auth context)
  - Display group name in heading: "Highscore - Group: [groupname]"
  - Show "Highscore - All Users (Default)" for default group

#### Phase 4: Documentation

- **Update docs**
  - Add new API endpoints to `docs/backend/api-routes.md`
  - Update `docs/backend/database-models.md` with new User field

### Technical Decisions

**Group Name Rules:**

- Case-insensitive (stored and compared in lowercase)
- Max 30 characters
- Allowed: alphanumeric + spaces + dashes
- Leading/trailing whitespace trimmed
- Default value: "default"

**CreateGroup vs ChooseGroup:**

- CreateGroup: If group name already exists, user joins that group (acts like choose)
- ChooseGroup: Select from existing groups only
- Both forms update the same field

**Leaderboard Filtering:**

- Filter bets by users in the same group
- Unauthenticated users see "default" group
- Group name displayed in leaderboard title for clarity

### User Experience Notes

- Current group is prominently displayed
- Both forms available to allow flexibility (create new or choose existing)
- Seamless switching between groups
- No need to delete groups (unused groups simply won't appear in dropdown)
