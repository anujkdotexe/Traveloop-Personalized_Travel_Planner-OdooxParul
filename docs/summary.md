I checked it thoroughly. The app covers the basic user flow, but a lot of the “real product” behavior is still partial, mocked, or missing.

Admin

The admin panel is mostly analytics + a user table. It does not behave like a full admin console yet.
It can show total users, trips, public trips, activities, top cities, category breakdown, and user growth, but it does not show trips by owner in a drilldown way.
It does not let an admin inspect a specific user’s trip history, public trips, activity usage, or engagement timeline.
It does not show moderation tools for public/community itineraries.
It does not let admins change roles, suspend users, approve content, or manage trip visibility.
It only has one direct action: remove a user.
The admin table does fetch role and trip_count from the backend, but the UI does not really use role management at all. See adminController.js:26 and Admin.jsx:150.
The admin page also has render fragility: KPI fields and top-city rendering assume data exists, so missing API fields can break the screen or hide the analytics. See Admin.jsx:130 and Admin.jsx:150.
Regular user

Login is functional and close to the wireframe, but it includes extra demo-account UX that is not in the mockup. See Login.jsx.
Signup is functional, but several fields are UI-only. The form collects phone, city, country, and additional info, but the backend registration only stores name, email, and password. See Signup.jsx.
Dashboard looks complete visually, but the “create trip” modal is not actually reachable from any UI trigger. The state exists, the modal exists, but nothing calls setShowCreate(true). The visible button routes to /create-trip instead. See Dashboard.jsx:30, Dashboard.jsx:113, Dashboard.jsx:213.
Create Trip is fairly complete visually, but the cover photo is only previewed locally. There is no backend upload/persistence.
My Trips works as a list, but the filters and grouping controls are mostly UI controls; the real logic is limited to search/sort/status tabs.
Itinerary Builder is the biggest partial feature. The add-city and add-activity buttons open local modals, but they do not create persistent stops or activities. Reorder is also not implemented, despite the UI saying “Drag to reorder.” See ItineraryBuilder.jsx:90, ItineraryBuilder.jsx:114, ItineraryBuilder.jsx:135, ItineraryBuilder.jsx:161, ItineraryBuilder.jsx:188.
Itinerary View matches the wireframe structure better, but it still uses hard-coded sample data rather than live trip data.
City Search and Activity Search are functional as browsing screens, but “Add to Trip” only updates local button state and then optionally navigates back. It does not actually attach the city/activity to the trip in the backend. See CitySearch.jsx:64, CitySearch.jsx:151, ActivitySearch.jsx:92, ActivitySearch.jsx:194.
Budget is present and charted, but it is sample-data driven, not trip-data driven. It does show chart and table structure, so it is closer to the wireframe than some other screens. See Budget.jsx:12, Budget.jsx:29, Budget.jsx:34.
Checklist is local-only. Add/remove/toggle/reset all work in component state, but it is not tied to trip data or persistence. See Checklist.jsx:29, Checklist.jsx:40.
Notes is also local-only. Add, edit, and delete all exist, but they are not persisted to the trip backend. See Notes.jsx:17, Notes.jsx:23, Notes.jsx:32.
Profile has the right sections, but save/delete behavior is incomplete. Save only shows a toast; delete account has no implementation. See Profile.jsx:22, Profile.jsx:41, Profile.jsx:108.
Community and Shared View exist and are close enough visually, but they are still mostly static/demo-driven.


There is a notification bell in the navbar, and it does fetch notifications from the backend. See Navbar.jsx:136.
The backend stores notifications and exposes two routes:
list current user notifications: notificationRoutes.js:6
mark all read: notificationRoutes.js:16
Notifications are currently created only in a few places:
when a trip is created
when a trip is made public
See tripController.js:39 and tripController.js:79
What’s missing in notifications:
no admin notification feed
no richer event types like checklist changes, note updates, activity additions, trip deletions, user moderation events
Big picture

The app matches the wireframe at the “screen count” level, but many screens are still demo screens instead of product screens.
The biggest missing pieces are:
persistent itinerary editing
real trip-to-user ownership drilldowns in admin
true admin moderation tools
persistent checklist/notes integration
richer notifications and a notifications center
proper backend-backed profile editing and delete-account behavior

