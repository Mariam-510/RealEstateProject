🏠 PropPulse – Unified Real Estate Platform
Built with Angular 19, ASP.NET Core 8, and SQL Server, PropPulse combines:
- 🏘 Property Listings with chat & appointments
- 🔨 Property Auctions with real-time bidding & payments
- 🛋 Furniture E-Commerce with smart filtering, reviews & smooth checkout

Designed for buyers, sellers/agents, and admins, it streamlines property discovery, transactions, and furniture shopping — all in one seamless experience.

-------------------------------------------------------------------------------------------------------------------------------------------------------------
🏡 1. Property Listings

🔎 Discovery & Browsing
- Grid/List toggle views with advanced filters (price, category, beds, baths, etc.).
- Switch between image view and map view.
- Hovering over map pins highlights matching property cards.

📄 Property Details
- Full overview: description, price, beds/baths, seller/agent info, photo gallery.
- Interactive map with nearby amenities (schools, transport, hospitals).
- Appointment booking (virtual/in-person) within 15 days.
- Related property suggestions.

💬 Real-Time Chat
- SignalR chat with buyers and sellers/agents on property pages
- Unseen message count per conversation
- Approval required for first message; stays open after approval

-------------------------------------------------------------------------------------------------------------------------------------------------------------
🔨 2. Auction System

🔔 Real-Time Auction Discovery
- SignalR-driven real-time updates for countdowns, bid alerts, and auction status.
- Visual timeline and progress bar for auction stages
- Dynamic Summary: starting bid (pre-start), highest bid & count (live), or ended.

🔨 Auction Details
- Display property snapshots beside auction cards
- Live bid history: amount, bidder, timestamp, winner, countdown.

📝 Auction Participation
- 1% pre-bid fee via Stripe/PayPal (based on start price)
- Real-time bid validation & submission.

-------------------------------------------------------------------------------------------------------------------------------------------------------------
🛋️ 3. Furniture E-Commerce

🔎 Furniture Discovery
- Grid/List toggle with advanced filters & sorting.

📦 Furniture Details
- Real-time stock by color/variant
- Dynamic images zoom, Wishlist, shareable links, print page option, and buyer reviews.
- Smart product recommendations

💳 Checkout Workflow
- Address auto-detection via GPS/Map + manual entry with validation
- Multiple payment (Stripe, PayPal, COD), Dynamic shipping fees by delivery city.
- Order tracking + downloadable PDF receipts.

-------------------------------------------------------------------------------------------------------------------------------------------------------------
👤 4. User Roles & Permissions

👥 Buyer
- Manage profile, wishlist, and track orders, cancel upcoming appointments

🏘️ Seller / Agent
- Tiered plans (Free–Enterprise), list properties, upload contracts, create auctions

🛠️ Admin
- Approve agents after CR check and seller listings after contract review.
- Manage orders/accounts, control subscriptions.

-------------------------------------------------------------------------------------------------------------------------------------------------------------
📊 5. Dashboards

📈 Seller/Agent
- Revenue overview by category.
- Top properties and active listings.
- Bids, appointments, recent activity.

🛡️ Admin
- Global user, property, product, and order stats.
- Auction performance and bid tracking.
- Visual charts: sales, subscriptions, top products.

-------------------------------------------------------------------------------------------------------------------------------------------------------------
💻 6. Technologies Used

| Component       | Technology     |
| --------------- | -------------- |
| Frontend        | Angular 19     |
| Backend         | ASP.NET Core 8 |
| Database        | SQL Server     |
| Real-Time       | SignalR        |
| Payments        | Stripe, PayPal |
| Maps            | Leaflet        |
| Authentication  | JWT            |
| Version Control | GitHub         |
