import { useToastContext } from "@/components/ui/toast";

export type { ToastVariant } from "@/components/ui/toast";

export function useToast() {
  return useToastContext();
}
