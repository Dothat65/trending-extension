import React, { useState, useEffect } from 'react';
import { mockRestaurantData } from './mockData';
import styles from './App.module.css';

function App() {
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRestaurantData(mockRestaurantData);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>Loading data...</div>;
  }

  if (!restaurantData) {
    return <div className={styles.error}>No data available.</div>;
  }

  return (
    <div className={styles.appContainer}>
      <h1 className={styles.panelTitle}>
        {restaurantData.restaurantName || "Restaurant Details"}
      </h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Pros</h2>
        {restaurantData.pros && restaurantData.pros.length > 0 ? (
          <ul className={styles.list}>
            {restaurantData.pros.map((pro, index) => (
              <li key={`pro-${index}`} className={`${styles.listItem} ${styles.proItem}`}>
                {pro}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noItemsMessage}>No pros listed for this restaurant.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Cons</h2>
        {restaurantData.cons && restaurantData.cons.length > 0 ? (
          <ul className={styles.list}>
            {restaurantData.cons.map((con, index) => (
              <li key={`con-${index}`} className={`${styles.listItem} ${styles.conItem}`}>
                {con}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noItemsMessage}>No cons listed for this restaurant.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Shorts</h2>
        {restaurantData.shorts && restaurantData.shorts.length > 0 ? (
          <div className={styles.shortsGrid}>
            {restaurantData.shorts.map((shortUrl, index) => (
              <a
                key={`short-${index}`}
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shortLink}
              >
                Watch Short {index + 1}
              </a>
            ))}
          </div>
        ) : (
          <p className={styles.noItemsMessage}>No shorts available for this restaurant.</p>
        )}
      </div>
    </div>
  );
}

export default App;
