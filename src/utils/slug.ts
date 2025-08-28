/**
 * Convert a service name to a URL-friendly slug
 * @param name Service name to convert
 * @returns URL-friendly slug
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    // Allow Cyrillic characters (Ukrainian/Russian) along with Latin
    .replace(/[^a-z0-9а-яё\s-]/gi, '') // Keep Latin, Cyrillic, numbers, spaces, and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Create a service detail route path
 * @param service Service object with optional language-specific names
 * @returns Route path for the service detail page
 */
export function getServiceDetailPath(service: { 
  id: string | number; 
  name: string;
  display_name?: string;
  slug_name?: string;
  // Add support for accessing original service data if available
  [key: string]: any;
}): string {
  // Use slug_name for consistent URLs across languages, fallback to name
  let nameForSlug = service.slug_name || service.name;
  
  const slug = createSlug(nameForSlug);
  
  // If slug is empty after processing, use a fallback
  const finalSlug = slug || 'service';
  
  // Include ID in the slug for uniqueness, similar to how some sites handle it
  return `/services/${finalSlug}-${service.id}`;
}