import React, { useContext, useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react-native";

export default function AttendanceScreen() {
  const { activeStudent } = useContext(AuthContext);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed 5)

  if (!activeStudent) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </SafeAreaView>
    );
  }

  const { logs, percentage, presentDays, absentDays, lateDays, leaveDays } =
    activeStudent.attendance;

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 for Sunday, 1 for Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    // Adjust Sunday from 0 to 7 to make Monday 1st day of the week
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Silicon Valley level optimization: Pre-index logs into a Map to achieve O(1) status lookup inside rendering loop
  const logsMap = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach((log) => {
      map.set(log.date, log.status);
    });
    return map;
  }, [logs]);

  // Helper to get status of a specific date in YYYY-MM-DD format
  const getDayStatus = useCallback((day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1)
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    return logsMap.get(dateStr) || null;
  }, [currentYear, currentMonth, logsMap]);

  // Calendar rendering helper
  const renderCalendarDays = () => {
    const dayElements = [];
    const totalSlots = 35; // 5 rows of 7 days (or 42 if needed)

    // Empty spaces for previous month overflow
    for (let i = 0; i < firstDayIndex; i++) {
      dayElements.push(<View key={`empty-${i}`} style={styles.calendarCellEmpty} />);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDayStatus(day);
      let dayStyle: any = styles.dayNormal;
      let textStyle: any = styles.dayTextNormal;

      if (status === "PRESENT") {
        dayStyle = styles.dayPresent;
        textStyle = styles.dayTextPresent;
      } else if (status === "ABSENT") {
        dayStyle = styles.dayAbsent;
        textStyle = styles.dayTextAbsent;
      } else if (status === "LATE") {
        dayStyle = styles.dayLate;
        textStyle = styles.dayTextLate;
      } else if (status === "LEAVE") {
        dayStyle = styles.dayLeave;
        textStyle = styles.dayTextLeave;
      }

      // Check if it's weekend
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      dayElements.push(
        <View key={`day-${day}`} style={styles.calendarCell}>
          <View style={[styles.dayCircle, dayStyle, isWeekend && !status && styles.dayWeekend]}>
            <Text style={[styles.dayText, textStyle, isWeekend && !status && styles.dayTextWeekend]}>
              {day}
            </Text>
          </View>
        </View>
      );
    }

    // Empty spaces for next month overflow
    const remainingSlots = totalSlots - dayElements.length;
    if (remainingSlots > 0) {
      for (let i = 0; i < remainingSlots; i++) {
        dayElements.push(<View key={`empty-end-${i}`} style={styles.calendarCellEmpty} />);
      }
    }

    return dayElements;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Attendance Summary Header */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryMainRow}>
            <View>
              <Text style={styles.summaryTitle}>Attendance Summary</Text>
              <Text style={styles.studentName}>
                {activeStudent.firstName}'s Class Attendance
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentVal}>{percentage}%</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={[styles.statusDot, { backgroundColor: "#15803D" }]} />
              <Text style={styles.statNumber}>{presentDays}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statusDot, { backgroundColor: "#DC2626" }]} />
              <Text style={styles.statNumber}>{absentDays}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statusDot, { backgroundColor: "#D97706" }]} />
              <Text style={styles.statNumber}>{lateDays}</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statusDot, { backgroundColor: "#2563EB" }]} />
              <Text style={styles.statNumber}>{leaveDays}</Text>
              <Text style={styles.statLabel}>Leave</Text>
            </View>
          </View>
        </View>

        {/* Custom Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <View style={styles.navButtons}>
              <TouchableOpacity
                onPress={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                style={styles.navBtn}
              >
                <ChevronLeft size={20} color="#0F766E" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
                style={styles.navBtn}
              >
                <ChevronRight size={20} color="#0F766E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekLabelsRow}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <Text key={day} style={styles.weekLabelText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>{renderCalendarDays()}</View>

          {/* Calendar Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }]} />
              <Text style={styles.legendLabel}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]} />
              <Text style={styles.legendLabel}>Absent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]} />
              <Text style={styles.legendLabel}>Late</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#EFF6FF", borderColor: "#93C5FD" }]} />
              <Text style={styles.legendLabel}>Leave</Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Info size={16} color="#0F766E" />
          <Text style={styles.infoText}>
            For attendance corrections, please contact the class teacher directly.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: "#0F766E15",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  percentVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F766E",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  navButtons: {
    flexDirection: "row",
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    marginLeft: 8,
  },
  weekLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  weekLabelText: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  calendarCell: {
    width: "14%", // ~1/7th of grid width
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  calendarCellEmpty: {
    width: "14%",
    aspectRatio: 1,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
  },
  dayNormal: {
    backgroundColor: "#F8FAFC",
  },
  dayTextNormal: {
    color: "#334155",
    fontWeight: "500",
  },
  dayWeekend: {
    backgroundColor: "#F1F5F9",
  },
  dayTextWeekend: {
    color: "#94A3B8",
    fontWeight: "500",
  },
  dayPresent: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  dayTextPresent: {
    color: "#166534",
    fontWeight: "700",
  },
  dayAbsent: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  dayTextAbsent: {
    color: "#991B1B",
    fontWeight: "700",
  },
  dayLate: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  dayTextLate: {
    color: "#92400E",
    fontWeight: "700",
  },
  dayLeave: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  dayTextLeave: {
    color: "#1E40AF",
    fontWeight: "700",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    paddingTop: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#0F766E08",
    borderWidth: 1,
    borderColor: "#0F766E20",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: "#0F766E",
    fontWeight: "500",
    lineHeight: 16,
  },
});
