# AccessLens Design Document

**Project:** AccessLens — Public Accessibility Report and Fix Tracker  
**Team:** Akhilan Anbu and Santhosh Malarvannan  
**Course:** Web Development, Summer 2026  
**Instructor:** Professor John Alexis Guerra Gomez  
**Live application:** https://accesslens-akhilan-3pk7.onrender.com/

---

## 1. Project description

AccessLens is a full-stack web application for documenting, searching, and managing detailed accessibility information about public places.

Many general listing websites describe a location only as “accessible” without explaining the details that matter during a real visit. A place may have an accessible entrance but still have a broken elevator, blocked ramp, narrow doorway, inaccessible restroom, missing signage, limited accessible seating, or an unusable parking area.

AccessLens gives visitors and community contributors a structured way to:

- Browse and search public-place listings.
- Filter locations by accessibility features and verification status.
- View detailed accessibility information before visiting.
- Create a missing place listing after signing in.
- Edit or delete only place listings they created.
- Submit accessibility-barrier reports connected to existing places.
- Search and filter reports by barrier type, severity, place category, and status.
- Edit or delete only reports they created.
- Allow a place creator to update the status of reports connected to that place.

The application is built with React Hooks on the client, Node.js and Express on the server, MongoDB using the native Node.js driver, and Passport Local authentication.

---

## 2. Problem statement

Public accessibility information is often incomplete, outdated, or too general to support real decisions.

A single label such as “wheelchair accessible” does not explain:

- Whether the entrance is step-free.
- Whether the elevator is currently working.
- Whether the restroom is accessible.
- Whether the doorway is wide enough.
- Whether accessible parking is available.
- Whether ramps and accessible paths are blocked.
- Whether signage is clear and readable.

Visitors need specific and current information before travelling to a place. Community members need a structured way to report barriers. Listing creators also need a protected method for correcting information and responding to reports without allowing unrelated users to edit or delete their records.

---

## 3. Project goals

AccessLens has six main goals:

1. Provide detailed and searchable accessibility information.
2. Help users make informed decisions before visiting a public place.
3. Allow community members to report current accessibility barriers.
4. Protect shared data using authentication and ownership checks.
5. Provide a responsive interface that works on desktop and mobile devices.
6. Keep each teammate’s full-stack feature independent while integrating both features into one application.

---

## 4. Target users and personas

### Persona 1 — Wheelchair user

**Name:** Maya Chen  
**Age:** 27  
**Occupation:** Graduate student  
**Primary goal:** Confirm that a place can be entered and used comfortably before travelling there.

**Needs:**

- Step-free entrance information
- Ramp availability
- Elevator availability
- Wide entrances
- Accessible restroom information
- Accessible parking information
- Recent listing updates
- Clear address and map links

**Frustration:** A general accessibility label does not explain whether the elevator works or whether the restroom can actually be used.

**How AccessLens helps:** Maya can search for a place, filter by specific accessibility features, open a detailed listing, and review the most useful information before visiting.

---

### Persona 2 — Accessibility advocate

**Name:** Daniel Brooks  
**Age:** 32  
**Occupation:** Community accessibility volunteer  
**Primary goal:** Document barriers and track whether they have been reviewed or fixed.

**Needs:**

- A structured report form
- Barrier categories
- Severity levels
- Suggested-fix field
- Report status
- Search and filter tools
- Report ownership controls

**Frustration:** Standard review websites mix accessibility issues with unrelated reviews and do not provide structured status tracking.

**How AccessLens helps:** Daniel can select an existing place, submit a report, explain the barrier, assign a severity level, suggest a fix, and later update or delete his own report.

---

### Persona 3 — Venue owner or listing creator

**Name:** Priya Shah  
**Age:** 41  
**Occupation:** Café manager  
**Primary goal:** Keep her venue’s accessibility information accurate and respond to reports connected to her listing.

**Needs:**

- Ownership-based place editing
- Ownership-based place deletion
- Report-status controls
- Clear place information
- Contact and website fields
- Protection from unauthorized changes

**Frustration:** She needs to correct outdated information without allowing unrelated users to change or remove her listing.

