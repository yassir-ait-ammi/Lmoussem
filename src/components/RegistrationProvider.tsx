"use client";

import { createContext, useContext, useEffect, useState } from "react";
import CapacityBar from "./CapacityBar";

type Registration = {
  registered: boolean;
  registeredCount: number;
  capacity: number;
  remaining: number;
  /** Show the outcome of a confirmed request before the page refresh delivers it. */
  confirm: (registered: boolean | null) => void;
};

const RegistrationContext = createContext<Registration | null>(null);

type Props = {
  isRegistered: boolean;
  registeredCount: number;
  capacity: number;
  children: React.ReactNode;
};

// Holds the registration state of one event so the button, the "Registered"
// badge and the capacity bar change together, without waiting for the page refresh.
export function RegistrationProvider({
  isRegistered,
  registeredCount,
  capacity,
  children,
}: Props) {
  const [expected, setExpected] = useState<boolean | null>(null);

  // once the refreshed props agree, go back to trusting them
  useEffect(() => {
    if (expected === isRegistered) setExpected(null);
  }, [expected, isRegistered]);

  const registered = expected ?? isRegistered;
  const count = registeredCount + (registered === isRegistered ? 0 : registered ? 1 : -1);

  return (
    <RegistrationContext.Provider
      value={{
        registered,
        registeredCount: count,
        capacity,
        remaining: Math.max(capacity - count, 0),
        confirm: setExpected,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const value = useContext(RegistrationContext);
  if (!value) throw new Error("useRegistration must be used inside RegistrationProvider");
  return value;
}

export function RegisteredBadge() {
  const { registered } = useRegistration();
  if (!registered) return null;
  return (
    <span className="rounded-full bg-ok-soft px-2 py-0.5 text-xs font-medium text-ok">
      Registered
    </span>
  );
}

export function LiveCapacityBar() {
  const { capacity, registeredCount, remaining } = useRegistration();
  return (
    <CapacityBar
      capacity={capacity}
      registeredCount={registeredCount}
      remaining={remaining}
    />
  );
}