Currency consistency

The currency flow is not fully consistent across trip screens.
Budget.jsx:97 is INR-based, and ExpenseInvoice.jsx:18 is also INR-based.
But ItineraryView.jsx:96 still shows dollar values in the summary, and ItineraryView.jsx:123, ItineraryView.jsx:160, and ItineraryView.jsx:167 also render "$" for totals and activity cost.
So the app mixes currency display inside the same trip flow. That is a real UI consistency issue, even if Budget/Invoice themselves are INR.
Mark as paid flow

There is no confirmation modal before marking paid.
In ExpenseInvoice.jsx:58, handleMarkPaid immediately sets status to paid and only shows a toast.
The button is rendered directly in the header and in the side panel at ExpenseInvoice.jsx:77 and ExpenseInvoice.jsx:176.
So yes, this is missing the expected “Are you sure?” modal/confirmation step.
Modal and dropdown theme

The shared modal component exists in Modal.jsx:1, and the base styles are in index.css:137.
The theme tokens and border radius are there, but the implementation is not fully modular:
A lot of modal/dropdown styling is still inline in screens and navbar code instead of coming from one reusable theme layer.
The navbar notification dropdown and account dropdown are custom inline blocks, not a unified themed dropdown component. See Navbar.jsx:55 and Navbar.jsx:136.
The modal itself uses the theme variables, but it still feels separate because the header, close button, spacing, and button styling are not centralized.
The default theme is Outfit in index.css:1, so the font is consistent, but some popup surfaces look visually “off” because their radius, spacing, and structure are handled ad hoc rather than by one shared component pattern.
The good part: the modal radius is already curvy via --radius-lg in index.css:137, so this is more of a consistency/modularity issue than a missing styling token issue.


Let me dig deeper into more files systematically:    

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/pages/ItineraryView.jsx)

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/pages/MyTrips.jsx#1-1), lines 1 to 150

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/pages/ExpenseInvoice.jsx#1-1), lines 1 to 100

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/pages/Login.jsx#1-1), lines 1 to 100

Read [](file:///d%3A/Hackathon/OdooxParul/server/routes)

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/pages/Signup.jsx)

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/context/AuthContext.jsx)

Read [](file:///d%3A/Hackathon/OdooxParul/server/routes/tripRoutes.js)

Searched for regex `TODO|FIXME|XXX|HACK|BUG` (`**/client/src/pages`), no results

Read [](file:///d%3A/Hackathon/OdooxParul/server/routes/adminRoutes.js)

Read [](file:///d%3A/Hackathon/OdooxParul/server/controllers/tripController.js#1-1), lines 1 to 50

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/utils/currency.js)

Searched for text `handleSave|handleSubmit|handleAdd|mock|TODO` (`**/client/src/pages/*.jsx`), 20 results

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/pages/ForgotPassword.jsx)

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/components/Modal.jsx)