**How AccessLens helps:** Priya can manage only the place listings she created and can update connected report statuses to Open, In Review, Fixed, or Not Applicable.

---

## 5. User stories and acceptance criteria

## 5.1 Place Directory — Akhilan Anbu

### Story 1 — Create a place

As a signed-in community contributor, I want to create a public-place listing so that useful accessibility information becomes available to other visitors.

**Acceptance criteria:**

- The user must be signed in.
- The form requires a valid name, category, city, and verification status.
- The user can add accessibility features, address details, a description, phone number, and website.
- The server stores the signed-in user as `createdBy`.
- A newly created place appears in the directory.

### Story 2 — Browse and search places

As a visitor, I want to browse and search places by name, city, street, or description so that I can quickly find a relevant location.

**Acceptance criteria:**

- Visitors can use the directory without signing in.
- Search is handled by the server.
- Results are returned in pages.
- A loading state appears while data is being requested.
- An empty state appears when no results match.

### Story 3 — Filter and sort places

As a visitor, I want to filter places by location, category, accessibility feature, and verification status so that I can compare locations based on my needs.

**Acceptance criteria:**

- Filters can be used individually or together.
- Available sort options include recently updated, name A–Z, and name Z–A.
- Signed-in users can filter to only their own places.
- Filters can be cleared using one action.

### Story 4 — View place details

As a visitor, I want to view specific accessibility features, contact information, address, update date, website, and map link so that I can plan my visit.

**Acceptance criteria:**

- The detail view displays the place name, category, address, verification status, and accessibility features.
- The detail view shows the listing creator and last update date.
- Website and Google Maps links open safely in a new tab.
- Edit and delete controls appear only to the place creator.

### Story 5 — Update an owned place

As a listing creator, I want to update only a place I created so that I can correct accessibility information without changing another user’s record.

**Acceptance criteria:**

- The user must be signed in.
- The server checks ownership using the authenticated user ID.
- A non-owner receives a `403 Forbidden` response.
- The `updatedAt` timestamp changes after a successful edit.

### Story 6 — Delete an owned place

As a listing creator, I want to delete only a place I created so that unrelated users cannot remove shared community records.

**Acceptance criteria:**

- The user must be signed in.
- A confirmation prompt appears before deletion.
- The server checks ownership.
- A non-owner receives a `403 Forbidden` response.
- The deleted place is removed from the directory.

---

## 5.2 Accessibility Reports — Santhosh Malarvannan

### Story 1 — Create a report

As a signed-in user, I want to submit an accessibility report for a place so that other visitors know about a current barrier.

**Acceptance criteria:**

- The user must be signed in.
- The report must reference an existing place.
- The user selects a barrier type and severity.
- The description must contain at least ten characters.
- A suggested fix can be included.
- New reports begin with the status `Open`.
- The server stores the signed-in user as `createdBy`.

### Story 2 — Browse, search, and filter reports

As a visitor, I want to browse and filter reports so that I can focus on relevant accessibility concerns.

**Acceptance criteria:**

- Visitors can browse reports without signing in.
- Search covers report descriptions, suggested fixes, place names, and place cities.
- Filters include barrier type, severity, place category, and status.
- Reports can be sorted by most recent, oldest, or highest severity.
- Results use server-supported pagination.

### Story 3 — View report details

As a visitor, I want to view the full report and its related place so that I understand where the barrier occurred and what improvement was suggested.

**Acceptance criteria:**

- The detail view displays the related place.
- The barrier type, severity, description, suggested fix, status, creator, and date are displayed.
- Edit and delete controls appear only to the report creator.
- Status controls appear only to the creator of the related place.

### Story 4 — Update an owned report

As a report creator, I want to edit my own report so that I can correct a mistake or add useful information.

**Acceptance criteria:**

- The user must be signed in.
- The server checks report ownership.
- A non-owner receives a `403 Forbidden` response.
- The report creator cannot change the resolution status through the normal edit route.
- The `updatedAt` timestamp changes after a successful update.

### Story 5 — Delete an owned report

