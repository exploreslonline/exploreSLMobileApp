import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
  ScrollView,
} from 'react-native';
import { getDialogPackages } from '../api/dialog.api';
import { PackageItem } from '../api/types';
import Navbar from '../components/Navbar';

const DialogScreen: React.FC = () => {
  const [data, setData] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Group data by description
  const groupedData = data.reduce<Record<string, PackageItem[]>>((groups, item) => {
    if (!groups[item.description]) {
      groups[item.description] = [];
    }
    groups[item.description].push(item);
    return groups;
  }, {});

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packages = await getDialogPackages();
        setData(packages);
      } catch (err) {
        setError('Failed to fetch Dialog packages.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Render a single package row (days and price)
  const renderRow: ListRenderItem<PackageItem> = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cellCenter, styles.cellBorder]}>{item.days}</Text>
      <Text style={styles.cellRight}>LKR {item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Navbar />
      <Text style={styles.title}>Dialog Broadband Packages</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : data.length === 0 ? (
        <Text style={styles.infoText}>No packages available at the moment.</Text>
      ) : (
        <ScrollView>
          {Object.entries(groupedData).map(([description, packages]) => (
            <View key={description} style={styles.groupContainer}>
              <Text style={styles.groupTitle}>{description}</Text>
     
              <View style={[styles.row, styles.header]}>
                <Text style={[styles.cellCenter, styles.headerText, styles.cellBorder]}>Days</Text>
                <Text style={[styles.cellRight, styles.headerText]}>Price</Text>
              </View>

              <FlatList
                data={packages}
                keyExtractor={(item, index) => item.days + index}
                renderItem={renderRow}
                scrollEnabled={false} // disable inner scroll for better UX
              />
            </View>
          ))}
        </ScrollView>
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
  groupContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  header: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
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

export default DialogScreen;
