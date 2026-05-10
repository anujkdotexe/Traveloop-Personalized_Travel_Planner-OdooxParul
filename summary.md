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