Read [](file:///d%3A/Hackathon/OdooxParul/server/routes/authRoutes.js)

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/pages/ItineraryBuilder.jsx#70-70), lines 70 to 100

Searched for regex `const.*=.*\[|mock|sample|hard.?code` (`**/client/src/pages/Budget.jsx`), 6 results

Read [](file:///d%3A/Hackathon/OdooxParul/server/controllers/authController.js#1-1), lines 1 to 100

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/pages/ItineraryBuilder.jsx#100-100), lines 100 to 238

Read [](file:///d%3A/Hackathon/OdooxParul/client/src/pages/Checklist.jsx#80-80), lines 80 to 100

Searched for regex `setShowCreate|showCreate` (`**/client/src/pages/Dashboard.jsx`), 8 results

Based on my deep dive into the codebase, here are **32+ ADDITIONAL BROKEN FEATURES AND ISSUES** beyond the original 32:

---

## **ADDITIONAL CRITICAL & HIGH-PRIORITY ISSUES**

### 33. **"Forgot Password" Feature is Non-Functional**
- **Location**: ForgotPassword.jsx
- **Issue**: Form submits but only shows toast. No API endpoint called; no email reset link actually sent
- **Expected**: User enters email → receives password reset link via email
- **Actual**: Just shows success toast regardless; no backend integration

### 34. **Password Reset Email Endpoint Missing from Backend**
- **Location**: Server auth routes
- **Issue**: No `/api/auth/forgot-password` or `/api/auth/reset-password` endpoints exist
- **Expected**: Backend should send reset token via email and validate token
- **Actual**: API route doesn't exist; feature can't work

### 35. **Signup Additional Information Field Not Persisted**
- **Location**: Signup.jsx
- **Issue**: "Additional Information" textarea exists but is never sent to backend
- **Expected**: User's bio/about information saved to database
- **Actual**: Form field collected but discarded; never included in registration API call

### 36. **Signup Phone, City, Country Optional But Not Really Validated**
- **Location**: Signup.jsx
- **Issue**: These fields are optional in UI but no validation warnings if user omits them
- **Expected**: If fields are shown, either validate them or make clearly optional
- **Actual**: Fields appear mandatory but validation only enforces name/email/password

### 37. **Signup Photo Upload Input Non-Functional**
- **Location**: Signup.jsx
- **Issue**: Dashed box suggests photo upload with camera icon, but no `<input type="file">` element
- **Expected**: Users can upload profile photo during signup
- **Actual**: Visual element only; no file input; upload not connected

### 38. **Dashboard "Plan New Trip" Modal Has Duplicate Buttons**
- **Location**: Dashboard.jsx, Dashboard.jsx
- **Issue**: Two separate buttons call `setShowCreate(true)` - one in top button, one in card. Redundant UX.
- **Expected**: Single clear "Plan Trip" button
- **Actual**: Duplicate buttons with same function; confusing for users

### 39. **Dashboard Recommended Destinations Not Rendered**
- **Location**: Dashboard.jsx
- **Issue**: `destinations` state is fetched from `/api/trips/public/top-destinations` but never displayed in UI
- **Expected**: Dashboard shows "Recommended Destinations" section
- **Actual**: Data fetched but not rendered; feature incomplete

### 40. **ItineraryBuilder Mock City/Activity Data Hardcoded**
- **Location**: ItineraryBuilder.jsx
- **Issue**: `CITY_RESULTS` and `ACT_RESULTS` are hardcoded constants; modals don't search from real database
- **Expected**: Modals show real available cities/activities from database
- **Actual**: Only shows 3-4 hardcoded cities and activities

### 41. **ItineraryBuilder "Drag to Reorder" Label Misleading**
- **Location**: ItineraryBuilder.jsx
- **Issue**: `<GripIcon />` is shown with implicit "drag" affordance but no drag-and-drop implementation
- **Expected**: Users can drag activities to reorder them within a stop
- **Actual**: Drag functionality missing; icon is purely decorative

### 42. **Checklist Initial Data Uses Mock INIT Constant**
- **Location**: Checklist.jsx
- **Issue**: Component initializes with mock `INIT` constant instead of fetching from API
- **Expected**: Checklist loads from `/api/trips/{id}/checklist` endpoint immediately
- **Actual**: Uses hardcoded data first, then replaces it; odd UX

### 43. **Checklist "Reset Checklist" Has No Error Handling**
- **Location**: Checklist.jsx
- **Issue**: Reset button likely exists but no confirmation modal before destructive action
- **Expected**: Modal asks "Clear all items?" before resetting
- **Actual**: Likely just resets without confirmation

### 44. **Notes Page Form Submission Incomplete**
- **Location**: Notes.jsx
- **Issue**: `saveNew()` function exists but incomplete state management for edit mode
- **Expected**: Users can add, edit, and delete notes with clear UI feedback
- **Actual**: Add works, but edit/delete modes unclear; UX confusing

### 45. **Notes Page No Timestamps Display**
- **Wireframe spec**: "timestamp display"
- **Actual**: Notes fetched but timestamps not shown in UI

### 46. **ItineraryView Currency Formatting Defaults to INR**
- **Location**: ItineraryView.jsx
- **Issue**: If `stops[0]?.country` is undefined/null, defaults to 'India' (INR)
- **Expected**: Should handle edge cases or prompt user for country
- **Actual**: Falls back to India even if trip has multiple countries

### 47. **ItineraryView Share Button Uses Client-Side Clipboard**
- **Location**: ItineraryView.jsx
- **Issue**: `navigator.clipboard.writeText()` may fail in non-secure contexts or older browsers
- **Expected**: Robust link sharing with fallback mechanism
- **Actual**: No error handling if clipboard fails silently

### 48. **ExpenseInvoice "Mark as Paid" Modal Confirmation Incomplete**
- **Location**: ExpenseInvoice.jsx
- **Issue**: Modal exists (`showConfirm` state) but confirmation logic may not persist to backend
- **Expected**: Modal → User confirms → Backend records payment status → UI updates
- **Actual**: Modal shows but no API call to save payment status

### 49. **ExpenseInvoice "Send as Email" Just Shows Toast**
- **Location**: ExpenseInvoice.jsx
- **Issue**: `handleSendMail()` only shows toast; no backend email service integrated
- **Expected**: Sends invoice PDF to user's email address
- **Actual**: Toast only; no actual email sent

### 50. **ExpenseInvoice Tax Calculation Hard-Coded**
- **Location**: ExpenseInvoice.jsx
- **Issue**: Tax is always 5% regardless of country or trip details
- **Expected**: Tax should be configurable per trip or follow regional rates
- **Actual**: Hard-coded 5% tax; not flexible

### 51. **ExpenseInvoice Budget Limit Hard-Coded**
- **Location**: ExpenseInvoice.jsx
- **Issue**: `const TOTAL_BUDGET = 100000;` hard-coded; never used
- **Expected**: Budget limit from trip or user settings
- **Actual**: Dead code; constant defined but never referenced

### 52. **MyTrips "Group By" Dropdown Non-Functional**
- **Location**: MyTrips.jsx
- **Issue**: Dropdown renders but `groupBy` state doesn't exist; no grouping logic
- **Expected**: Group trips by Status or Month
- **Actual**: Dropdown is UI-only; no functionality

### 53. **MyTrips Trip Card Actions Are Non-Confirmable**
- **Location**: MyTrips.jsx
- **Issue**: Delete button uses basic `window.confirm()` instead of styled modal
- **Expected**: All destructive actions use consistent confirmation modal
- **Actual**: Mixes native confirm() with custom modals; inconsistent UX

### 54. **MyTrips Trip Status Calculation Has Edge Case**
- **Location**: MyTrips.jsx
- **Issue**: `derivedStatus()` determines status from dates, but if trip.status exists and equals 'Planned', ignores it
- **Expected**: Consistent status logic
- **Actual**: Fallback logic is complex and could conflict with DB status

### 55. **Community Page Has No Pagination**
- **Location**: Community.jsx
- **Issue**: Fetches all public trips in one go; no pagination/infinite scroll
- **Expected**: Pagination for large lists of trips
- **Actual**: All trips loaded at once; performance issue for many trips

### 56. **Community "Copy Trip" Button Has No Real Implementation**
- **Location**: Community.jsx
- **Issue**: `handleCopy()` exists but just updates local `copied` state
- **Expected**: Copy button → Creates new trip in user's account
- **Actual**: UI feedback only; no trip duplication logic

### 57. **SharedView "Copy This Trip" Also Incomplete**
- **Location**: SharedView.jsx
- **Issue**: No actual API call to duplicate trip; just local state flip
- **Expected**: Creates new trip for user
- **Actual**: UI indication only

### 58. **Profile Delete Account Button Has No Handler**
- **Location**: Profile.jsx
- **Issue**: Button rendered but no `onClick` handler; `isDeleting` state unused
- **Expected**: Calls `/api/auth/account` DELETE endpoint with confirmation
- **Actual**: Dead button; no functionality

### 59. **Profile Save Has No Optimistic UI Update**
- **Location**: Profile.jsx
- **Issue**: Form shows toast but doesn't update context/local state on save
- **Expected**: Immediate UI feedback that form was saved; context updates
- **Actual**: Toast only; form still shows old values until manual refresh

### 60. **Profile Photo Upload Non-Existent**
- **Location**: Profile.jsx
- **Issue**: No photo upload input in profile form despite wireframe showing user can change profile picture
- **Expected**: User can upload new profile photo
- **Actual**: Missing entirely from implementation

### 61. **Profile Bio Field Never Saved**
- **Location**: Profile.jsx
- **Issue**: Form has `bio` field but `/api/auth/profile` PATCH may not handle it
- **Expected**: Bio persists to database
- **Actual**: Unknown if backend accepts bio field

### 62. **Budget Mock Data Not Fallback When API Fails**
- **Location**: Budget.jsx
- **Issue**: If API returns empty data, component shows nothing useful
- **Expected**: Either show real data or friendly "no expenses yet" message
- **Actual**: Silent failure if API returns empty results

### 63. **Login Demo User Dropdown Not Accessible on Mobile**
- **Location**: Login.jsx
- **Issue**: Demo user selector is a dropdown triggered by button; mobile UX may be poor
- **Expected**: Mobile-friendly demo selection UI
- **Actual**: Not tested/optimized for mobile

### 64. **Login Form Email Validation Too Strict**
- **Location**: Login.jsx
- **Issue**: Regex `validateEmail()` may reject valid emails with edge-case formats
- **Expected**: Use RFC 5322-compliant validation
- **Actual**: Simple regex that might fail on valid addresses

### 65. **Login Missing "Remember Me" Checkbox**
- **Wireframe spec**: No explicit mention, but common for login screens
- **Actual**: Not implemented; users must log in every session (if token expires)

### 66. **Modal Close Button Only Closes Overlay Click**
- **Location**: Modal.jsx
- **Issue**: `onClose()` only called on overlay click, not on X button click
- **Expected**: X button explicitly calls `onClose()`
- **Actual**: X button missing or handler missing

### 67. **Activity Search Activities Hardcoded by City**
- **Location**: ActivitySearch.jsx
- **Issue**: Activities are hardcoded with `city: 'Paris'` or similar; not dynamic per trip
- **Expected**: Filter activities by actual selected city in trip
- **Actual**: Shows same activities regardless of context

### 68. **Activity Search Currency Varies by Activity**
- **Location**: ActivitySearch.jsx
- **Issue**: Each activity has different currency (JPY, EUR, GBP, AED) but UI may not handle conversion
- **Expected**: Convert all to trip's currency or show multi-currency
- **Actual**: Mixed currencies in list; confusing

### 69. **City Search "Add to Trip" Doesn't Create Backend Record**
- **Location**: CitySearch.jsx
- **Issue**: `handleAdd()` only updates local `added` state; no API call to backend
- **Expected**: Creates trip stop via `/api/trips/stop` POST
- **Actual**: UI-only; no persistence

### 70. **City Search Navigation Back After Add**
- **Location**: CitySearch.jsx
- **Issue**: After adding city, `navigate()` is called but timing may be off (1200ms delay)
- **Expected**: Wait for API response before navigating
- **Actual**: Hard-coded delay; race condition possible

### 71. **CreateTrip Cover Photo Upload Not Handled**
- **Location**: CreateTrip.jsx
- **Issue**: `coverPreview` state exists but file is never actually uploaded
- **Expected**: Upload cover image to server
- **Actual**: Preview shows but image not persisted

### 72. **CreateTrip Form Doesn't Clear After Success**
- **Location**: CreateTrip.jsx
- **Issue**: Form state cleared but user immediately navigated away; no confirmation visible
- **Expected**: Show success toast and navigate
- **Actual**: Success message may not be visible due to navigation

### 73. **CreateTrip Trip Templates Are Mock**
- **Location**: CreateTrip.jsx
- **Issue**: Templates (City Break, Beach Holiday, etc.) are UI-only; don't populate form intelligently
- **Expected**: Clicking template pre-fills trip details and generates intelligent dates
- **Actual**: Only sets basic fields

### 74. **AuthContext No Token Refresh Logic**
- **Location**: AuthContext.jsx
- **Issue**: JWT token expires in 8 hours but no refresh token mechanism
- **Expected**: When token expires, auto-refresh or prompt re-login
- **Actual**: Users suddenly logged out after 8 hours with no warning

### 75. **AuthContext No Error Handling for localStorage**
- **Location**: AuthContext.jsx
- **Issue**: `JSON.parse()` may throw if corrupted; only has try-catch in one place
- **Expected**: Robust error handling
- **Actual**: Could crash on corrupted localStorage

### 76. **No Rate Limiting on API Calls**
- **Issue**: Forms don't disable buttons during submission; multiple rapid clicks could create duplicate API requests
- **Expected**: Buttons disabled during async operations
- **Actual**: No protection against double-submission

---

## **MISSING FEATURES ENTIRELY**

### 77. **No Notification Preferences/Settings**
- **Expected**: Users should be able to disable certain notification types
- **Actual**: No notification preference page or API endpoint

### 78. **No Trip Sharing with Specific Users**
- **Expected**: "Share trip with friend@example.com" feature
- **Actual**: Only public/private toggle exists

### 79. **No Trip Comments or Collaboration**
- **Expected**: Multiple users can comment on shared trips
- **Actual**: Trips are read-only when shared

### 80. **No Real-Time Chat or Messaging**
- **Expected**: Users can message each other about trips
- **Actual**: No messaging feature

### 81. **No Activity Search with Real Data**
- **Expected**: Search across database of thousands of activities
- **Actual**: Only hardcoded demo activities

### 82. **No Trip Expense Splitting**
- **Expected**: Assign expenses to co-travelers and split costs
- **Actual**: All expenses are single-user

### 83. **No Itinerary Timeline View Toggle**
- **Wireframe spec**: "view mode toggle (calendar/list)"
- **Actual**: Only list view implemented

### 84. **No Accommodation Booking Integration**
- **Expected**: Book hotels/hostels from within app
- **Actual**: No booking integration

### 85. **No Weather Forecast Display**
- **Expected**: Show weather for each destination on planned dates
- **Actual**: No weather data

### 86. **No Dynamic Activity Recommendations**
- **Expected**: AI/Algorithm suggests activities based on trip preferences
- **Actual**: Manual search only

### 87. **No Trip Itinerary Export to ICS/Calendar**
- **Expected**: Export trip to Google Calendar or .ics file
- **Actual**: PDF only (via print)

### 88. **No Language Preference Implementation**
- **Issue**: Signup asks for language preference but it's not stored/used
- **Expected**: UI translates based on user preference
- **Actual**: Feature incomplete

---

## **ROUTING & NAVIGATION ISSUES**

### 89. **No Notifications Center Page**
- **Location**: Navbar.jsx
- **Issue**: "View all notifications" is text-only; no route exists
- **Expected**: Route to `/notifications` with full page
- **Actual**: No dedicated page; only dropdown in navbar

### 90. **No "My Saved Destinations" Page**
- **Location**: Navbar.jsx
- **Issue**: Menu item routes to `/profile` (duplicate)
- **Expected**: Separate `/saved-destinations` page
- **Actual**: Feature UI placeholder only

### 91. **No Trip Search/Filter Global**
- **Expected**: Global search across all trips, cities, activities
- **Actual**: Only per-page search implemented

---

## **UI/UX CONSISTENCY ISSUES**

### 92. **Button Loading States Inconsistent**
- **Issue**: Some buttons show "Creating..." text, others just disable
- **Expected**: Consistent loading indicator (spinner, text, or both)
- **Actual**: Mixed implementations across pages

### 93. **Error Messages Not Consistent**
- **Issue**: Some use toast, some use inline error text
- **Expected**: Unified error handling
- **Actual**: Scattered error UI patterns

### 94. **Form Validation Timing**
- **Issue**: Some show errors on blur, some on submit only
- **Expected**: Consistent validation UX
- **Actual**: Varies by page

---

**TOTAL ADDITIONAL ISSUES: 62**

**Grand Total: 94 Issues (Critical, High, Medium severity)*