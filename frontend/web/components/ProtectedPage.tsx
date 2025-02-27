import { useUser } from "@/contexts/UserContext";
import { PermissionValidator } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect } from "react";

/*
 * This component is used to guard pages of the app from users based on permissions.
 *
 * The middleware is the preferred way for just in general authenticating.
 *
 * Authors: @codyduong
 * Date Created: 2025-02-25
 * Revision History:
 * - 2025-02-05 - @codyduong - initial creation, improve authentication flow
 */

interface ProtectedPageProps {
  validator: PermissionValidator | false;
  children: React.ReactNode;
}

export default function ProtectedPage({
  validator,
  children,
}: ProtectedPageProps): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (validator === false) {
      return;
    }

    if (!user) {
      router.push("/login");
    } else {
      if (!validator.validate(user.permissions)) {
        router.push("/login");
      }
    }
  }, [validator, router, user]);

  return (
    <Suspense fallback={<div>Loading permissions</div>}>{children}</Suspense>
  );
}
