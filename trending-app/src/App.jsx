import React, { useState, useEffect } from 'react';
import { mockRestaurantData } from './mockData';
import LocationInput from './LocationInput';
import styles from './App.module.css';

function App() {
  // State to hold restaurant data
  const [restaurantData, setRestaurantData] = useState(null);
  // State to track loading status
  const [isLoading, setIsLoading] = useState(false);
  // State to track errors
  const [error, setError] = useState(null);
  // State to track the current location input
  const [currentLocation, setCurrentLocation] = useState("");

  // Effect to load mock data on initial render
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setRestaurantData(mockRestaurantData);
      setCurrentLocation(mockRestaurantData.restaurantName || "Featured Restaurant");
      setIsLoading(false);
    }, 500); // Simulate a delay for loading
  }, []);

  // Function to handle location input submission
  const handleLocationSubmit = (locationQuery) => {
    if (!locationQuery.trim()) {
      // Handle empty input
      setError("Please enter a location.");
      setRestaurantData(null);
      setCurrentLocation("");
      return;
    }

    console.log("Fetching data for:", locationQuery);
    setIsLoading(true);
    setError(null);
    setRestaurantData(null);
    setCurrentLocation(locationQuery);

    // Simulate fetching data with a delay
    setTimeout(() => {
      if (locationQuery.toLowerCase().includes("error")) {
        // Simulate an error scenario
        setError("Mock Error: Could not find info for " + locationQuery);
        setRestaurantData(null);
      } else if (locationQuery.toLowerCase().includes("empty")) {
        // Simulate an empty data scenario
        setRestaurantData({
          restaurantName: locationQuery,
          pros: [],
          cons: [],
          shorts: []
        });
      } else {
        // Simulate successful data fetch
        setRestaurantData({
          ...mockRestaurantData,
          restaurantName: locationQuery
        });
      }
      setIsLoading(false);
    }, 1000); // Simulate a delay for fetching
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles.appContainer}>
        <LocationInput onSubmit={handleLocationSubmit} disabled={true} />
        <div className={styles.loading}>Searching for {currentLocation}...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles.appContainer}>
        <LocationInput onSubmit={handleLocationSubmit} disabled={false} />
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  // Render initial state when no data is available
  if (!restaurantData) {
    return (
      <div className={styles.appContainer}>
        <LocationInput onSubmit={handleLocationSubmit} disabled={false} />
        <div className={styles.noItemsMessage}>Enter a location to see insights.</div>
      </div>
    );
  }

  // Render restaurant data
  return (
    <div className={styles.appContainer}>
      <LocationInput onSubmit={handleLocationSubmit} disabled={isLoading} />

      {restaurantData && (
        <>
          <h1 className={styles.panelTitle}>
            {restaurantData.restaurantName || "Restaurant Details"}
          </h1>

          {/* Pros Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Pros</h2>
            {restaurantData.pros && restaurantData.pros.length > 0 ? (
              <ul className={styles.list}>
                {restaurantData.pros.map((pro, index) => (
                  <li
                    key={`pro-${index}`}
                    className={`${styles.listItem} ${styles.proItem}`}
                  >
                    {pro}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noItemsMessage}>No pros listed.</p>
            )}
          </div>

          {/* Cons Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Cons</h2>
            {restaurantData.cons && restaurantData.cons.length > 0 ? (
              <ul className={styles.list}>
                {restaurantData.cons.map((con, index) => (
                  <li
                    key={`con-${index}`}
                    className={`${styles.listItem} ${styles.conItem}`}
                  >
                    {con}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noItemsMessage}>No cons listed.</p>
            )}
          </div>

          {/* Shorts Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Shorts</h2>
            {restaurantData.shorts && restaurantData.shorts.length > 0 ? (
              <ul className={styles.list}>
                {restaurantData.shorts.map((shortUrl, index) => (
                  <li key={`short-${index}`} className={styles.listItem}>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.shortLink}
                    >
                      Watch Short {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noItemsMessage}>No shorts available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
