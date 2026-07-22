import type { Role } from "@/generated/prisma/enums";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeRole: Role | null;
    } & DefaultSession["user"];
  }

  interface User {
    activeRole?: Role | null;
  }
}
