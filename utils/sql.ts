export function validateReadOnlyQuery(query: string): void {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery.startsWith("select")) {
    throw new Error("Only SELECT queries are allowed");
  }

  if (
    /insert|update|delete|create|alter|drop|truncate|attach|detach|optimize/i.test(
      normalizedQuery
    )
  ) {
    throw new Error("Potentially unsafe query detected");
  }
}