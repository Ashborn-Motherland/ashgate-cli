export const validateProjectName = (name: string): string | boolean => {
  const pattern = /^[a-z0-9-]+$/;
  if (!name || name.length === 0) return 'Project name is required.';
  if (!pattern.test(name)) return 'Project name must be kebab-case (alphanumeric and hyphens).';
  return true;
};
