import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../styles/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation'; // use your actual type file

interface GridItem {
  title: string;
  selector: string;
  icon?: string; // Added optional icon property
  subtitle?: string; // Added optional subtitle property
}

interface GridViewProps {
  items: GridItem[];
  onItemPress: (item: GridItem) => void;
}

const GridView: React.FC<GridViewProps> = ({ items, onItemPress }) => {
  return (
    <View style={styles.gridContainer}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.gridItem}
          onPress={() => onItemPress(item)}
        >
          {/* Display icon if available */}
          {item.icon && (
            <Text style={styles.gridIcon}>{item.icon}</Text>
          )}
          
          {/* Main title */}
          <Text style={styles.gridItemText}>{item.title}</Text>
          
          {/* Display subtitle if available */}
          {item.subtitle && (
            <Text style={styles.gridSubtitle}>{item.subtitle}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1.8,
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10, // Added padding for better spacing
    shadowColor: '#000', // Added shadow for better appearance
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gridIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  gridItemText: {
    color: colors.black,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 15,
  },
  gridSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default GridView;