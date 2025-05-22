
export interface ParameterDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'slider' | 'checkbox' | 'select' | 'image' | 'radio';
  options?: Array<{label: string, value: string | number}>;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  description?: string;
  path?: string;
  isAdvanced?: boolean;
}
