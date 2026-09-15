# Dataset Description

All datasets provided in this project are **synthetic demonstration data** crafted to reflect realistic terminal operational dynamics.

### 1. `vessels.csv`
Contains 22 inbound and scheduled cargo vessels.
- **`vessel_id`**: Unique vessel identifier (e.g., `V001`).
- **`vessel_name`**: Commercial carrier ship name.
- **`arrival_time`**: Expected arrival timestamp (ISO 8601).
- **`departure_deadline`**: Target turnaround departure deadline.
- **`container_count`**: TEU volume to be handled (discharge + loading).
- **`origin` / `destination`**: Global voyage points.
- **`current_port` / `current_terminal`**: Target arrival harbor and terminal id (e.g., `T1`).
- **`priority`**: Operational urgency (`HIGH`, `MEDIUM`, `LOW`).
- **`vessel_size`**: Size class (`Feeder`, `Medium`, `Large`, `Ultra Large`).
- **`status`**: Current vessel lifecycle state (`Approaching`, `Queued`, `Scheduled`, `Berthed`).

---

### 2. `berths.csv`
Defines available quay infrastructure.
- **`berth_id`**: Quay identifier (e.g., `B01`).
- **`terminal_id` / `terminal_name`**: Terminal grouping.
- **`capacity`**: Maximum TEU supported.
- **`max_vessel_size`**: Physical draft and length restriction.
- **`crane_count`**: Number of rail-mounted gantry cranes installed.
- **`available_from`**: Availability timestamp.
- **`status`**: `AVAILABLE`, `OCCUPIED`, or `MAINTENANCE`.

---

### 3. `ports.csv`
Global port harbor master records including geographic coordinates and overall daily capacity.

---

### 4. `historical_congestion.csv`
Historical hourly records used to train and validate the machine learning congestion model.
- **`timestamp`**: Time of recorded snapshot.
- **`terminal_id`**: Target terminal.
- **`vessel_count`**: Vessels present at terminal.
- **`container_count`**: Active container inventory.
- **`available_berths`**: Free berths at time of measurement.
- **`available_cranes`**: Operational cranes.
- **`average_wait_hours`**: Observed waiting time in hours.
- **`congestion_level`**: Target classification label (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
