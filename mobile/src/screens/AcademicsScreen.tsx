import React, { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { Award, ChevronDown, ChevronUp, BookOpen, CheckCircle, AlertCircle } from "lucide-react-native";

export default function AcademicsScreen() {
  const { activeStudent } = useContext(AuthContext);
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  if (!activeStudent) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading academic data...</Text>
      </SafeAreaView>
    );
  }

  const exams = activeStudent.exams;

  // Auto-expand the first exam on load
  if (exams.length > 0 && expandedExamId === null) {
    setExpandedExamId(exams[0].id);
  }

  const toggleExpand = (id: string) => {
    if (expandedExamId === id) {
      setExpandedExamId(null);
    } else {
      setExpandedExamId(id);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Academic Profile Header */}
        <View style={styles.profileSummary}>
          <View style={styles.summaryIconBg}>
            <Award size={28} color="#0F766E" />
          </View>
          <Text style={styles.summaryTitle}>{activeStudent.firstName}'s Grade Book</Text>
          <Text style={styles.summarySub}>
            Track exams, test scores, and term-wise performances
          </Text>
        </View>

        {/* Exam Cards */}
        {exams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exam records found for this student.</Text>
          </View>
        ) : (
          exams.map((exam) => {
            const isExpanded = expandedExamId === exam.id;
            const isPass = exam.result === "PASS";

            return (
              <View key={exam.id} style={styles.examCard}>
                {/* Accordion Header */}
                <TouchableOpacity
                  style={styles.examHeader}
                  onPress={() => toggleExpand(exam.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.examHeaderLeft}>
                    <BookOpen size={20} color="#0F766E" style={styles.examIcon} />
                    <View>
                      <Text style={styles.examName}>{exam.name}</Text>
                      <Text style={styles.examDate}>
                        Date: {new Date(exam.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.examHeaderRight}>
                    <View style={styles.performanceMeta}>
                      <Text style={styles.examPercentage}>{exam.percentage}%</Text>
                      <Text style={[styles.examResult, isPass ? styles.resultPass : styles.resultFail]}>
                        {exam.grade} • {exam.result}
                      </Text>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} color="#64748B" />
                    ) : (
                      <ChevronDown size={20} color="#64748B" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Collapsible Content */}
                {isExpanded && (
                  <View style={styles.examDetails}>
                    <View style={styles.divider} />
                    
                    {/* Subject Records */}
                    {exam.subjects.map((sub, idx) => {
                      const percent = (sub.marksObtained / sub.maxMarks) * 100;
                      // Determine progress bar color based on performance
                      let progressBarColor = "#0F766E"; // Teal
                      if (percent < 40) progressBarColor = "#DC2626"; // Red
                      else if (percent < 75) progressBarColor = "#D97706"; // Yellow/Orange

                      return (
                        <View key={idx} style={styles.subjectRow}>
                          <View style={styles.subjectHeader}>
                            <Text style={styles.subjectName}>{sub.subject}</Text>
                            <Text style={styles.subjectScore}>
                              {sub.marksObtained}/{sub.maxMarks}{" "}
                              <Text style={styles.subjectGrade}>({sub.grade})</Text>
                            </Text>
                          </View>
                          
                          {/* Custom Progress Bar */}
                          <View style={styles.progressContainer}>
                            <View
                              style={[
                                styles.progressBar,
                                { width: `${percent}%`, backgroundColor: progressBarColor },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}

                    {/* Summary Footer */}
                    <View style={styles.examSummaryFooter}>
                      {isPass ? (
                        <View style={styles.resultBadgePass}>
                          <CheckCircle size={14} color="#15803D" />
                          <Text style={styles.resultBadgePassText}>Promoted / Passed</Text>
                        </View>
                      ) : (
                        <View style={styles.resultBadgeFail}>
                          <AlertCircle size={14} color="#B91C1C" />
                          <Text style={styles.resultBadgeFailText}>Attention Needed</Text>
                        </View>
                      )}
                      <Text style={styles.gradingSystemText}>Grading Scale: A+ (90%+), A (80%+), B (70%+)</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

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
  profileSummary: {
    alignItems: "center",
    marginVertical: 14,
    marginBottom: 24,
  },
  summaryIconBg: {
    height: 58,
    width: 58,
    borderRadius: 18,
    backgroundColor: "#0F766E10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  summarySub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 10,
    fontWeight: "500",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  examCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  examHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  examHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  examIcon: {
    marginRight: 12,
  },
  examName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },
  examDate: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  examHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  performanceMeta: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  examPercentage: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F766E",
  },
  examResult: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
    textTransform: "uppercase",
  },
  resultPass: {
    color: "#166534",
  },
  resultFail: {
    color: "#991B1B",
  },
  examDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 14,
  },
  subjectRow: {
    marginBottom: 14,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  subjectName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  subjectScore: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },
  subjectGrade: {
    color: "#64748B",
    fontWeight: "600",
  },
  progressContainer: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  examSummaryFooter: {
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultBadgePass: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultBadgePassText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
    marginLeft: 4,
  },
  resultBadgeFail: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultBadgeFailText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#991B1B",
    marginLeft: 4,
  },
  gradingSystemText: {
    fontSize: 9,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