As a report creator, I want to delete my own report so that incorrect or duplicate information can be removed.

**Acceptance criteria:**

- The user must be signed in.
- A confirmation prompt appears before deletion.
- The server checks report ownership.
- A non-owner receives a `403 Forbidden` response.

### Story 6 — Update report status

As a place creator, I want to update the status of reports connected to my listing so that users can see whether an issue is Open, In Review, Fixed, or Not Applicable.

**Acceptance criteria:**

- The user must be signed in.
- The server loads the report and its related place.
- Only the related place creator can update the status.
- Valid statuses are Open, In Review, Fixed, and Not Applicable.
- An unrelated user receives a `403 Forbidden` response.

---

## 6. Independent work division

The two major features are independent full-stack user stories. Each teammate implemented React components, client API calls, Express routes, MongoDB operations, ownership rules, seed data, CSS, and testing for their feature.

### Akhilan Anbu — Place Directory full stack

- Place-directory React interface
- Place cards and place-detail modal
- Create and edit place form
- Place search, filters, sorting, and pagination
- Client Fetch API calls for places
- Express place routes
- Native MongoDB place CRUD
- Server-side place ownership checks
- Place seed data
- Place-specific CSS
- Place feature testing

### Santhosh Malarvannan — Accessibility Reports full stack

- Reports-directory React interface
- Report filters, cards, and report-detail modal
- Create and edit report form
- Report status control
- Report search, filters, sorting, and pagination
- Client Fetch API calls for reports
- Express report routes
- Native MongoDB report CRUD
- Server-side report ownership checks
- Place-owner report-status authorization
- Report seed data
- Report-specific CSS
- Report feature testing

### Shared responsibilities

- Passport Local authentication
- Homepage and navigation
- MongoDB Atlas configuration
- Render deployment
- README and design documentation
- ESLint and Prettier
- Demonstration video
- Final integration testing

---

## 7. Information architecture

```text
AccessLens
|
|-- Home
|   |-- Main place search
|   |-- Browse Place Directory
|   |-- Feature explanation
|   `-- Sign in / Register access
|
|-- Place Directory
|   |-- Search
|   |-- Location filter
|   |-- Category filter
|   |-- Accessibility-feature filter
|   |-- Verification-status filter
|   |-- Ownership filter
|   |-- Sorting
|   |-- Pagination
|   |-- Add place
|   `-- Place detail
|       |-- Address
|       |-- Accessibility features
|       |-- Verification status
|       |-- Contact information
|       |-- Official website
|       |-- Google Maps link
|       |-- Edit owned place
|       `-- Delete owned place
|
|-- Accessibility Reports
|   |-- Search
|   |-- Barrier-type filter
|   |-- Severity filter
|   |-- Place-category filter
|   |-- Status filter
|   |-- Ownership filter
|   |-- Sorting
|   |-- Pagination
|   |-- Submit report
|   `-- Report detail
|       |-- Related place
|       |-- Barrier type
|       |-- Severity
|       |-- Description
|       |-- Suggested fix
|       |-- Status
|       |-- Edit owned report
|       |-- Delete owned report
|       `-- Status control for related place owner
|
`-- Account
    |-- Register
    |-- Sign in
    |-- Sign out
    `-- Current-user information
