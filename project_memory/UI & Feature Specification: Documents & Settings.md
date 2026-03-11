UI & Feature Specification: Documents & Settings
1. Documents Page (/documents)
The Documents page should serve as both the primary file management interface and the storage dashboard.

1.1 File Management Actions
The page must support full CRUD operations on files. Each file/folder row should have a context menu (or inline quick actions) that trigger the following backend endpoints:

Upload: Drag-and-drop zone or click-to-browse button.
Download: Download the original file locally.
Move / Organize: Move files between virtual folders.
Rename: Edit the filename inline or via a modal.
Delete: Remove individual files (requires a standard lightweight confirmation).
1.2 Storage Dashboard (New Feature)
At the top or side of the document list, there must be a visually clean Storage Dashboard component showing the current user's database footprint.

Visual Requirements:

Progress Bar: A slim, elegant progress bar indicating the exact amount of MB used vs the total available limit (e.g., 24 MB / 500 MB limit).
Format Breakdown: Numeric or tiny colored badges showing how many files of each type are stored and their collective payload (e.g., PDF: 12 docs (16 MB), MD: 5 docs (220 KB)).
1.3 Clear Knowledge Base (Danger Zone)
Placement: Typically in the right-top corner or distinctly below the storage dashboard, boxed as a "Danger Zone".
Visuals: A prominent red Danger Button labeled "Clear Knowledge Base".
Action Flow: Clicking this must trigger an aggressive confirmation modal confirming that this action will permanently delete ALL documents and chat history for this user.
2. Settings Page (/settings)
We have drastically simplified the scope of the Settings page. This page is now strictly dedicated to Account Management with a "less is more" minimalist philosophy.

2.1 Aesthetic & Layout
Layout Approach: Dead simple. A single, perfectly centered card container.
Design Language: Inherit the aesthetic from the mockup—white background, large pill-like border radii (rx="18" or rounded-2xl in Tailwind), and a very subtle drop shadow to provide depth without clutter.
2.2 Card Contents
The centered settings card requires only three distinct visual clusters stacked vertically:

Avatar Component:

A perfectly circular avatar bubble sitting at the top center.
It should use a blue-to-purple (#0071E3 to #5E5CE6) linear gradient background.
It should display the user's initials (e.g., "JD") derived from their name or email in bold white text centered inside the bubble.
User Details:

User Name rendered in a clean, high-contrast dark gray (text-gray-900 or #1D1D1F).
Email Address rendered in a softer, secondary text color immediately underneath the name.
Sign Out Action:

A single, minimalist Sign Out button pinned to the bottom of the card.
It should not look like a primary "Submit" button; a softer aesthetic (perhaps a subtle gray stroke button or very faint off-red padding) to communicate an exit action without commanding too much visual weight.