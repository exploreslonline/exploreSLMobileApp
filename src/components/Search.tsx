import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import colors from '../styles/colors';
import { searchQuery } from '../api/search.api';

interface SearchResult {
  page: string;
  section_title: string;
  field: string;
  matched_line: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleSearch = async (text: string) => {
    setQuery(text);

    if (text.trim() === '') {
      setFilteredResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchQuery(text);
      setFilteredResults(results);
    } catch (error) {
      console.error('Error during search:', error);
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 👉 This is the mapping logic to convert backend 'page' to selector
  const mapPageToSelector = (page: string): string => {
    const mapping: { [key: string]: string } = {
      visa: '.visa-info',
      transport: '.transport-info',
      top_places: '.destinations-info',
      destinations: '.destinations-info',
      food: '.food-info',
      beaches: '.beaches-info',
      historical: '.historical-info',
      tips: '.tips-info',
      network: '.network-info',
      currency: '.currency-info',
      weather: '.weather-info',
      emergency: '.emergency-info',
      health: '.health-info',
      'local-customs': '.local-customs-info',
      transportation: '.transportation-info',
      language: '.language-info',
      cultural: '.cultural-info',
      cost: '.cost-info',
      bookings: '.bookings-info',
    };

    return mapping[page] || ''; // return '' if not found
  };

  const handleNavigate = (item: SearchResult) => {
    const selector = mapPageToSelector(item.page);

    if (!selector) {
      console.warn('No selector found for page:', item.page);
      return;
    }

    setQuery('');
    setFilteredResults([]);

    navigation.dispatch(
      CommonActions.navigate({
        name: 'Details',
        params: {
          title: item.section_title,
          selector: selector,
        },
      })
    );
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    const title = item.section_title || item.matched_line || 'No Title';
    return (
      <TouchableOpacity onPress={() => handleNavigate(item)} style={styles.resultItem}>
        <Text style={styles.resultTitle}>{title}</Text>
        <Text style={styles.matchedLine}>{item.matched_line}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.searchWrapper}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor={colors.ash}
          value={query}
          onChangeText={handleSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => handleSearch(query)}>
          <Image source={require('../assets/search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {query.length > 0 && (
        <View style={styles.suggestionBox}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.beachBlue} />
          ) : filteredResults.length > 0 ? (
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={filteredResults}
              keyExtractor={(item, index) => item.page + index.toString()}
              renderItem={renderItem}
            />
          ) : (
            <Text style={styles.notFound}>No matching results</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.beachBlue,
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  searchIcon: {
    marginLeft: 10,
    height: 20,
    width: 20,
  },
  suggestionBox: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.beachBlue,
    maxHeight: 250,
    zIndex:200
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ash,
  },
  resultTitle: {
    fontSize: 16,
    color: colors.black,
    fontWeight: 'bold',
  },
  matchedLine: {
    fontSize: 14,
    color: colors.ash,
  },
  notFound: {
    textAlign: 'center',
    color: 'red',
    paddingVertical: 10,
  },
});

export default Search;
