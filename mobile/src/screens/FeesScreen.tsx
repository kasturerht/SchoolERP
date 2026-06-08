import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { CreditCard, CheckCircle2, AlertTriangle, Clock } from "lucide-react-native";

export default function FeesScreen() {
  const { activeStudent } = useContext(AuthContext);

  if (!activeStudent) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading fee details...</Text>
      </SafeAreaView>
    );
  }

  const invoices = activeStudent.invoices;

  // Calculate fees statistics
  const outstandingFees = invoices
    .filter((inv) => inv.status !== "PAID")
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID" || inv.status === "PARTIALLY_PAID")
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <View style={[styles.badge, styles.badgePaid]}>
            <CheckCircle2 size={12} color="#15803D" style={styles.badgeIcon} />
            <Text style={[styles.badgeText, styles.badgeTextPaid]}>Paid</Text>
          </View>
        );
      case "PARTIALLY_PAID":
        return (
          <View style={[styles.badge, styles.badgePartial]}>
            <Clock size={12} color="#D97706" style={styles.badgeIcon} />
            <Text style={[styles.badgeText, styles.badgeTextPartial]}>Partial</Text>
          </View>
        );
      case "UNPAID":
        return (
          <View style={[styles.badge, styles.badgeUnpaid]}>
            <Clock size={12} color="#DC2626" style={styles.badgeIcon} />
            <Text style={[styles.badgeText, styles.badgeTextUnpaid]}>Unpaid</Text>
          </View>
        );
      case "OVERDUE":
        return (
          <View style={[styles.badge, styles.badgeOverdue]}>
            <AlertTriangle size={12} color="#991B1B" style={styles.badgeIcon} />
            <Text style={[styles.badgeText, styles.badgeTextOverdue]}>Overdue</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Ledger Header Cards */}
        <View style={styles.overviewCards}>
          <View style={[styles.card, styles.outstandingCard]}>
            <Text style={styles.cardLabel}>Outstanding Balance</Text>
            <Text style={styles.cardValueOutstanding}>
              ₹{outstandingFees.toLocaleString()}
            </Text>
            <Text style={styles.cardSubText}>Total billed: ₹{totalInvoiced.toLocaleString()}</Text>
          </View>

          <View style={[styles.card, styles.paidCard]}>
            <Text style={styles.cardLabel}>Paid to Date</Text>
            <Text style={styles.cardValuePaid}>₹{totalPaid.toLocaleString()}</Text>
            <Text style={[styles.cardSubText, { color: "#166534" }]}>
              Receipts generated successfully
            </Text>
          </View>
        </View>

        {/* Ledger Details List */}
        <Text style={styles.listTitle}>Fee Invoices</Text>
        {invoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No invoices loaded.</Text>
          </View>
        ) : (
          invoices.map((item) => {
            const remaining = item.amount - item.paidAmount;
            return (
              <View key={item.id} style={styles.invoiceCard}>
                <View style={styles.invoiceRowHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.invoiceNo}>{item.invoiceNo}</Text>
                    <Text style={styles.invoiceTitle}>{item.title}</Text>
                  </View>
                  {renderStatusBadge(item.status)}
                </View>

                <View style={styles.divider} />

                <View style={styles.ledgerTable}>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>Due Date</Text>
                    <Text style={styles.ledgerValue}>
                      {new Date(item.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>Total Amount</Text>
                    <Text style={styles.ledgerValue}>₹{item.amount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>Paid Amount</Text>
                    <Text style={[styles.ledgerValue, { color: "#166534" }]}>
                      ₹{item.paidAmount.toLocaleString()}
                    </Text>
                  </View>
                  {remaining > 0 && (
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Balance Due</Text>
                      <Text style={[styles.ledgerValue, { color: "#B91C1C", fontWeight: "800" }]}>
                        ₹{remaining.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
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
  overviewCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  card: {
    width: "48%",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  outstandingCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
  },
  paidCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  cardLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  cardValueOutstanding: {
    fontSize: 20,
    fontWeight: "900",
    color: "#991B1B",
  },
  cardValuePaid: {
    fontSize: 20,
    fontWeight: "900",
    color: "#166534",
  },
  cardSubText: {
    fontSize: 10,
    color: "#7F1D1D",
    fontWeight: "500",
    marginTop: 6,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: 0.2,
    marginBottom: 14,
    textTransform: "uppercase",
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
  invoiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  invoiceRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  invoiceNo: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  badgePaid: {
    backgroundColor: "#DCFCE7",
  },
  badgeTextPaid: {
    color: "#166534",
  },
  badgePartial: {
    backgroundColor: "#FEF3C7",
  },
  badgeTextPartial: {
    color: "#D97706",
  },
  badgeUnpaid: {
    backgroundColor: "#FEE2E2",
  },
  badgeTextUnpaid: {
    color: "#DC2626",
  },
  badgeOverdue: {
    backgroundColor: "#FEE2E2",
  },
  badgeTextOverdue: {
    color: "#991B1B",
    fontWeight: "900",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  ledgerTable: {},
  ledgerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  ledgerLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  ledgerValue: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },
});
