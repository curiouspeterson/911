# Project Specification: DispatchScheduler Pro

_Last Updated: December 2024_  
_Document Version: 1.0_

## Executive Summary

DispatchScheduler Pro is a comprehensive 24/7 scheduling management application designed specifically for 911 dispatch centers. The system must ensure continuous coverage while managing complex staffing requirements, employee shift patterns, and time-off requests.

## Core Requirements

### 1. Staffing Requirements (Time-Based)

The system must maintain minimum staffing levels across four distinct time periods:

| Time Period | Hours             | Minimum Staff | Supervisor Required |
| ----------- | ----------------- | ------------- | ------------------- |
| Morning     | 5:00 AM – 9:00 AM | 6 employees   | 1 supervisor        |
| Daytime     | 9:00 AM – 9:00 PM | 8 employees   | 1 supervisor        |
| Evening     | 9:00 PM – 1:00 AM | 7 employees   | 1 supervisor        |
| Night       | 1:00 AM – 5:00 AM | 6 employees   | 1 supervisor        |

**Critical Note:** Staffing requirements are based on TIME PERIODS, not individual shifts. Multiple shifts may contribute to meeting a single time period's requirements.

### 2. Employee Shift Patterns

All employees must follow one of two patterns:

#### Pattern A: Four Consecutive 10-Hour Shifts

- Exactly 4 shifts per work cycle
- Each shift is 10 hours
- All shifts must be consecutive days
- Total: 40 hours per cycle

#### Pattern B: Three 12-Hour + One 4-Hour Shifts

- Exactly 3 shifts of 12 hours each
- Exactly 1 shift of 4 hours
- All shifts must be consecutive days
- The 4-hour shift should be temporally closest to the 12-hour shifts
- Total: 40 hours per cycle

### 3. Available Shift Types

The system offers shifts across four categories:

#### Early Shift Options

- **4-hour:** 5:00 AM – 9:00 AM
- **10-hour:** 5:00 AM – 3:00 PM
- **12-hour:** 5:00 AM – 5:00 PM

#### Day Shift Options

- **4-hour:** 9:00 AM – 1:00 PM
- **10-hour:** 9:00 AM – 7:00 PM
- **12-hour:** 9:00 AM – 9:00 PM

#### Swing Shift Options

- **4-hour:** 1:00 PM – 5:00 PM
- **10-hour:** 3:00 PM – 1:00 AM
- **12-hour:** 3:00 PM – 3:00 AM

#### Graveyard Shift Options

- **4-hour:** 1:00 AM – 5:00 AM
- **10-hour:** 7:00 PM – 5:00 AM
- **12-hour:** 5:00 PM – 5:00 AM

### 4. Scheduling Constraints

#### Time Constraints

- **Weekly Hour Limit:** 40 hours maximum without managerial approval
- **Schedule Duration:** 4-month blocks with consistent weekly patterns
- **Shift Consistency:** Employees work the same shift type on scheduled days

#### Time-Off Integration

- **Approved Requests:** Must be honored (hard constraint)
- **Pending Requests:** Accommodate when possible, override if necessary for staffing
- **Request Types:** Vacation, sick leave, personal time, training, etc.

#### Pattern Adherence

- Employees must work consecutive days according to their assigned pattern
- Shift types should remain consistent within a work cycle
- Pattern assignments can be changed but require administrative approval

### 5. Scheduling Priorities (In Order)

1. **Critical Staffing:** Ensure minimum staffing levels for each time period
2. **Supervisor Coverage:** Guarantee at least one supervisor per time period
3. **Approved Time-Off:** Honor all approved time-off requests
4. **Pattern Adherence:** Schedule according to assigned employee patterns
5. **Employee Preferences:** Consider default shift types and preferences
6. **Fairness:** Distribute shifts and overtime equitably
7. **Pending Time-Off:** Accommodate pending requests when possible
8. **Optimization:** Minimize overtime and maximize schedule efficiency

### 6. Complex Scheduling Scenarios

#### Midnight-Spanning Shifts

- Some shifts cross midnight (e.g., 7:00 PM – 5:00 AM)
- These shifts contribute to staffing requirements for multiple days
- System must properly allocate coverage across date boundaries

#### Schedule Block Transitions

- 4-month blocks may have shifts spanning the transition
- System must handle continuity between schedule periods
- Employee patterns must be maintained across transitions

#### Overtime Management

- Overtime requires managerial approval
- System should minimize overtime while meeting staffing requirements
- Emergency overtime may be necessary for critical coverage gaps

## Data Requirements

### Employee Data

- Personal information (name, contact, employee ID)
- Position and supervisor status
- Assigned shift pattern (A or B)
- Default shift type preferences
- Hire date and employment status

### Schedule Data

- 4-month schedule blocks with defined start/end dates
- Individual shift assignments per employee per day
- Overtime approval tracking
- Schedule publication and revision history

### Time-Off Data

- Request submission and approval workflow
- Request types and duration tracking
- Conflict resolution and override capabilities
- Integration with schedule generation

### Staffing Configuration

- Time period definitions and requirements
- Minimum staffing levels and supervisor requirements
- Shift type definitions and availability
- Business rules and constraint configuration

## Success Criteria

### Primary Objectives

- ✅ 100% compliance with minimum staffing requirements
- ✅ 100% supervisor coverage for all time periods
- ✅ 100% honor rate for approved time-off requests
- ✅ Zero scheduling conflicts or double-bookings

### Secondary Objectives

- ⭐ Maximize employee satisfaction through preference accommodation
- ⭐ Minimize overtime costs while maintaining coverage
- ⭐ Achieve equitable shift distribution across all employees
- ⭐ Maintain high schedule stability and predictability

### Performance Requirements

- Schedule generation: < 30 seconds for 4-month period
- Real-time conflict detection: < 1 second response
- Schedule updates: < 5 seconds for individual changes
- Mobile responsiveness: All features accessible on mobile devices

## Constraints and Limitations

### Hard Constraints (Cannot be violated)

- Minimum staffing levels must be met
- Supervisor presence required in each time period
- Approved time-off requests must be honored
- Weekly hour limits without approval
- Employee pattern adherence

### Soft Constraints (Preferred but can be overridden)

- Pending time-off accommodation
- Employee shift type preferences
- Equitable shift distribution
- Overtime minimization

### System Limitations

- Schedule complexity may require manual intervention for edge cases
- Extreme staffing shortages may necessitate emergency protocols
- System assumes accurate employee availability data
- Performance may degrade with very large employee counts (>500)

## Related Documents

- [Technical Architecture](TECHNICAL_ARCHITECTURE.md) - System design and technology choices
- [Database Design](DATABASE_DESIGN.md) - Data model and relationships
- [Business Logic](BUSINESS_LOGIC.md) - Detailed algorithms and rules
- [Development Roadmap](DEVELOPMENT_ROADMAP.md) - Implementation timeline
