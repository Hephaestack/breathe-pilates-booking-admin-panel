"use client"
import { useRouter } from "next/navigation";
import { useLoading } from "../layout";

export function useNavigation() {
  const router = useRouter();
  const { setIsLoading } = useLoading();

  const navigateTo = (path) => {
    setIsLoading(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  return { navigateTo };
}
