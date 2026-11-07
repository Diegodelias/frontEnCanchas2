import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_COMPLEXES } from '../data/mockComplexes';
import { Complex, Court, DayAvailability, TimeSlot } from '../types/canchas';

interface ComplexesContextValue {
  complexes: Complex[];
  addComplex: (complex: Omit<Complex, 'id'>) => Complex;
  updateComplex: (id: string, patch: Partial<Complex>) => void;
  deleteComplex: (id: string) => void;

  addCourt: (complexId: string, court: Omit<Court, 'id'>) => void;
  updateCourt: (complexId: string, courtId: string, patch: Partial<Court>) => void;
  deleteCourt: (complexId: string, courtId: string) => void;

  addDay: (complexId: string, courtId: string, day: Omit<DayAvailability, 'id'>) => void;
  updateDay: (complexId: string, courtId: string, dayId: string, patch: Partial<DayAvailability>) => void;
  deleteDay: (complexId: string, courtId: string, dayId: string) => void;

  addSlot: (complexId: string, courtId: string, dayId: string, slot: Omit<TimeSlot, 'id'>) => void;
  deleteSlot: (complexId: string, courtId: string, dayId: string, slotId: string) => void;

  resetToDefault: () => void;
}

const ComplexesContext = createContext<ComplexesContextValue | undefined>(undefined);

const STORAGE_KEY = 'canchas3_complexes_data';

export const ComplexesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complexes, setComplexes] = useState<Complex[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return MOCK_COMPLEXES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complexes));
    } catch {
      // ignore
    }
  }, [complexes]);

  const addComplex = (data: Omit<Complex, 'id'>): Complex => {
    const newComplex: Complex = {
      ...data,
      id: `club-${Date.now()}`,
      courts: data.courts || [],
    };
    setComplexes((prev) => [newComplex, ...prev]);
    return newComplex;
  };

  const updateComplex = (id: string, patch: Partial<Complex>) => {
    setComplexes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const deleteComplex = (id: string) => {
    setComplexes((prev) => prev.filter((c) => c.id !== id));
  };

  const addCourt = (complexId: string, courtData: Omit<Court, 'id'>) => {
    const newCourt: Court = {
      ...courtData,
      id: `court-${Date.now()}`,
      availabilityByDay: courtData.availabilityByDay || [],
    };
    setComplexes((prev) =>
      prev.map((c) =>
        c.id === complexId
          ? { ...c, courts: [...c.courts, newCourt] }
          : c
      )
    );
  };

  const updateCourt = (complexId: string, courtId: string, patch: Partial<Court>) => {
    setComplexes((prev) =>
      prev.map((c) => {
        if (c.id !== complexId) return c;
        return {
          ...c,
          courts: c.courts.map((court) =>
            court.id === courtId ? { ...court, ...patch } : court
          ),
        };
      })
    );
  };

  const deleteCourt = (complexId: string, courtId: string) => {
    setComplexes((prev) =>
      prev.map((c) =>
        c.id === complexId
          ? { ...c, courts: c.courts.filter((court) => court.id !== courtId) }
          : c
      )
    );
  };

  const addDay = (complexId: string, courtId: string, dayData: Omit<DayAvailability, 'id'>) => {
    const newDay: DayAvailability = {
      ...dayData,
      id: `day-${Date.now()}`,
      slots: dayData.slots || [],
    };
    setComplexes((prev) =>
      prev.map((c) => {
        if (c.id !== complexId) return c;
        return {
          ...c,
          courts: c.courts.map((court) => {
            if (court.id !== courtId) return court;
            return {
              ...court,
              availabilityByDay: [...court.availabilityByDay, newDay],
            };
          }),
        };
      })
    );
  };

  const updateDay = (
    complexId: string,
    courtId: string,
    dayId: string,
    patch: Partial<DayAvailability>
  ) => {
    setComplexes((prev) =>
      prev.map((c) => {
        if (c.id !== complexId) return c;
        return {
          ...c,
          courts: c.courts.map((court) => {
            if (court.id !== courtId) return court;
            return {
              ...court,
              availabilityByDay: court.availabilityByDay.map((d) =>
                d.id === dayId ? { ...d, ...patch } : d
              ),
            };
          }),
        };
      })
    );
  };

  const deleteDay = (complexId: string, courtId: string, dayId: string) => {
    setComplexes((prev) =>
      prev.map((c) => {
        if (c.id !== complexId) return c;
        return {
          ...c,
          courts: c.courts.map((court) => {
            if (court.id !== courtId) return court;
            return {
              ...court,
              availabilityByDay: court.availabilityByDay.filter((d) => d.id !== dayId),
            };
          }),
        };
      })
    );
  };

  const addSlot = (
    complexId: string,
    courtId: string,
    dayId: string,
    slotData: Omit<TimeSlot, 'id'>
  ) => {
    const newSlot: TimeSlot = {
      ...slotData,
      id: `slot-${Date.now()}`,
    };
    setComplexes((prev) =>
      prev.map((c) => {
        if (c.id !== complexId) return c;
        return {
          ...c,
          courts: c.courts.map((court) => {
            if (court.id !== courtId) return court;
            return {
              ...court,
              availabilityByDay: court.availabilityByDay.map((d) => {
                if (d.id !== dayId) return d;
                const sortedSlots = [...d.slots, newSlot].sort((a, b) =>
                  a.time.localeCompare(b.time)
                );
                return { ...d, slots: sortedSlots };
              }),
            };
          }),
        };
      })
    );
  };

  const deleteSlot = (
    complexId: string,
    courtId: string,
    dayId: string,
    slotId: string
  ) => {
    setComplexes((prev) =>
      prev.map((c) => {
        if (c.id !== complexId) return c;
        return {
          ...c,
          courts: c.courts.map((court) => {
            if (court.id !== courtId) return court;
            return {
              ...court,
              availabilityByDay: court.availabilityByDay.map((d) => {
                if (d.id !== dayId) return d;
                return { ...d, slots: d.slots.filter((s) => s.id !== slotId) };
              }),
            };
          }),
        };
      })
    );
  };

  const resetToDefault = () => {
    setComplexes(MOCK_COMPLEXES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <ComplexesContext.Provider
      value={{
        complexes,
        addComplex,
        updateComplex,
        deleteComplex,
        addCourt,
        updateCourt,
        deleteCourt,
        addDay,
        updateDay,
        deleteDay,
        addSlot,
        deleteSlot,
        resetToDefault,
      }}
    >
      {children}
    </ComplexesContext.Provider>
  );
};

export function useComplexes(): ComplexesContextValue {
  const ctx = useContext(ComplexesContext);
  if (!ctx) {
    throw new Error('useComplexes must be used within a ComplexesProvider');
  }
  return ctx;
}
