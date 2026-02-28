# Access Control Research Report

## Executive Summary
### Top Recommendations
1. **DoorBird** 
   - **Rationale**: Offers comprehensive features including smart notifications, video capabilities, and a well-documented API. Suitable for enhancing member security and features.
   - **Key Features**: Video/audio calls, remote unlocking, cloud storage options.

2. **LiftMaster myQ**  
   - **Rationale**: Widely adopted with good integration capabilities for gate and garage operations. It has a solid API for builders focusing on residential or small-scale applications.
   - **Key Features**: Remote opening, event notifications.

3. **ControlByWeb** 
   - **Rationale**: Offers flexible integration with an open API, ideal for development projects needing custom automation solutions.
   - **Key Features**: Open API, cloud services.

---

## Per-system Breakdown
| System          | API Availability | Auth Method         | Key Capabilities                                         | Pricing Model              | Ease of Integration  |
|------------------|------------------|---------------------|---------------------------------------------------------|----------------------------|---------------------|
| **DoorBird**     | Yes              | Token-based          | Video call, remote unlock, cloud storage                | Per-device pricing         | 4                   |
| **LiftMaster**   | Yes              | OAuth2               | Remote access, event notifications                       | Monthly subscription       | 3                   |
| **ControlByWeb** | Yes              | Token-based          | Remote I/O control, data logging, email alerts          | One-time purchase / SaaS   | 4                   |
| **Linear/Nortek**| Yes              | Basic token auth     | Access control, integration with various protocols       | Task-based pricing         | 3                   |
| **Doorking**     | Yes              | API key              | Telephone entry, multiple product integrations           | Licensing per product      | 3                   |
| **ismarta**      | Yes              | Unknown (needs checking)| Smart controls, advanced security features               | Annual licensing           | 2                   |

---

## Recommended Integration Path
1. **Phase 1**: Start with integrating **DoorBird** for immediate security and member interaction capabilities.
2. **Phase 2**: Integrate **LiftMaster** for ease of access to gates/garages.
3. **Phase 3**: Explore **ControlByWeb** for automation enhancements that utilize data logging and remote notifications.

---

## Sample API Calls
### DoorBird Example
- **Get Device Status**:
  ```GET /v1/devices/status```  
- **Open Door**:
  ```POST /api/open```  
  - Payload: `{