```

---

## 8. Design system

## 8.1 Visual theme

The interface uses a warm red-and-cream visual system inspired by the AccessLens bird identity.

### Primary colors

- Deep red for headings, navigation, primary buttons, and borders
- Warm cream for page backgrounds
- White for cards, forms, and modals
- Dark brown-red for readable body text
- Green for successful actions and verified states
- Amber or red labels for report severity and status

### Visual principles

- Clear hierarchy
- Large readable headings
- Consistent spacing
- Rounded cards and controls
- Limited decorative effects
- Text labels in addition to icons
- Responsive grid layouts
- Strong visual distinction between primary and destructive actions

## 8.2 Typography

- A display-style heading font is used for major headings.
- A readable sans-serif font is used for forms, navigation, cards, and body text.
- Labels use clear font weight and spacing.
- Body text uses comfortable line height.
- Text is not placed over low-contrast backgrounds.

## 8.3 Interaction patterns

- Actions use semantic `<button>` elements.
- External destinations use `<a>` elements.
- Forms use visible labels connected to inputs.
- Modals include a visible close button.
- Destructive actions require confirmation.
- Loading, empty, success, and error states are shown.
- Disabled controls are visibly different.
- Keyboard focus remains visible.

---

## 9. Low-fidelity design mockups

The following wireframes show the planned structure and content hierarchy of the main screens. They are intentionally low-fidelity mockups rather than screenshots of the completed application.

### 9.1 Home page mockup

```text
+----------------------------------------------------------------------------------+
| [ ACCESSLENS LOGO ]        Home     Places     Reports        [ Sign In ]        |
+----------------------------------------------------------------------------------+
|                                                                                  |
|                         KNOW BEFORE YOU GO                                       |
|                                                                                  |
|          Find detailed accessibility information for public places.              |
|                                                                                  |
|        [ Search by place, city, or accessibility need................ ]          |
|                  [ Search Places ]   [ Browse Directory ]                         |
|                                                                                  |
+----------------------------------------------------------------------------------+
|                                                                                  |
|   +----------------------+  +----------------------+  +----------------------+    |
|   |  FIND A PLACE        |  |  SHARE INFORMATION  |  |  TRACK BARRIERS      |    |
|   |                      |  |                      |  |                      |    |
|   | Search listings and  |  | Add or update a     |  | Submit reports and   |    |
|   | compare accessibility|  | place you created.  |  | follow issue status. |    |
|   +----------------------+  +----------------------+  +----------------------+    |
|                                                                                  |
+----------------------------------------------------------------------------------+
| AccessLens | Places | Reports | Accessibility information | Team                 |
+----------------------------------------------------------------------------------+
```

**Design purpose:**

- Introduce the application immediately.
- Provide one clear search action.
- Provide direct navigation to the Place Directory.
- Explain the main user workflow without overcrowding the page.

---

### 9.2 Place Directory mockup

```text
+----------------------------------------------------------------------------------+
| [ ACCESSLENS ]             Home     Places     Reports        [ Account ]         |
+----------------------------------------------------------------------------------+
| PLACE DIRECTORY                                      [ + Add a public place ]    |
| Find detailed accessibility information before visiting a location.              |
+----------------------------------------------------------------------------------+
| FILTERS                         | RESULTS: 1,005 places      [ Recently updated v] |
|---------------------------------|------------------------------------------------|
| Search                          | +------------------+ +------------------+        |
| [ Name or address........... ]  | | Harbor Library   | | Maple Café       |        |
|                                 | | Library · Boston | | Café · Cambridge |        |
| Location                        | | Verified         | | Pending          |        |
| [ City or state............ ]   | |                  | |                  |        |
|                                 | | ✓ Step-free      | | ✓ Wide entrance |        |
| Category                        | | ✓ Elevator       | | ✓ Restroom      |        |
| [ All categories          v ]   | |                  | |                  |        |
|                                 | | [ View details ] | | [ View details ] |        |
| Accessibility feature           | +------------------+ +------------------+        |
| [ All features            v ]   |                                                |
|                                 | +------------------+ +------------------+        |
| Verification status             | | Riverside Park   | | Central Museum   |        |
| [ Any status              v ]   | | Park · Boston    | | Museum · Quincy  |        |
|                                 | | Verified         | | Verified         |        |
| [ ] Only my places              | | [ View details ] | | [ View details ] |        |
|                                 | +------------------+ +------------------+        |
| [ Clear filters ]               |                                                |
|                                 |             [ < ]  Page 1 of 84  [ > ]          |
+----------------------------------------------------------------------------------+
```

**Design purpose:**

- Keep filters separate from results.
- Make the number of matching places visible.
- Support quick comparison through consistent place cards.
- Keep the add-place action visible for signed-in users.

---

### 9.3 Place Detail mockup

```text
+----------------------------------------------------------------------------------+
|                              PLACE DETAILS                                  [ X ] |
+----------------------------------------------------------------------------------+
| BOSTON PUBLIC LIBRARY                                [ VERIFIED ]                |
| Library                                                                        |
| 700 Boylston Street, Boston, MA 02116                                      |
|                                                                                |
| [ Open in Google Maps ]     [ Visit official website ]                          |
|                                                                                |
|                                                    [ Edit ]   [ Delete ]          |
|                                          owner-only controls shown when allowed |
+--------------------------------------+-------------------------------------------+
| ACCESSIBILITY AT THIS PLACE          | LISTING INFORMATION                       |
|                                      |                                           |
| ✓ Step-free entrance                 | Last updated: July 16, 2026                |
| ✓ Automatic door                     | Listing creator: Community member          |
| ✓ Wide entrance                      | Phone: (617) 555-1234                      |
| ✓ Elevator                           | Verification status: Verified              |
| ✓ Accessible restroom                |                                           |
| ✓ Accessible seating                 |                                           |
+--------------------------------------+-------------------------------------------+
| WHAT TO KNOW                                                                     |
| The main entrance is step-free. The elevator connects all public floors.         |
| Accessible restrooms are available near the first-floor information desk.        |
+----------------------------------------------------------------------------------+
```

**Design purpose:**

- Present the most important access information first.
- Separate confirmed accessibility features from general listing information.
- Make map and website links easy to find.
- Display owner controls only when authorization allows them.

---

### 9.4 Accessibility Reports mockup

```text
+----------------------------------------------------------------------------------+
| [ ACCESSLENS ]             Home     Places     Reports        [ Account ]         |
+----------------------------------------------------------------------------------+
| ACCESSIBILITY REPORTS                                  [ + Submit a report ]     |
| Review current barriers, suggested fixes, severity levels, and resolution status.|
+----------------------------------------------------------------------------------+
| FILTERS                         | RESULTS: 1,600 reports       [ Most recent v ]   |
|---------------------------------|------------------------------------------------|
| Search                          | +------------------+ +------------------+        |
| [ Place or description..... ]  | | Broken elevator  | | Blocked ramp     |        |
|                                 | | Harbor Library   | | Maple Café       |        |
| Barrier type                    | | Severity: High   | | Severity: Medium |        |
| [ All barrier types       v ]   | | Status: Open     | | Status: Review   |        |
|                                 | | July 16, 2026    | | July 15, 2026    |        |
| Severity                        | |                  | |                  |        |
| [ Any severity            v ]   | | [ View report ] | | [ View report ] |        |
|                                 | +------------------+ +------------------+        |
| Place category                  |                                                |
| [ All categories          v ]   | +------------------+ +------------------+        |
|                                 | | Missing signage  | | Narrow entrance |        |
| Status                          | | Central Museum   | | Riverside Store  |        |
| [ Any status              v ]   | | Severity: Low    | | Severity: High   |        |
|                                 | | Status: Fixed    | | Status: Open     |        |
| [ ] Only my reports             | | [ View report ] | | [ View report ] |        |
|                                 | +------------------+ +------------------+        |
| [ Clear filters ]               |                                                |
|                                 |             [ < ]  Page 1 of 134 [ > ]          |
+----------------------------------------------------------------------------------+
```

**Design purpose:**

- Make the report’s place, barrier, severity, and status visible on each card.
- Allow visitors to combine filters.
- Keep report submission clearly available to signed-in users.
- Use pagination for the large report collection.

---

### 9.5 Report Detail mockup

```text
+----------------------------------------------------------------------------------+
|                              REPORT DETAILS                                 [ X ] |
+----------------------------------------------------------------------------------+
| BROKEN ELEVATOR                                               [ STATUS: OPEN ]    |
| Related place: Harbor Library                                                    |
| Severity: High                                                                  |
| Reported: July 16, 2026                                                         |
| Report creator: Community member                                                |
|                                                                                |
|                                                    [ Edit ]   [ Delete ]          |
|                                          report-owner controls shown when allowed|
+----------------------------------------------------------------------------------+
| DESCRIPTION                                                                      |
| The public elevator was out of service and no clear alternative route was posted.|
|                                                                                  |
| SUGGESTED FIX                                                                    |
| Repair the elevator and place temporary signs directing visitors to an accessible|
| alternative entrance or route.                                                   |
+----------------------------------------------------------------------------------+
| PLACE-OWNER STATUS CONTROL                                                       |
| Current status: [ Open v ]                       [ Update status ]                |
| This section is available only to the creator of the related place.              |
+----------------------------------------------------------------------------------+
```

**Design purpose:**

- Show the full report in a clear reading order.
- Connect the issue to its related place.
- Separate report-owner actions from place-owner status controls.
- Communicate severity and status using both text and visual labels.

---

## 10. React component design

### Shared components

- `App`
- `Header`
- `Hero`
- `AccountPanel`
- `AuthModal`
- `Modal`
- `Pagination`
- `EmptyState`
- `Toast`
- `Footer`

### Place components

- `PlaceDirectory`
- `PlaceCard`
- `PlaceDetail`
- `PlaceForm`

### Report components

- `ReportDirectory`
- `ReportFilters`
- `ReportCard`
- `ReportDetail`
- `ReportForm`
- `ReportStatusControl`

Each React component is stored in its own file. Components that require styling import a matching CSS file. Collection-rendering components define PropTypes for their data and callback properties.

---

## 11. State and Hooks design

React Hooks manage client-side state and asynchronous data loading.

### Main Hooks used

- `useState` for active views, authentication state, filters, selected records, forms, loading states, and notifications.
- `useEffect` for authentication restoration, route/hash changes, API loading, and toast timing.
- `useCallback` for reusable data-loading and notification functions.
- A custom `useDebounce` Hook delays text-search requests so the API is not called for every keystroke.

### Client-side rendering

- The application is rendered by React in the browser.
- The client requests data from `/api` routes using the Fetch API.
- The active view is stored in the URL hash.
- Express serves the production React files from `client/dist` on Render.

---

## 12. MongoDB data design

The application uses three MongoDB collections.

## 12.1 `users`

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 12.2 `places`

```js
{
  _id: ObjectId,
  name: String,
  category: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String
  },
  accessibilityFeatures: [String],
  description: String,
  contact: {
    phone: String,
    website: String
  },
  verificationStatus: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 12.3 `reports`

