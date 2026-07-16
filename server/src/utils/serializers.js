function serializeValue(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === "object") {
    if (typeof value.toHexString === "function") {
      return value.toHexString();
    }

    const serialized = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeValue(item)])
    );

    if (serialized._id) {
      serialized.id = serialized._id;
      delete serialized._id;
    }

    return serialized;
  }

  return value;
}

export function serializeDocument(document) {
  return document ? serializeValue(document) : null;
}

export function serializeDocuments(documents) {
  return documents.map(serializeDocument);
}

export function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toHexString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}
