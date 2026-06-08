import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import {
  GraduationCap,
  Calendar,
  CreditCard,
  Award,
  Bell,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react-native";

export default function DashboardScreen({ navigation }: any) {
  const { userData, activeStudent, setActiveStudent, children, notices, logout } = useContext(AuthContext);

  if (!activeStudent) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading student profiles...</Text>
      </SafeAreaView>
    );
  }

  // Calculate outstanding fees for active student
  const outstandingFees = activeStudent.invoices
    .filter((inv) => inv.status !== "PAID")
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  const totalPaidFees = activeStudent.invoices
    .filter((inv) => inv.status === "PAID" || inv.status === "PARTIALLY_PAID")
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  // Latest exam results
  const latestExam = activeStudent.exams.length > 0 ? activeStudent.exams[0] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Block */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <Text style={styles.parentName}>{userData?.name || "Parent"}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton} activeOpacity={0.7}>
            <LogOut size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Sibling Switcher Widget */}
        <View style={styles.siblingSection}>
          <Text style={styles.sectionTitle}>Select Child</Text>
          <View style={styles.siblingContainer}>
            {children.map((child) => {
              const isActive = child.id === activeStudent.id;
              const initials = `${child.firstName[0]}${child.lastName[0]}`;
              return (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.siblingTab,
                    isActive && styles.siblingTabActive,
                  ]}
                  onPress={() => setActiveStudent(child)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.avatar,
                      isActive ? styles.avatarActive : styles.avatarInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        isActive ? styles.avatarTextActive : styles.avatarTextInactive,
                      ]}
                    >
                      {initials}
                    </Text>
                  </View>
                  <View style={styles.siblingInfo}>
                    <Text
                      style={[
                        styles.siblingName,
                        isActive ? styles.siblingNameActive : styles.siblingNameInactive,
                      ]}
                    >
                      {child.firstName}
                    </Text>
                    <Text style={styles.siblingClass}>
                      {child.class}-{child.section}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Child Profile Details Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileLogoBg}>
              <User size={30} color="#0F766E" />
            </View>
            <View>
              <Text style={styles.profileName}>
                {activeStudent.firstName} {activeStudent.lastName}
              </Text>
              <Text style={styles.profileSub}>
                Roll No: {activeStudent.rollNo || "N/A"} • Class {activeStudent.class}-{activeStudent.section}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileGrid}>
            <View style={styles.profileGridItem}>
              <Text style={styles.gridLabel}>Admission No</Text>
              <Text style={styles.gridValue}>{activeStudent.admissionNo}</Text>
            </View>
            <View style={styles.profileGridItem}>
              <Text style={styles.gridLabel}>Blood Group</Text>
              <Text style={styles.gridValue}>{activeStudent.bloodGroup || "N/A"}</Text>
            </View>
            <View style={styles.profileGridItem}>
              <Text style={styles.gridLabel}>Gender</Text>
              <Text style={styles.gridValue}>{activeStudent.gender}</Text>
            </View>
          </View>
        </View>

        {/* Metrics Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.metricsGrid}>
          {/* Attendance Card */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate("Attendance")}
            activeOpacity={0.9}
          >
            <View style={[styles.metricIconBg, { backgroundColor: "#F0FDF4" }]}>
              <Calendar size={20} color="#15803D" />
            </View>
            <Text style={styles.metricTitle}>Attendance</Text>
            <Text style={styles.metricValue}>{activeStudent.attendance.percentage}%</Text>
            <Text style={styles.metricSub}>
              {activeStudent.attendance.presentDays} Present days
            </Text>
            <ChevronRight size={16} color="#94A3B8" style={styles.cardChevron} />
          </TouchableOpacity>

          {/* Academics Card */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate("Academics")}
            activeOpacity={0.9}
          >
            <View style={[styles.metricIconBg, { backgroundColor: "#EFF6FF" }]}>
              <Award size={20} color="#1D4ED8" />
            </View>
            <Text style={styles.metricTitle}>Academics</Text>
            {latestExam ? (
              <>
                <Text style={styles.metricValue}>{latestExam.percentage}%</Text>
                <Text style={styles.metricSub}>Grade: {latestExam.grade} ({latestExam.result})</Text>
              </>
            ) : (
              <>
                <Text style={styles.metricValue}>N/A</Text>
                <Text style={styles.metricSub}>No exams recorded</Text>
              </>
            )}
            <ChevronRight size={16} color="#94A3B8" style={styles.cardChevron} />
          </TouchableOpacity>

          {/* Fees Status Card */}
          <TouchableOpacity
            style={[styles.metricCard, { width: "100%", marginTop: 14 }]}
            onPress={() => navigation.navigate("Fees")}
            activeOpacity={0.9}
          >
            <View style={styles.feesMetricRow}>
              <View style={styles.feesMetricText}>
                <View style={[styles.metricIconBg, { backgroundColor: "#FEF2F2" }]}>
                  <CreditCard size={20} color="#B91C1C" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.metricTitle}>Outstanding Fees</Text>
                  <Text style={styles.feesOutstandingVal}>₹{outstandingFees.toLocaleString()}</Text>
                  <Text style={styles.metricSub}>Total Paid: ₹{totalPaidFees.toLocaleString()}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Notices Section */}
        <View style={styles.noticesHeaderRow}>
          <Text style={styles.sectionTitle}>School Updates</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Notices")}>
            <Text style={styles.viewAllBtn}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noticesContainer}>
          {notices.slice(0, 2).map((notice) => (
            <TouchableOpacity
              key={notice.id}
              style={styles.noticeCard}
              onPress={() => navigation.navigate("Notices")}
              activeOpacity={0.8}
            >
              <View style={styles.noticeIconBg}>
                <Bell size={18} color="#0F766E" />
              </View>
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle} numberOfLines={1}>
                  {notice.title}
                </Text>
                <Text style={styles.noticeDesc} numberOfLines={2}>
                  {notice.description}
                </Text>
                <Text style={styles.noticeDate}>
                  {new Date(notice.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  parentName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F766E",
    letterSpacing: -0.5,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: 0.2,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  siblingSection: {
    marginBottom: 20,
  },
  siblingContainer: {
    flexDirection: "row",
  },
  siblingTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  siblingTabActive: {
    borderColor: "#0F766E",
    backgroundColor: "#0F766E08",
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarActive: {
    backgroundColor: "#0F766E",
  },
  avatarInactive: {
    backgroundColor: "#F1F5F9",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  avatarTextActive: {
    color: "#FFFFFF",
  },
  avatarTextInactive: {
    color: "#475569",
  },
  siblingInfo: {
    marginLeft: 10,
  },
  siblingName: {
    fontSize: 14,
    fontWeight: "700",
  },
  siblingNameActive: {
    color: "#0F766E",
  },
  siblingNameInactive: {
    color: "#334155",
  },
  siblingClass: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileLogoBg: {
    height: 52,
    width: 52,
    borderRadius: 16,
    backgroundColor: "#0F766E10",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  profileSub: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  profileGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileGridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "700",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    position: "relative",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  metricIconBg: {
    height: 38,
    width: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E293B",
  },
  metricSub: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  cardChevron: {
    position: "absolute",
    top: 18,
    right: 14,
  },
  feesMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  feesMetricText: {
    flexDirection: "row",
    alignItems: "center",
  },
  feesOutstandingVal: {
    fontSize: 20,
    fontWeight: "900",
    color: "#B91C1C",
  },
  noticesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllBtn: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F766E",
  },
  noticesContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  noticeCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
  },
  noticeIconBg: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: "#0F766E10",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  noticeDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 6,
  },
  noticeDate: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
});
