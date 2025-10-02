import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getBroadbandData } from '../api/broadband.api';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

const Broadband: React.FC = () => {
  const [htmlContentList, setHtmlContentList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  // Use typed navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contents = await getBroadbandData();
        if (contents && contents.length > 0) {
          setHtmlContentList(contents);
        } else {
          setError('No broadband content available.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch broadband data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ padding: 20, color: 'red' }}>{error}</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <TouchableOpacity
        style={styles.tile}
        onPress={() => navigation.navigate('DialogScreen')}
      >
        <Text style={styles.tileText}>Dialog Broadband</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => navigation.navigate('MobitelScreen')}
      >
        <Text style={styles.tileText}>Mobitel Broadband</Text>
      </TouchableOpacity>

     
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#007bff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  tileText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Broadband;
