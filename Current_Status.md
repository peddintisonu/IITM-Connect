# IITMConnect - Current Status

**Date:** 17-04-2026

## Completed

### Monorepo and Tooling

- npm workspaces configured for `client` and `server`
- Shared TypeScript and ESLint setup is working
- Root scripts for dev, build, lint, format, clean, and reinstall are available

### Backend API (Implemented)

#### App Wiring

- Route prefixes currently mounted:
    - `/api/v1/auth`
    - `/api/v1/students`
    - `/api/v1/social`
- Utility endpoints:
    - `GET /api/v1/health`
    - `GET /api-docs`
    - `GET /api-docs.json`

#### Auth Module

- Google OAuth with `@smail.iitm.ac.in` restriction
- Cookie-based auth with access and refresh JWT tokens
- Refresh token hashing and rotation
- Session model with per-device records and TTL expiry
- Session listing and per-session revocation
- Logout current session and logout-all flows

#### Student Module

- Onboarding endpoint with username uniqueness and privacy defaults
- Current user profile fetch
- Profile, hostel, and privacy update endpoints
- Profile and cover image upload to Cloudinary
- Privacy-aware profile lookup by username

#### Social Module

- Follow request lifecycle:
    - send request
    - cancel outgoing pending request
    - accept/reject incoming request
    - unfollow
    - remove follower
- Block lifecycle:
    - block
    - unblock
    - list blocked users
- Relationship lookup endpoint (`/api/v1/social/relationship/:studentId`)

#### Core Master Data

- Models for hostels, departments, and courses
- Seed runner and constants-based seeding are implemented

### Frontend (Implemented)

- Landing page UI is implemented
- OAuth entry CTA links to backend Google auth endpoint
- Responsive navbar and video-backed hero are present

## In Progress / Not Started

- Org hierarchy and POR management modules
- Feed and post system
- Events, polls, forums, and complaint workflows
- Notifications and real-time features
- Admin/super-admin operations panel
- Full post-login frontend app screens

## Known Documentation and Contract Notes

- Canonical student route prefix is `/api/v1/students` (plural)
- Auth refresh endpoint is currently `GET /api/v1/auth/refresh`
    - This should be migrated to `POST` for better REST semantics

## Next Priorities

1. Implement org and POR core models and APIs.
2. Implement feed/post/events/polls backend modules.
3. Build post-login frontend pages (dashboard, profile, social flows).
4. Move refresh from GET to POST and align client integration.
5. Add tests for auth/session, privacy boundaries, and social edge cases.
