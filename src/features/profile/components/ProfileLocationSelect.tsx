import React from 'react';
import { ITALIAN_PROVINCES, COUNTRY_CODES } from '../utils/profileUtils';

interface ProvinceSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export const ProvinceSelect = React.memo(function ProvinceSelect({
  value,
  onChange,
  placeholder,
  className,
}: ProvinceSelectProps) {
  return (
    <select
      className={className}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {ITALIAN_PROVINCES.map(p => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
});

interface PhoneCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const PhoneCodeSelect = React.memo(function PhoneCodeSelect({
  value,
  onChange,
  className,
}: PhoneCodeSelectProps) {
  return (
    <select
      className={className}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {COUNTRY_CODES.map(c => (
        <option key={c.code} value={c.code}>
          {c.country.split(' ')[0]} {c.code}
        </option>
      ))}
    </select>
  );
});
