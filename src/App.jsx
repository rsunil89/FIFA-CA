import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MapSection from './components/MapSection';
import ExploreSection from './components/ExploreSection';
import RoutePlanner from './components/RoutePlanner';
import TravelTools from './components/TravelTools';
import Modal from './components/Modal';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorContainer from './components/ErrorContainer';
import { loadData } from './api/dataLoader';

function App() {
  const [appState, setAppState] = useState({
    loading: true,
    error: null,
    allData: [],
    filteredData: [],
    activeFilters: { type: 'all', country: 'all', search: '' },
    showStadiums: true,
    showHotels: true,
    showRestaurants: true,
    showAttractions: true,
    routeStops: []
  });

  useEffect(() => {
    async function init() {
      try {
        const data = await loadData();
        setAppState(prev => ({
          ...prev,
          loading: false,
          allData: data,
          filteredData: data
        }));
      } catch (err) {
        setAppState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load application data.'
        }));
      }
    }
    init();
  }, []);

  return (
    <>
      {appState.loading && <LoadingSpinner />}
      {appState.error && <ErrorContainer message={appState.error} />}

      <Header />
      <main>
        <HeroSection />
        <MapSection />
        <ExploreSection data={appState.filteredData} />
        <RoutePlanner />
        <TravelTools />
      </main>
      <Modal />
      <Footer />
    </>
  );
}

export default App;