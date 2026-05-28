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
  "/student_template.csv",
  "/lecturer_template.csv",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register" || nextUrl.pathname === "/dashboard")) {
    const role = (req.auth?.user as any)?.role?.toLowerCase() || "student";
    return NextResponse.redirect(new URL(`/${role}/dashboard`, nextUrl));
  }
  
  // Basic RBAC checking
  if (isLoggedIn) {
    const role = (req.auth?.user as any)?.role;
    
    // Admin trying to access student/lecturer routes or vice-versa
    if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase() || "student"}/dashboard`, nextUrl));
    }
    
    if (nextUrl.pathname.startsWith("/lecturer") && role !== "LECTURER") {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase() || "student"}/dashboard`, nextUrl));
    }
    
    if (nextUrl.pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase() || "student"}/dashboard`, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.*|sw\\.js|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.csv$).*)"],
};
