// src/components/TopBeaches.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { getTopBeachesData } from '../api/topbeaches.api';

const TopBeaches: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchTopBeaches = async () => {
      try {
        const response = await getTopBeachesData();
        if (response) {
          setHtmlContent(response);
        } else {
          setError('No top beaches information available.');
        }
      } catch (err) {
        setError('Failed to load top beaches information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBeaches();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  if (error) {
    return <Text style={{ padding: 20, color: 'red' }}>{error}</Text>;
  }

  if (!htmlContent) {
    return <Text style={{ padding: 20 }}>No top beaches information available.</Text>;
  }

  return (
    <ScrollView style={{ padding: 0 }}>
      <RenderHTML contentWidth={width} source={{ html: htmlContent }} />
    </ScrollView>
  );
};

export default TopBeaches;
