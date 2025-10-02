import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { getTransportData } from '../api/transport.api';

const Transport: React.FC = () => {
  const [transportHTML, setTransportHTML] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {width} = useWindowDimensions();

  useEffect(() => {
    const fetchTransportInfo = async () => {
      try {
        const response: any = await getTransportData();
        if (response) {
          setTransportHTML(response);
        } else {
          setError('No transport information available.');
        }
      } catch (err) {
        setError('Failed to load transport information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransportInfo();
    console.log('Fetching transport information...', transportHTML);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{marginTop: 40}} />;
  }

  if (error) {
    return <Text style={{padding: 20, color: 'red'}}>{error}</Text>;
  }

  if (!transportHTML) {
    return <Text style={{padding: 20}}>No transport information available.</Text>;
  }

  return (
    <ScrollView style={{padding: 0}}>
      <RenderHTML contentWidth={width} source={{html: transportHTML}} />
    </ScrollView>
  );
};

export default Transport;
