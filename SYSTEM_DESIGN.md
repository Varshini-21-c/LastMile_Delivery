# Last-Mile Delivery Tracker - System Design Document

## 1. Overview & Architecture
The Last-Mile Delivery Tracker is an enterprise-grade logistics and dispatch platform engineered with **Spring Boot (Java 21)** on the backend and **React (Vite)** on the frontend. The system manages order lifecycles, automated pricing rules, intelligent agent assignment, and multi-channel notifications.

```
+-------------------------------------------------------------------------------+
|                                React Frontend                                 |
|   Customer Portal   |   Agent Workspace   |   Admin Console   | Live Tracking |
+---------------------------------------+---------------------------------------+
                                        | REST APIs (JWT Auth)
+---------------------------------------v---------------------------------------+
|                            Spring Boot 3.3 Backend                            |
|  +--------------------+  +----------------------+  +-----------------------+  |
|  | Rate Calculation   |  | Intelligent Agent    |  | Order Lifecycle &     |  |
|  | Engine             |  | Auto-Assignment      |  | Reschedule Engine     |  |
|  +--------------------+  +----------------------+  +-----------------------+  |
|  +--------------------+  +----------------------+  +-----------------------+  |
|  | Zone & Topology    |  | Multi-Channel        |  | Immutable Tracking    |  |
|  | Detection Registry |  | Notification Engine  |  | Audit History Log     |  |
|  +--------------------+  +----------------------+  +-----------------------+  |
|                                       |                                       |
|                                Spring Data JPA                                |
|                                       v                                       |
|                 Relational Database (H2 / PostgreSQL / MySQL)                 |
+-------------------------------------------------------------------------------+
```

---

## 2. Rate Calculation Engine
The rate engine evaluates shipments dynamically without hardcoded constants. Pricing is computed in 5 deterministic stages:

1. **Dimensional Displacement (Volumetric Weight)**:
   Logistics packages occupy spatial volume. Volumetric weight is computed using the standard cubic conversion:
   $$\text{Volumetric Weight (kg)} = \frac{\text{Length (cm)} \times \text{Breadth (cm)} \times \text{Height (cm)}}{5000}$$

2. **Chargeable Weight Determination**:
   $$\text{Chargeable Weight} = \max(\text{Actual Scale Weight}, \text{Volumetric Weight})$$

3. **Dynamic Rate Card Lookup**:
   The engine retrieves the active `RateCard` matching `(OrderType: B2B | B2C, RouteType: INTRA_ZONE | INTER_ZONE)`. Each rate card configures:
   - Base weight threshold ($W_{\text{base}}$, e.g., 0.5 kg for B2C, 5.0 kg for B2B)
   - Base fare ($R_{\text{base}}$)
   - Incremental rate per additional kilogram ($R_{\text{extra}}$)
   - Minimum floor charge ($M_{\text{floor}}$)

4. **Weight-Based Surcharge**:
   $$\text{Extra Weight} = \max(0, \text{Chargeable Weight} - W_{\text{base}})$$
   $$\text{Weight Surcharge} = \text{Extra Weight} \times R_{\text{extra}}$$

5. **COD & Final Total**:
   If payment is `COD`, a compound fee is added:
   $$\text{COD Fee} = \text{COD}_{\text{fixed}} + \left(\text{Declared Value} \times \frac{\text{COD}_{\text{percent}}}{100}\right)$$
   $$\text{Total Price} = \max\left(M_{\text{floor}}, R_{\text{base}} + \text{Weight Surcharge} + \text{COD Fee}\right)$$

---

## 3. Dynamic Zone Detection Approach
Zones are abstracted as geographical operational hubs (e.g., `NORTH_ZONE`, `SOUTH_ZONE`, `EAST_ZONE`, `WEST_ZONE`, `CENTRAL_ZONE`). 

- **Hierarchical Resolution**:
  1. **Pincode Lookup**: Exact match against the `AreaPincodeMapping` table.
  2. **Area Name Fallback**: Case-insensitive partial area match.
  3. **Default Fallback**: `CENTRAL_ZONE` fallback to guarantee quotation completion.
- **Route Classification**:
  - **Intra-Zone**: $\text{Zone}_{\text{pickup}} = \text{Zone}_{\text{drop}}$ (Lower local transit rates).
  - **Inter-Zone**: $\text{Zone}_{\text{pickup}} \neq \text{Zone}_{\text{drop}}$ (Cross-hub sorting rates applied).

---

## 4. Intelligent Agent Auto-Assignment Logic
The auto-assignment algorithm optimizes delivery latency, fuel consumption, and workload balance across available agents.

1. **Agent Eligibility Filter**:
   $$\text{Eligible Agents} = \{ a \in \text{Agents} \mid a.\text{isAvailable} = \text{true} \}$$

2. **Multi-Factor Cost Function**:
   For each eligible agent $a$, an assignment penalty score $S(a)$ is computed:
   $$S(a) = \text{ZoneMismatchPenalty}(a) + (d_{\text{haversine}}(a, \text{Pickup}) \times 2.0) + (N_{\text{active\_orders}}(a) \times 10.0)$$
   Where:
   - $\text{ZoneMismatchPenalty} = 0$ if $a.\text{Zone} = \text{Zone}_{\text{pickup}}$, else $+35.0$.
   - $d_{\text{haversine}}$ is the spherical great-circle distance in kilometers:
     $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
   - $N_{\text{active\_orders}}$ is the number of currently active in-flight orders for agent $a$.

3. **Optimal Selection**:
   $$a^* = \arg\min_{a \in \text{Eligible Agents}} S(a)$$
   If no online agent is found, the order remains in `CREATED` status with an alert for admin manual dispatch.

---

## 5. Failed Delivery Lifecycle & Reschedule Handling
Delivery failures are treated as first-class asynchronous workflows to protect customer trust and maintain SLA transparency:

```
[OUT_FOR_DELIVERY] 
       |
  (Attempt Fails)
       v
    [FAILED] ----------> Dispatches Email & SMS Alert to Customer
       |
 (Customer Selects New Date & Slot)
       v
  [RESCHEDULED]
       |
  (Intelligent Reassignment)
       v
   [ASSIGNED] ---------> Fresh Agent Re-dispatched on Rescheduled Date
```

1. **Failure Capture**: Agent selects a structured reason (*Customer Unavailable*, *Incorrect Address*, *Refused COD*, *Access Denied*) along with location coordinates and timestamp.
2. **Immutable Audit Trail**: An unalterable `OrderTrackingHistory` record is written to the audit log.
3. **Customer Notification**: Automated Email and SMS notifications deliver an immediate 1-click rescheduling link.
4. **Reschedule & Reassignment**: Customer chooses a new calendar date and time slot (*Morning*, *Afternoon*, *Evening*). The order increments `rescheduleCount`, and the `AutoAssignmentService` immediately re-evaluates the optimal agent for the new fulfillment window.
