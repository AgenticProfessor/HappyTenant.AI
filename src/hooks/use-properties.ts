import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { mockProperties, mockUnits, getPropertyById } from '@/data/mock-data';

// Types for mutations
interface CreatePropertyData {
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  units?: number;
}

interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id: string;
}

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions - easily replaceable with real API calls
const fetchProperties = async () => {
  await delay(500);
  return mockProperties;
};

const fetchProperty = async (id: string) => {
  await delay(300);
  const property = getPropertyById(id);
  if (!property) {
    throw new Error('Property not found');
  }
  return property;
};

const fetchPropertyUnits = async (propertyId: string) => {
  await delay(300);
  return mockUnits.filter((unit) => unit.propertyId === propertyId);
};

const createProperty = async (data: CreatePropertyData) => {
  await delay(800);
  // In real implementation, this would call the API
  const newProperty = {
    id: `prop-${Date.now()}`,
    organizationId: 'org-1',
    ...data,
  };
  return newProperty;
};

const updateProperty = async (data: UpdatePropertyData) => {
  await delay(800);
  const { id, ...updates } = data;
  const property = getPropertyById(id);
  if (!property) {
    throw new Error('Property not found');
  }
  // In real implementation, this would call the API
  return { ...property, ...updates };
};

const deleteProperty = async (id: string) => {
  await delay(800);
  const property = getPropertyById(id);
  if (!property) {
    throw new Error('Property not found');
  }
  // In real implementation, this would call the API
  return { success: true };
};

// Hooks

/**
 * Fetch all properties
 */
export function useProperties() {
  return useQuery({
    queryKey: queryKeys.properties,
    queryFn: fetchProperties,
  });
}

/**
 * Fetch a single property by ID
 */
export function useProperty(id: string) {
  return useQuery({
    queryKey: queryKeys.property(id),
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  });
}

/**
 * Fetch units for a specific property
 */
export function usePropertyUnits(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.propertyUnits(propertyId),
    queryFn: () => fetchPropertyUnits(propertyId),
    enabled: !!propertyId,
  });
}

/**
 * Create a new property
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      // Invalidate and refetch properties list
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
    },
  });
}

/**
 * Update an existing property
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProperty,
    onSuccess: (data) => {
      // Invalidate the specific property and the list
      queryClient.invalidateQueries({ queryKey: queryKeys.property(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
    },
  });
}

/**
 * Delete a property
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      // Invalidate the properties list
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
    },
  });
}

// Example of how to switch to real API:
//
// Replace the mock functions with:
//
// const fetchProperties = async () => {
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties`);
//   if (!response.ok) throw new Error('Failed to fetch properties');
//   return response.json();
// };