```js
{
  _id: ObjectId,
  placeId: ObjectId,
  barrierType: String,
  severity: String,
  description: String,
  suggestedFix: String,
  status: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 13. Data relationships

```text
User 1 -------------------- many Places
User 1 -------------------- many Reports
Place 1 ------------------- many Reports

places.createdBy ---------- users._id
reports.createdBy --------- users._id
reports.placeId ----------- places._id
```

- One user can create many places.
- One user can create many reports.
- One place can have many reports.
- A place stores its creator in `createdBy`.
- A report stores its creator in `createdBy`.
- A report references its related place through `placeId`.

---

## 14. API design

## 14.1 Health route

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Confirm that the server is running |

## 14.2 Authentication routes

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/api/auth/me` | Optional | Return the current authenticated user |
| POST | `/api/auth/register` | No | Register a new account and sign in |
| POST | `/api/auth/login` | No | Sign in with Passport Local |
| POST | `/api/auth/logout` | Session | Sign out and destroy the session |

## 14.3 Place routes

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/api/places` | Optional | Search, filter, sort, and paginate places |
| GET | `/api/places/meta/options` | No | Return valid place form and filter options |
| GET | `/api/places/:id` | Optional | Read one place and its public creator information |
| POST | `/api/places` | Required | Create a place owned by the signed-in user |
| PUT | `/api/places/:id` | Place owner | Update an owned place |
| DELETE | `/api/places/:id` | Place owner | Delete an owned place |

## 14.4 Report routes

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/api/reports` | Optional | Search, filter, sort, and paginate reports |
| GET | `/api/reports/:id` | Optional | Read one report with related place and creator information |
| POST | `/api/reports` | Required | Create a report for an existing place |
| PUT | `/api/reports/:id` | Report owner | Update an owned report |
| DELETE | `/api/reports/:id` | Report owner | Delete an owned report |
| PATCH | `/api/reports/:id/status` | Related place owner | Update the report status |

