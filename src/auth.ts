import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const resendProvider = Resend({
  apiKey: process.env.AUTH_RESEND_KEY,
  from: process.env.EMAIL_FROM ?? "XP League <onboarding@resend.dev>",
});

// Dev fallback so the sign-in flow is testable without a Resend account:
// log the magic link to the server console instead of sending an email.
if (process.env.NODE_ENV !== "production" && !process.env.AUTH_RESEND_KEY) {
  resendProvider.sendVerificationRequest = async ({ identifier, url }) => {
    console.log(`\n[dev] Magic sign-in link for ${identifier}:\n${url}\n`);
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [resendProvider],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.activeRole = user.activeRole ?? null;
      }
      return session;
    },
  },
});
