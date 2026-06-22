import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import Loader from "../components/Loader/Loader";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function AdminProtected({ children }: ProtectedProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = useLoadUserQuery(undefined, {
    skip: !mounted,
  });

  if (!mounted || isLoading) {
    return <Loader />;
  }

  if (data?.user && data.user.role === "admin") {
    return <>{children}</>;
  }

  return redirect("/");
}