---

## 15. Authentication and authorization design

Passport Local authenticates users using email and password.

- Registration validates the name, email, and password.
- Passwords are salted and hashed using Node.js `crypto.scrypt`.
- The authenticated user ID is serialized into the Express session.
- The user is restored on future requests.
- The session cookie is HTTP-only and uses `sameSite: "lax"`.
- Secure cookies are enabled in production.

### Place authorization rules

- Anyone can read places.
- A signed-in user can create a place.
- Only the creator can update a place.
- Only the creator can delete a place.

### Report authorization rules

- Anyone can read reports.
- A signed-in user can create a report.
- Only the report creator can edit a report.
- Only the report creator can delete a report.
- Only the related place creator can update the report status.

The frontend hides actions that are not available, but the backend independently verifies every protected update and delete request.

---

## 16. Search, filtering, sorting, and pagination

## 16.1 Place Directory

### Search fields

- Place name
- Description
- City
- Street address

### Filters

- Location
- Category
- Accessibility feature
- Verification status
- Only places created by the current user

### Sort options

- Recently updated
- Name A–Z
- Name Z–A

### Pagination

- Twelve places are requested per page.
- The server returns the current page, page size, total result count, and total pages.

## 16.2 Accessibility Reports

### Search fields

- Report description
- Suggested fix
- Related place name
- Related place city

