# 🚚 SwiftMile - Last-Mile Delivery Tracker

A modern, full-stack **Last-Mile Delivery Management & Intelligent Tracking Platform** built with **Spring Boot 3 (Java 21)** and **React (Vite)**.

SwiftMile automates delivery operations through a dynamic rate calculation engine (volumetric vs actual weight, intra/inter-zone rate cards, COD surcharges), intelligent heuristic delivery agent assignment, an immutable journey tracking timeline, an automated failed delivery rescheduling workflow, and simulated multi-channel customer notifications.

---

## 🌟 Key Features

1. **Intelligent Rate Calculation Engine**:
   - **Volumetric Weight Calculation**: `(L × B × H) ÷ 5000` (in kg).
   - **Chargeable Weight**: Evaluates $\max(\text{Actual Weight}, \text{Volumetric Weight})$ with transparent customer breakdown.
   - **Dynamic Rate Cards Matrix**: Admin-configurable rate cards for B2B & B2C Intra-Zone and Inter-Zone routes.
   - **COD Surcharge Engine**: Compound fixed and percentage handling fees calculated dynamically.
   - **Zero Hardcoding**: All zones, rate cards, and thresholds are fully configurable in the Admin Console.

2. **Smart Agent Auto-Assignment**:
   - Multi-factor heuristic dispatching based on agent online availability, zone affinity, spherical Haversine GPS distance, and active workload queue balancing.
   - Admin manual assignment and instant 1-click auto-dispatch triggers.

3. **Immutable Lifecycle Journey History**:
   - Every status transition (`CREATED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED` / `FAILED` $\rightarrow$ `RESCHEDULED`) is permanently recorded with actor name, role, timestamp, and location coordinates.

4. **Failed Delivery & Reschedule Flow**:
   - On delivery failure, agent logs the specific reason (*Customer unavailable, wrong address, refused COD*).
   - Customer immediately receives an alert with a 1-click reschedule portal to pick a new date and time slot (*Morning, Afternoon, Evening*).
   - Rescheduled shipments are automatically re-evaluated and reassigned to a fresh delivery agent.

5. **Multi-Role Portals**:
   - **Public Tracking View**: Instant tracking by tracking number (`TRK-...`) with step progress bar and milestone log.
   - **Customer Portal**: Interactive booking wizard with live quote preview, 3D box dimension calculator, and shipment history.
   - **Agent Workspace**: Online/Offline toggle, simulated GPS location switcher, active task queue, and status action buttons.
   - **Admin Console**: Live operational KPIs, orders grid with search/filtering, rate card matrix editor, zone & pincode registry, and notification audit logs.

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------------------------+
|                                React Frontend                                 |
|  +-------------------+  +-------------------+  +----------------------------+ |
|  | Customer Portal   |  | Agent Workspace   |  | Admin Command Center       | |
|  | - Order Wizard    |  | - Active Tasks    |  | - Live Metrics & Analytics | |
|  | - Quote Preview   |  | - 1-Click Status  |  | - Orders Master & Override | |
|  | - Live Timeline   |  | - GPS Simulation  |  | - Zone & Pincode Registry  | |
|  | - Reschedule Flow |  | - Fail with Reason|  | - Rate Card Matrix (B2B/C) | |
|  +-------------------+  +-------------------+  +----------------------------+ |
+---------------------------------------+---------------------------------------+
                                        | REST APIs (JWT Authentication)
+---------------------------------------v---------------------------------------+
|                            Spring Boot 3.3 Backend                            |
|  Controllers: Auth, Quotes, Orders, Agent, Admin, Tracking, Notifications    |
|  Services: RateEngine, AutoAssignment, OrderLifecycle, Reschedule, Notification|
|  Data: H2 In-Memory / PostgreSQL / MySQL with Spring Data JPA & Hibernate     |
+-------------------------------------------------------------------------------+
```

---

## 🗄️ Database Schema & Entities

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| `users` | Role-based user accounts | `id`, `name`, `email`, `password`, `phone`, `role` (`CUSTOMER`, `AGENT`, `ADMIN`), `zone_id`, `current_lat`, `current_lng`, `is_available` |
| `zones` | Geographical delivery zones | `id`, `code` (`NORTH_ZONE`, `SOUTH_ZONE`, etc.), `name`, `center_lat`, `center_lng`, `active` |
| `area_pincode_mappings` | Pincode to Zone mappings | `id`, `pincode`, `area_name`, `city`, `state`, `zone_id`, `active` |
| `rate_cards` | Admin-configurable pricing matrices | `id`, `order_type` (`B2B`, `B2C`), `is_intra_zone`, `base_weight_kg`, `base_rate`, `extra_rate_per_kg`, `cod_surcharge_fixed`, `cod_surcharge_percent`, `min_charge` |
| `delivery_orders` | Master shipment order records | `id`, `tracking_number`, `customer_id`, `pickup_address`, `pickup_pincode`, `pickup_zone_id`, `drop_address`, `drop_pincode`, `drop_zone_id`, `length_cm`, `breadth_cm`, `height_cm`, `actual_weight_kg`, `volumetric_weight_kg`, `chargeable_weight_kg`, `order_type`, `payment_type`, `total_amount`, `status`, `assigned_agent_id`, `rescheduled_date`, `rescheduled_slot` |
| `order_tracking_history` | Immutable journey audit records | `id`, `order_id`, `status`, `actor_name`, `actor_role`, `remarks`, `location_lat`, `location_lng`, `timestamp` |
| `notification_logs` | Customer email & SMS audit log | `id`, `order_id`, `tracking_number`, `recipient_email`, `recipient_phone`, `channel` (`EMAIL`, `SMS`), `event_type`, `subject`, `message`, `sent_at` |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Java 21** or higher
- **Node.js 18+** & **npm**
- Maven (or use the provided Maven wrapper/tools)

---

### 1. Running the Spring Boot Backend

```bash
# Navigate to backend directory
cd backend

