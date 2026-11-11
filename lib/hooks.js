'use client';
// All server state lives here (React Query): caching, de-duplication, background refresh and invalidation.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

// keepPreviousData: the old page stays on screen while the next one loads, so paging/filtering never flashes empty.
const LIST = { placeholderData: keepPreviousData, staleTime: 30_000 };

export const useDoctors = (params) => useQuery({ queryKey: ['doctors', params], queryFn: () => api.doctors.list(params), ...LIST });
export const useDoctor = (id) => useQuery({ queryKey: ['doctor', id], queryFn: () => api.doctors.get(id), staleTime: 60_000 });
export const usePatients = (params) => useQuery({ queryKey: ['patients', params], queryFn: () => api.patients.list(params), ...LIST });
export const usePatient = (id) => useQuery({ queryKey: ['patient', id], queryFn: () => api.patients.get(id) });
export const useStats = (months) => useQuery({ queryKey: ['stats', months], queryFn: () => api.stats(months), placeholderData: keepPreviousData, staleTime: 60_000 });
// Specializations/hospitals change rarely, so cache them longer.
export const useLookup = (kind) => useQuery({ queryKey: ['lookup', kind], queryFn: () => api.lookups.list(kind), staleTime: 5 * 60_000 });

function useAction(fn, keys) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })) });
}
export const useCreateDoctor = () => useAction(api.doctors.create, ['doctors', 'stats']);
export const useSavePatient = () => useAction(({ id, data }) => (id ? api.patients.update(id, data) : api.patients.create(data)), ['patients', 'patient', 'doctors', 'stats']);
export const useDeletePatient = () => useAction(api.patients.remove, ['patients', 'doctors', 'stats']);

export function useLookupMutations(kind) {
  const done = ['lookup', 'doctors'];
  return {
    add: useAction((name) => api.lookups.add(kind, name), done),
    rename: useAction(({ old, name }) => api.lookups.rename(kind, old, name), done),
    remove: useAction((name) => api.lookups.remove(kind, name), done),
  };
}
