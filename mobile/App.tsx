import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import AttendanceScreen from "./src/screens/AttendanceScreen";
import AcademicsScreen from "./src/screens/AcademicsScreen";
import FeesScreen from "./src/screens/FeesScreen";
import NoticesScreen from "./src/screens/NoticesScreen";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Home, Calendar, Award, CreditCard, Bell } from "lucide-react-native";

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Dashboard") {
            return <Home size={size} color={color} />;
          } else if (route.name === "Attendance") {
            return <Calendar size={size} color={color} />;
          } else if (route.name === "Academics") {
            return <Award size={size} color={color} />;
          } else if (route.name === "Fees") {
            return <CreditCard size={size} color={color} />;
          } else if (route.name === "Notices") {
            return <Bell size={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: "#0F766E",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginBottom: 4,
        },
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        },
        headerTitleStyle: {
          fontWeight: "900",
          color: "#0F766E",
          fontSize: 18,
          letterSpacing: -0.2,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "CSV Vidyalay" }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: "Attendance Log" }}
      />
      <Tab.Screen
        name="Academics"
        component={AcademicsScreen}
        options={{ title: "Exam Grades" }}
      />
      <Tab.Screen
        name="Fees"
        component={FeesScreen}
        options={{ title: "Fees Ledger" }}
      />
      <Tab.Screen
        name="Notices"
        component={NoticesScreen}
        options={{ title: "Notice Board" }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <TabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
});
