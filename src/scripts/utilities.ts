export function toPascalCase(str: string) {
  return str
    .toLowerCase()
    .split(/[-_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function parseProps(rawProps: string = "") {
  const props: Record<string, string> = {};
  rawProps.replace(/([a-zA-Z0-9_-]+)\s*=\s*"([^"]*)"/g, (_, key, value) => {
    props[key] = value;
    return "";
  });
  return props;
}
