import NextAuth from "next-auth";
import authConfig from "./lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/dashboard",
  "/student_template.csv",
  "/lecturer_template.csv",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // If logged in and visiting login/register/dashboard, redirect to role-specific dashboard
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register" || nextUrl.pathname === "/dashboard")) {
    const role = (req.auth?.user as any)?.role?.toLowerCase() || "student";
    const target = `/${role}/dashboard`;
    // Prevent self-redirect
    if (target !== nextUrl.pathname) {
      return NextResponse.redirect(new URL(target, nextUrl));
    }
  }

  // If not logged in and not on a public route, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Basic RBAC checking
  if (isLoggedIn) {
    const role = (req.auth?.user as any)?.role?.toUpperCase() || "STUDENT";
    const roleDashboard = `/${role.toLowerCase()}/dashboard`;

    if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      if (roleDashboard !== nextUrl.pathname) {
        return NextResponse.redirect(new URL(roleDashboard, nextUrl));
      }
    }

    if (nextUrl.pathname.startsWith("/lecturer") && role !== "LECTURER") {
      if (roleDashboard !== nextUrl.pathname) {
        return NextResponse.redirect(new URL(roleDashboard, nextUrl));
      }
    }

    if (nextUrl.pathname.startsWith("/student") && role !== "STUDENT") {
      if (roleDashboard !== nextUrl.pathname) {
        return NextResponse.redirect(new URL(roleDashboard, nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.*|sw\\.js|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.csv$).*)"],
};
