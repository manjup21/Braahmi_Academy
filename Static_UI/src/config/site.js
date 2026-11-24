export const siteConfig = {
  /** Production site origin — update when the real domain is live. */
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://braahmiacademy.com').replace(/\/$/, ''),
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'braahmiacademy@gmail.com',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '919901320840',
  applyFormUrl: import.meta.env.VITE_APPLY_FORM_URL || 'mailto:braahmiacademy@gmail.com?subject=Admission%20Enquiry',
  staffPortalUrl:
    import.meta.env.VITE_STAFF_PORTAL_URL || 'https://erp.braahmiacademy.com/login',
  mapsUrl: import.meta.env.VITE_MAPS_URL || 'https://maps.app.goo.gl/zyBqmM8gACdVBeQa9',
};
