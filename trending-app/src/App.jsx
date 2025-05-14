import React, { useState, useEffect, useRef } from "react";
import { mockRestaurantData } from "./mockData";
import { useChromeStorage } from "./useChromeStorage";
import LocationInput from "./LocationInput";
import styles from "./App.module.css";
import { FaSpinner } from "react-icons/fa";

function App() {
  // State to hold restaurant data
  const [restaurantData, setRestaurantData] = useState(null);
  // State to track loading status
  const [isLoading, setIsLoading] = useState(false);
  // State to track errors
  const [error, setError] = useState(null);
  // State to track the current location input
  const [currentLocation, setCurrentLocation] =
    useChromeStorage("address", "testing") || useState("");
  const isFirstRun = useRef(true);

  const [name, setName] = useChromeStorage("name", "testing") || useState("");

  // Effect to load mock data on initial render
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false; // Skip the first run
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getData(name, currentLocation);
        if (data) {
          setRestaurantData(data);
        } else {
          setError("No data found for the specified location.");
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        setError("Failed to fetch restaurant data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (name || currentLocation) {
      fetchData();
    }
  }, [name, currentLocation]);

  //Function for getting Server Data
  async function getData(name, address) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/getData?name=${encodeURIComponent(
          name
        )}&address=${encodeURIComponent(address)}`
      );

      if (!response.ok) {
        // Log raw response text for better debugging
        const errorText = await response.text();
        console.error("Server responded with error HTML:", errorText);
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

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
          shorts: [],
        });
      } else {
        // Simulate successful data fetch
        setRestaurantData({
          ...mockRestaurantData,
          restaurantName: locationQuery,
        });
      }
      setIsLoading(false);
    }, 1000); // Simulate a delay for fetching
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles.appContainer}>
        {/* <LocationInput onSubmit={handleLocationSubmit} disabled={true} /> */}
        <div className={styles.loading}>
          Searching for {currentLocation}...
          <div>
            {" "}
            <FaSpinner className={styles.spinner} />
          </div>
        </div>
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
        <div className={styles.noItemsMessage}>
          Enter a location to see insights.
        </div>
      </div>
    );
  }

  // Render restaurant data
  return (
    <div className={styles.appContainer}>
      {restaurantData && (
        <>
          <h1 className={styles.panelTitle}>
            {name ? `${name} Details` : "Restaurant Details"}
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
          {/* Shorts Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Shorts</h2>
            {restaurantData.shorts && restaurantData.shorts.length > 0 ? (
              <div className={styles.videoList}>
                {restaurantData.shorts.map((videoId, index) => (
                  <a
                    key={`short-${index}`}
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.videoThumbnailLink}
                  >
                    <div className={styles.thumbnailWrapper}>
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt={`Short video ${index + 1}`}
                        className={styles.videoThumbnail}
                      />
                      <div className={styles.playIconOverlay}>▶</div>
                    </div>
                  </a>
                ))}
              </div>
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
