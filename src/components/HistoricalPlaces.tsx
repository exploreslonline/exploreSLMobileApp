import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import {getHistoricalData} from '../api/historical.api';

const HistoricalPlaces: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {width} = useWindowDimensions();

  useEffect(() => {
    const fetchHistoricalInfo = async () => {
      try {
        const response: any = await getHistoricalData();
        if (response) {
          setHtmlContent(response);
        } else {
          setError('No historical places information available.');
        }
      } catch (err) {
        setError('Failed to load historical places information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalInfo();
    console.log('Fetching historical places...', htmlContent);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{marginTop: 20}} />;
  }

  if (error) {
    return <Text style={{padding: 20, color: 'red'}}>{error}</Text>;
  }

  if (!htmlContent) {
    return <Text style={{padding: 20}}>No historical places information available.</Text>;
  }

  return (
    <ScrollView style={{padding: 0}}>
      <RenderHTML contentWidth={width} source={{html: htmlContent}} />
    </ScrollView>
  );
};

export default HistoricalPlaces;
