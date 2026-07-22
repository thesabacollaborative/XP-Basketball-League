import { EmptyState } from "@/components/EmptyState";

export default function LogActivityPage() {
  return (
    <EmptyState
      title="Nothing logged yet"
      description="Role-specific activity forms, gated by tier and verification, arrive in Phase 1."
    />
  );
}
