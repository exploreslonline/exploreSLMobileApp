import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { getLivingCostData } from '../api/livingCost.api';

const CostOfLiving: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {width} = useWindowDimensions();

  useEffect(() => {
    const fetchCostInfo = async () => {
      try {
        const content: any = await getLivingCostData();
        if (content) {
          setHtmlContent(content);
        } else {
          setError('No cost of living information available.');
        }
      } catch (err) {
        setError('Failed to load cost of living data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCostInfo();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{marginTop: 20}} />;
  }

  if (error) {
    return <Text style={{padding: 20, color: 'red'}}>{error}</Text>;
  }

  if (!htmlContent) {
    return <Text style={{padding: 20}}>No content available.</Text>;
  }

  return (
    <ScrollView style={{padding: 0}}>
      <RenderHTML contentWidth={width} source={{html: htmlContent}} />
    </ScrollView>
  );
};

export default CostOfLiving;
