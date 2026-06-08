import React, { useState, useContext, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { Bell, BookOpen, AlertCircle, Calendar, CreditCard, ChevronDown, ChevronUp } from "lucide-react-native";

export default function NoticesScreen() {
  const { notices, refreshDashboard } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshDashboard();
    setRefreshing(false);
  }, [refreshDashboard]);

  const toggleNotice = (id: string) => {
    if (expandedNoticeId === id) {
      setExpandedNoticeId(null);
    } else {
      setExpandedNoticeId(id);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ACADEMIC":
        return <BookOpen size={18} color="#1D4ED8" />;
      case "FEES":
        return <CreditCard size={18} color="#B91C1C" />;
      case "EVENT":
        return <Calendar size={18} color="#D97706" />;
      case "HOLIDAY":
        return <Calendar size={18} color="#059669" />;
      case "URGENT":
        return <AlertCircle size={18} color="#DC2626" />;
      default:
        return <Bell size={18} color="#0F766E" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ACADEMIC":
        return { bg: "#EFF6FF", border: "#DBEAFE", text: "#1D4ED8" };
      case "FEES":
        return { bg: "#FEF2F2", border: "#FEE2E2", text: "#B91C1C" };
      case "EVENT":
        return { bg: "#FFFBEB", border: "#FEF3C7", text: "#D97706" };
      case "HOLIDAY":
        return { bg: "#ECFDF5", border: "#D1FAE5", text: "#059669" };
      case "URGENT":
        return { bg: "#FEF2F2", border: "#FEE2E2", text: "#DC2626" };
      default:
        return { bg: "#F8FAFC", border: "#F1F5F9", text: "#0F766E" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0F766E"]}
            tintColor="#0F766E"
          />
        }
      >
        
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleText}>Notice Board</Text>
          <Text style={styles.subText}>
            Keep track of academic notices, event alerts, and urgent reminders
          </Text>
        </View>

        {/* Notices list */}
        {notices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notices posted yet.</Text>
          </View>
        ) : (
          notices.map((notice) => {
            const isExpanded = expandedNoticeId === notice.id;
            const categoryColors = getCategoryColor(notice.category);

            return (
              <View key={notice.id} style={styles.noticeCard}>
                <TouchableOpacity
                  style={styles.noticeHeader}
                  onPress={() => toggleNotice(notice.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.categoryIconBg,
                      { backgroundColor: categoryColors.bg, borderColor: categoryColors.border },
                    ]}
                  >
                    {getCategoryIcon(notice.category)}
                  </View>

                  <View style={styles.noticeHeaderMeta}>
                    <View style={styles.badgeRow}>
                      <Text style={[styles.categoryBadge, { color: categoryColors.text }]}>
                        {notice.category}
                      </Text>
                      <Text style={styles.noticeDate}>
                        {new Date(notice.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <Text style={styles.noticeTitle} numberOfLines={2}>
                      {notice.title}
                    </Text>
                  </View>

                  <View style={styles.chevronContainer}>
                    {isExpanded ? (
                      <ChevronUp size={18} color="#64748B" />
                    ) : (
                      <ChevronDown size={18} color="#64748B" />
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.noticeBody}>
                    <View style={styles.divider} />
                    <Text style={styles.noticeDesc}>{notice.description}</Text>
                    <View style={styles.noticeFooter}>
                      <Text style={styles.authorText}>Issued by: {notice.author}</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  titleBlock: {
    marginBottom: 24,
    alignItems: "center",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },
  subText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 16,
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
  noticeCard: {
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
  noticeHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  categoryIconBg: {
    height: 44,
    width: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  noticeHeaderMeta: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.2,
    marginRight: 8,
  },
  noticeDate: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    lineHeight: 18,
  },
  chevronContainer: {
    paddingLeft: 10,
  },
  noticeBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  noticeDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    fontWeight: "500",
  },
  noticeFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "flex-end",
  },
  authorText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