# Build and run the Spring Boot application (using maven wrapper or system maven)
mvn spring-boot:run
```

- Backend server starts at: `http://localhost:8080`
- Embedded H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:deliverydb`, User: `sa`, Password: `password`)

---

### 2. Running the React Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

- Frontend application starts at: `http://localhost:5173`

---

## 🔑 Demo Accounts & Preloaded Credentials

The platform is preloaded with seed accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@delivery.com` | `admin123` | Full access to command center, rate cards, zones & override |
| **Delivery Agent 1** | `agent.rajesh@delivery.com` | `agent123` | South Metro Hub (Koramangala, HSR) |
| **Delivery Agent 2** | `agent.priya@delivery.com` | `agent123` | North Metro Hub (Hebbal, Yelahanka) |
| **Delivery Agent 3** | `agent.vikram@delivery.com` | `agent123` | East Tech Hub (Whitefield, Bellandur) |
| **Customer (B2C)** | `customer.rohit@gmail.com` | `customer123` | Retail customer placing express orders |
| **Customer (B2B)** | `anita@techcorp.com` | `customer123` | B2B Commercial corporate account |

> 💡 **Demo Switcher**: You can also use the **1-Click Demo Switcher** in the top navigation bar to seamlessly test all roles without re-logging in.

---

## 📡 REST API Documentation

### 1. Quotes & Pricing Engine
- `POST /api/quotes/calculate`
  - **Request**:
    ```json
    {
      "pickupPincode": "560034",
      "dropPincode": "560102",
      "lengthCm": 25.0,
      "breadthCm": 20.0,
      "heightCm": 10.0,
      "actualWeightKg": 1.5,
      "orderType": "B2C",
      "paymentType": "PREPAID"
    }
    ```
  - **Response**:
    ```json
    {
      "pickupZoneCode": "SOUTH_ZONE",
      "dropZoneCode": "SOUTH_ZONE",
      "rateZoneType": "INTRA_ZONE",
      "volumetricWeightKg": 1.0,
      "actualWeightKg": 1.5,
      "chargeableWeightKg": 1.5,
      "billedOnReason": "Actual Weight (1.50 kg >= 1.00 kg Volumetric)",
      "baseRate": 40.0,
      "extraWeightCharge": 20.0,
      "codSurcharge": 0.0,
      "totalAmount": 60.0
    }
    ```

### 2. Orders & Tracking
- `POST /api/orders` - Place a new order with auto-assignment
- `GET /api/orders` - Get orders for authenticated user
- `GET /api/tracking/{trackingNumber}` - Public tracking lookup with full immutable audit history
- `POST /api/orders/{id}/reschedule` - Reschedule a failed order with new date and time slot

### 3. Agent Operations
- `GET /api/agent/orders` - Get assigned delivery tasks
- `PATCH /api/agent/orders/{id}/status` - Advance order status (`PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`)
- `PATCH /api/agent/availability` - Toggle online/offline status
- `PATCH /api/agent/location` - Update GPS coordinates

### 4. Admin Management
- `GET /api/admin/stats` - Operational KPIs & SLA summary
- `GET /api/admin/orders` - Filter orders by status, zone, agent, or search query
- `POST /api/admin/orders/{id}/assign` - Manually assign agent or trigger auto-dispatch
- `PATCH /api/admin/orders/{id}/override-status` - Override order status
- `GET / POST / PUT / DELETE /api/admin/rate-cards` - Configure dynamic rate cards
- `GET / POST / PUT / DELETE /api/admin/zones` - Manage delivery zones

---

## 🧪 Automated Unit & Integration Testing

Run all backend unit tests for the Rate Calculation Engine, Volumetric Weight formula, and Auto-Assignment heuristics:

```bash
cd backend
mvn test
```

---

## 📄 Deliverables Summary

1. Complete source code for backend and frontend.
2. System design write-up (`SYSTEM_DESIGN.md`).
3. Complete README and API specification (`README.md`).
4. Deployment blueprints (`Dockerfile`, `docker-compose.yml`, `render.yaml`).
