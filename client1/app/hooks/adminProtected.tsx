import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function AdminProtected({ children }: ProtectedProps) {
  const { user } = useSelector((state: any) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (user) {
    const isAdmin = user?.role === "admin";
    return isAdmin ? <>{children}</> : redirect("/");
  } else {
    return redirect("/");
  }
}
