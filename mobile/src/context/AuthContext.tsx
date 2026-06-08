import React, { createContext, useState, useEffect } from "react";
import { StudentProfile, SchoolNotice } from "../data/mockData";

const BASE_URL = "http://localhost:3007/api/v1/parent";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  branchName: string;
}

export interface StudentSummary {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  rollNo: string;
  class: string;
  section: string;
  gender: "MALE" | "FEMALE";
  bloodGroup: string;
}

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  userData: UserData | null;
  activeStudent: StudentProfile | null;
  children: StudentSummary[];
  notices: SchoolNotice[];
  setActiveStudent: (student: any) => Promise<void>;
  refreshDashboard: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  userData: null,
  activeStudent: null,
  children: [],
  notices: [],
  setActiveStudent: async () => {},
  refreshDashboard: async () => {},
  login: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeStudent, setActiveStudentState] = useState<StudentProfile | null>(null);
  const [childrenList, setChildrenList] = useState<StudentSummary[]>([]);
  const [noticesList, setNoticesList] = useState<SchoolNotice[]>([]);

  // Helper to fetch dashboard data for a student
  const fetchDashboardData = async (studentId: string, token: string) => {
    try {
      console.log(`Fetching dashboard for student: ${studentId}`);
      const res = await fetch(`${BASE_URL}/student/${studentId}/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveStudentState(data.data.student);
        setNoticesList(data.data.notices || []);
        return true;
      } else {
        const errMsg = data.error?.message || data.error || "Unknown error";
        alert("API Error: " + errMsg);
        console.error("Dashboard API error:", data.error || "Unknown error");
        return false;
      }
    } catch (err: any) {
      alert("Network/JS Error: " + err.message);
      console.error("Network error fetching student dashboard:", err);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`Attempting login for email: ${email}`);
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        const { token, user, children: siblingList } = data.data;
        console.log("Login successful! Provisioned parent user:", user.name);
        
        setUserToken(token);
        setUserData(user);
        setChildrenList(siblingList);
        
        if (siblingList && siblingList.length > 0) {
          // Fetch first sibling dashboard by default
          await fetchDashboardData(siblingList[0].id, token);
        }
        
        setIsLoading(false);
        return true;
      } else {
        console.warn("Login failed:", data.error || "Invalid credentials");
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Network error during login request:", err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setIsLoading(true);
    setUserToken(null);
    setUserData(null);
    setActiveStudentState(null);
    setChildrenList([]);
    setNoticesList([]);
    setIsLoading(false);
  };

  const setActiveStudent = async (student: any) => {
    if (!userToken || !student?.id) return;
    setIsLoading(true);
    const success = await fetchDashboardData(student.id, userToken);
    if (!success) {
      console.error("Could not switch to student:", student.id);
    }
    setIsLoading(false);
  };

  const refreshDashboard = async () => {
    if (userToken && activeStudent?.id) {
      await fetchDashboardData(activeStudent.id, userToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userData,
        activeStudent,
        children: childrenList,
        notices: noticesList,
        setActiveStudent,
        refreshDashboard,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
