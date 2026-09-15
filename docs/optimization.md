# Optimization & 72-Hour Operational Planner

## Objectives
1. Eliminate berth collision conflicts (ensure single vessel occupancy per berth window).
2. Minimize waiting time for high-priority vessels.
3. Maximize crane productivity and container throughput.
4. Provide a realistic 72-hour operational horizon for shift supervisors.

## Algorithmic Formulation

### 1. Alternate Route Scoring Heuristic
$$\text{Route Score} = 0.40 \cdot C + 0.30 \cdot W + 0.20 \cdot D + 0.10 \cdot K$$
Where:
- $C$: Congestion penalty (0.0 to 1.0)
- $W$: Estimated wait penalty
- $D$: Distance / deviation penalty
- $K$: Terminal capacity pressure

### 2. Greedy Berth & Crane Scheduling
- Sort vessels by `(Priority Weight, Arrival Time)`.
- For each vessel, filter eligible berths by physical draft size constraint (`Feeder` $\le$ `Medium` $\le$ `Large` $\le$ `Ultra Large`).
- Allocate 2 to 4 quay cranes proportional to cargo volume ($>1800$ TEU $\rightarrow$ 4 cranes).
- Calculate estimated service duration:
  $$\text{Duration (hours)} = \max\left(2.5, \frac{\text{Container Count}}{\text{Cranes} \times 35 \text{ TEU/hour}}\right)$$
- Advance berth timeline by duration $+ 30$ min safety buffer.
