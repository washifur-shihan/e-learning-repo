import { redirect } from "next/navigation";
import UserAuth from "./userAuth";
import React, { useEffect, useState } from "react";

interface ProtectedProps{
    children: React.ReactNode;
}

export default function Protected({children}: ProtectedProps){
    const isAuthenticated = UserAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return isAuthenticated ? <>{children}</> : redirect("/");
}