export function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatAddress(address = {}) {
  return [address.street, address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(", ");
}

export function ownershipMatches(ownerId, user) {
  return Boolean(user && ownerId && ownerId === user.id);
}
