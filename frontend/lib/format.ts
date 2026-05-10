export function titleCase(value: string | null | undefined): string {
  if (!value) return "Not set";
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatExtent(value: string | null): string {
  return value ? `${Number(value).toLocaleString("en-IN")} sq yd` : "Not set";
}

