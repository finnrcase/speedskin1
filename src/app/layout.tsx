import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DeviceProvider } from "@/lib/device/DeviceProvider";
import { ClassroomProvider } from "@/lib/classroom/ClassroomProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ProtectedApp } from "@/components/auth/ProtectedApp";
import { UserProgressProvider } from "@/lib/progress/UserProgressProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpeedSkin Typing Academy",
  description:
    "Learn touch typing the fun way. Lessons, levels, and achievements for the classroom.",
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>
          <DeviceProvider>
            <UserProgressProvider>
              <ClassroomProvider>
                <ProtectedApp>{children}</ProtectedApp>
              </ClassroomProvider>
            </UserProgressProvider>
          </DeviceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
