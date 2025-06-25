// Placeholder for business store
export const useBusinessStore = () => {
  // This is placeholder data. In a real application, you would fetch this
  // from your backend and manage it in a global state manager like Zustand or Redux.
  // The business_name would be pulled from the 'profiles' table in your database.
  const isSubscribed = false; // Toggle this to see the subscribed state

  const businesses = isSubscribed
    ? [
        { id: 1, name: 'Semper Digital' },
        { id: 2, name: 'Another Business' },
      ]
    : [{ id: 1, name: 'Semper Digital' }];

  const currentBusiness = businesses[0];

  return { businesses, currentBusiness, isSubscribed };
};
