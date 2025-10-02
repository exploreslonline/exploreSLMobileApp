import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { getMobitelPackages } from '../api/mobitel.spi'; // make sure the import path is correct
import { PackageItem } from '../api/types';
import Navbar from '../components/Navbar';

const MobitelScreen: React.FC = () => {
  const [data, setData] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packages = await getMobitelPackages();
        setData(packages);
      } catch (err) {
        setError('Failed to fetch Mobitel packages.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const renderItem: ListRenderItem<PackageItem> = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.cellBorder]}>{item.description}</Text>
      <Text style={[styles.cellCenter, styles.cellBorder]}>{item.days}</Text>
      <Text style={styles.cellRight}>LKR {item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Navbar />
      <Text style={styles.title}>Mobitel Broadband Packages</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : data.length === 0 ? (
        <Text style={styles.infoText}>No packages available at the moment.</Text>
      ) : (
        <>
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.cell, styles.headerText, styles.cellBorder]}>Description</Text>
            <Text style={[styles.cellCenter, styles.headerText, styles.cellBorder]}>Days</Text>
            <Text style={[styles.cellRight, styles.headerText]}>Price</Text>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item, index) => String(item.days) + index}
            renderItem={renderItem}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: '#f2f2f2',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  header: {
    backgroundColor: '#28a745', // Green for Mobitel
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
  },
  headerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 6,
    borderRadius: 4,
    elevation: 1,
  },
  cell: {
    flex: 2,
    fontSize: 14,
    color: '#333',
    paddingRight: 8,
  },
  cellCenter: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 4,
  },
  cellRight: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
    color: '#333',
    paddingLeft: 8,
  },
  cellBorder: {
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 20,
  },
  infoText: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 20,
  },
});

export default MobitelScreen;
