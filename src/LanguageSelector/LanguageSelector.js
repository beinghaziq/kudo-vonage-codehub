import React from 'react';
import './LanguageSelector.scss';
import Select, { components } from 'react-select';
import Headphones from '../assets/Headphone.svg';

// eslint-disable-next-line react/prop-types
export const LanguageSelector = ({ setSelectedLanguage, predefinedLanguages, setLanguageTooltip }) => {
  const handleChange = (selectedOption) => {
    setSelectedLanguage(selectedOption);
  };
  const CustomPlaceholder = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img className="w-4 h-4" src={Headphones} style={{ width: 36 }} alt="headphone" /> <span>Listening language</span>
    </div>
  );
  return (
    <Select
      placeholder={<CustomPlaceholder />}
      options={predefinedLanguages}
      onChange={handleChange}
      onFocus={() => setLanguageTooltip(false)}
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          width: '13.9375rem',
          height: '1.5rem',
          borderRadius: '0.75rem',
          border: '2px solid #075985',
          boxShadow: 'none',
          ':hover': {
            border: '2px solid #075985',
            boxShadow: 'none',
          },
        }),

        valueContainer: (baseStyles) => ({
          ...baseStyles,
          width: '10rem',
          padding: '2px',
        }),
      }}
    />
  );
};
