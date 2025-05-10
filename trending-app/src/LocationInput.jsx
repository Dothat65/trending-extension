// trending-app/src/LocationInput.js
import React, { useState } from 'react';
import styles from './LocationInput.module.css';

function LocationInput({ onSubmit, disabled }) {
  const [locationQuery, setLocationQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); 
    onSubmit(locationQuery);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={locationQuery}
        onChange={(e) => setLocationQuery(e.target.value)}
        placeholder="Enter restaurant (for testing)"
        className={styles.inputField}
        disabled={disabled}
      />
      <button type="submit" className={styles.submitButton} disabled={disabled}>
        Get Info
      </button>
    </form>
  );
}

export default LocationInput;