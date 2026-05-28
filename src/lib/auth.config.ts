import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { prisma } from "./prisma";

export default {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email / Admission No", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const identifier = credentials.identifier as string;
        let user = null;

        // Check if identifier is an email (Lecturer/Admin)
        if (identifier.includes("@")) {
          user = await prisma.user.findUnique({
            where: { email: identifier },
          });
        } else {
          // It's an admission number (Student)
          const student = await prisma.student.findUnique({
            where: { admissionNumber: identifier },
            include: { user: true },
          });
          
          if (student) {
            user = student.user;
          }
        }

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
