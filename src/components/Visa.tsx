import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import {getVisaData} from '../api/visa.api';

const VisaInfo: React.FC = () => {
  const [visaHTML, setVisaHTML] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {width} = useWindowDimensions();

  useEffect(() => {
    const fetchVisaInfo = async () => {
      try {
        const response: any = await getVisaData();
        if (response) {
          setVisaHTML(response);
        } else {
          setError('No visa information available.');
        }
      } catch (err) {
        setError('Failed to load visa information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisaInfo();
    console.log('Fetching visa information...', visaHTML);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{marginTop: 40}} />;
  }

  if (error) {
    return <Text style={{padding: 20, color: 'red'}}>{error}</Text>;
  }

  if (!visaHTML) {
    return <Text style={{padding: 20}}>No visa information available.</Text>;
  }

  return (
    <ScrollView style={{padding: 0}}>
      <RenderHTML contentWidth={width} source={{html: visaHTML}} />
    </ScrollView>
  );
};

export default VisaInfo;
