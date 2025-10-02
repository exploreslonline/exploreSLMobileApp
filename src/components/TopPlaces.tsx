import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import {getTopPlacesData} from '../api/topplaces.api';

const TopPlaces: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {width} = useWindowDimensions();

  useEffect(() => {
    const fetchTopPlaces = async () => {
      try {
        const response: any = await getTopPlacesData();
        if (response) {
          setHtmlContent(response);
        } else {
          setError('No top places information available.');
        }
      } catch (err) {
        setError('Failed to load top places information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlaces();
    console.log('Fetching top places data...', htmlContent);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{marginTop: 40}} />;
  }

  if (error) {
    return <Text style={{padding: 20, color: 'red'}}>{error}</Text>;
  }

  if (!htmlContent) {
    return <Text style={{padding: 20}}>No top places information available.</Text>;
  }

  return (
    <ScrollView style={{padding: 0}}>
      <RenderHTML contentWidth={width} source={{html: htmlContent}} />
    </ScrollView>
  );
};

export default TopPlaces;
