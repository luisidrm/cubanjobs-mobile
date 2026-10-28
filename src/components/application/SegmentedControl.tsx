import { SegmentedControl as DsSegmentedControl } from "../ds";

interface Props {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}

/** Back-compat adapter over the design-system SegmentedControl (key -> value). */
export function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <DsSegmentedControl
      options={options.map((o) => ({ value: o.key, label: o.label }))}
      value={value}
      onChange={onChange}
    />
  );
}