### Filters

- Barrier type
- Severity
- Place category
- Status
- Only reports created by the current user

### Sort options

- Most recent
- Oldest first
- Highest severity

### Pagination

- Twelve reports are requested per page.
- MongoDB aggregation joins each report with its related place before filtering and returning results.

---

## 17. Validation and error handling

## 17.1 Client-side behavior

- Required fields are clearly identified.
- Forms use controlled inputs.
- Invalid or failed actions display an error message.
- Success actions display a toast notification.
- Submit buttons show a busy or disabled state while saving.
- Empty search results display an explanatory empty state.
- Delete actions require confirmation.

## 17.2 Server-side validation

- Request bodies are validated independently of the frontend.
- Text values are trimmed and limited to safe lengths.
- MongoDB identifiers are validated before use.
- Place category, accessibility features, report barrier type, severity, and status are restricted to known values.
- Protected actions require an authenticated user.
- Ownership is verified before updates and deletions.

## 17.3 HTTP responses

- `200 OK` for successful reads and updates.
- `201 Created` for successful creation.
- `204 No Content` for successful deletion and logout.
- `400 Bad Request` for invalid input or identifiers.
- `401 Unauthorized` when sign-in is required.
- `403 Forbidden` when the user does not own the protected record.
- `404 Not Found` when a record or API route does not exist.
- `409 Conflict` when registration uses an existing email.
- `500 Internal Server Error` for unexpected server failures.

---

## 18. Accessibility considerations

Because the application is about public accessibility, the interface itself follows accessible design practices.

- Semantic HTML is used.
- Buttons use `<button>` rather than clickable `<div>` or `<span>` elements.
- Form labels are connected to controls.
- Keyboard users can reach interactive elements.
- Visible focus styles are retained.
- A skip link allows users to move directly to the main content.
- Color is not the only way severity, status, or verification is communicated.
- Images include alternative text.
- Modals have visible close controls.
- Text and backgrounds use readable contrast.
- Content remains usable at smaller widths.
- Loading and result-count changes use suitable live-region behavior where appropriate.

---

## 19. CSS organization and responsive design

- Components that require styling have their own CSS files.
- The CSS file uses the same base name as its React component.
- Shared application styles are stored in `App.css` and `index.css`.
- Desktop views use card grids and two-column directory layouts.
- Filters stack above results on narrower screens.
- Forms and modal content adapt to smaller widths.
- Buttons remain large enough to use on touch devices.
- Text does not rely on fixed pixel widths that would cause horizontal scrolling.

---

## 20. Seed-data design

The final seed creates:

- **4 demo users**
- **1,005 place records**
- **1,600 accessibility-report records**

### Place variation

Seeded places vary by:

- Category
- City and state
- Accessibility features
- Verification status
- Description
- Contact information
- Creator
- Creation and update date

### Report variation

Seeded reports vary by:

- Related place
- Barrier type
- Severity
- Status
- Description
- Suggested fix
- Creator
- Creation and update date

### Demo accounts

The seed creates accounts for both team members and two community personas. Seeded passwords are hashed before being stored.

---

## 21. Testing plan

## 21.1 Authentication tests

- Register with valid information.
- Reject an invalid email.
- Reject a password shorter than eight characters.
- Reject registration using an existing email.
- Sign in with a valid account.
- Reject an incorrect password.
- Restore the authenticated session after refresh.
- Sign out successfully.

## 21.2 Place tests

- Create a place while signed in.
- Reject place creation while signed out.
- Load the place directory.
- Search by name, city, street, or description.
- Filter by category, feature, location, and verification status.
- Sort and paginate results.
- Open place details.
- Edit an owned place.
- Reject an edit by an unrelated user.
- Delete an owned place.
- Reject deletion by an unrelated user.

## 21.3 Report tests

- Create a report while signed in.
- Reject report creation while signed out.
- Reject a report referencing an invalid place.
- Load the reports directory.
- Search by place, description, city, or suggested fix.
- Filter by barrier type, severity, category, and status.
- Sort and paginate results.
- Open report details.
- Edit an owned report.
- Reject an edit by an unrelated user.
- Delete an owned report.
- Reject deletion by an unrelated user.
- Update status as the related place creator.
- Reject a status change by an unrelated user.

## 21.4 Code-quality tests

- Run ESLint for the server.
- Run ESLint for the client.
- Run Prettier for both projects.
- Build the React production application.
- Confirm no Axios, Mongoose, or CORS package is included.
- Confirm no secret `.env` file is committed.

## 21.5 Production tests

- Public homepage loads from Render.
- API health route responds.
- MongoDB Atlas data loads.
- Registration, login, session restoration, and logout work.
- Place CRUD works in production.
- Report CRUD works in production.
- Report-status authorization works in production.
- Direct page refresh returns the React application.
- The interface remains usable on mobile widths.

---

## 22. Deployment architecture

```text
User browser
     |
     | HTTPS
     v
Render Web Service
     |
     |-- React production files from client/dist
     |-- Express API routes
     |-- Passport Local authentication
     |-- Express sessions
     |
     v
MongoDB Atlas
     |
     |-- users
     |-- places
     `-- reports
```

The React application and Express API share one origin in production. Therefore, no CORS package is required.

### Production workflow

1. Install server and client dependencies.
2. Build the React client with Vite.
3. Start the Express server.
4. Serve `client/dist` from Express in production.
5. Connect to MongoDB Atlas using environment variables stored in Render.

---

## 23. Security considerations

- MongoDB credentials and session secrets are stored in environment variables.
- The real `.env` file is excluded from Git.
- Passwords are never stored in plain text.
- Password hashes are not returned in API responses.
- Express disables the `X-Powered-By` header.
- Security-related response headers are added.
- Request bodies have a size limit.
- User input is cleaned and length-limited.
- MongoDB IDs are validated.
- Ownership is enforced by the server.
- Session cookies are HTTP-only.
- Production cookies use the secure option.

---

## 24. Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React, React Hooks, ReactDOM, PropTypes, Vite |
| Client requests | Native Fetch API |
| Backend | Node.js and Express |
| Database | MongoDB native Node.js driver |
| Authentication | Passport Local and Express Session |
| Password hashing | Node.js `crypto.scrypt` |
| Code quality | ESLint and Prettier |
| Deployment | Render |
| License | MIT |

The project does not use Axios, Mongoose, the CORS package, a template engine, or server-side React rendering.

---

## 25. AI-use disclosure

Generative AI was used for limited brainstorming, debugging assistance, and documentation drafting. Both team members reviewed, modified, understood, and tested all submitted code and documentation.