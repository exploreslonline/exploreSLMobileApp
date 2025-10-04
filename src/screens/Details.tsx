import React from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Navbar from '../components/Navbar';
import colors from '../styles/colors';
import {RootStackParamList} from '../types/navigation';
import VisaInfo from '../components/Visa';
import Transport from '../components/Transport';
import HistoricalPlaces from '../components/HistoricalPlaces';
import TopPlaces from '../components/TopPlaces';
import LocationScreen from './LocationScreen'; // IMPORTANT: import LocationScreen here
import TopBeaches from '../components/TopBeaches';
import Broadband from '../components/Broadband';
import CostOfLiving from '../components/CostOfLiving';
import AllOffersScreen from './AllOffersScreen';

type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;

const Details: React.FC = () => {
  const route = useRoute<DetailsScreenRouteProp>();
  const {title, selector} = route.params;

  let Content: React.ReactNode;

  switch (selector) {
    case '.visa-info':
      Content = <VisaInfo />;
      break;
    case '.transport-info':
      Content = <Transport />;
      break;
    case '.destinations-info':
      Content = <TopPlaces />;
      break;
    case '.food-info':
      Content = <LocationScreen />;  // Render LocationScreen here
      break;
    case '.beaches-info':
      Content = <TopBeaches />;
      break;
    case '.historical-info':
      Content = <HistoricalPlaces />;
      break;
    case '.tips-info':
      Content = <Text>Travel tips & safety content goes here.</Text>;
      break;
    case '.network-info':
      Content = <Broadband />;
      break;
    case '.currency-info':
      Content = <Text>Currency exchange information content goes here.</Text>;
      break;
    case '.weather-info':
      Content = <AllOffersScreen/>;
      break;
    case '.emergency-info':
      Content = <Text>Emergency contact information content goes here.</Text>;
      break;
    case '.health-info':
      Content = <Text>Health and safety information content goes here.</Text>;
      break;
    case '.local-customs-info':
      Content = (
        <Text>Local customs and etiquette information content goes here.</Text>
      );
      break;
    case '.transportation-info':
      Content = <Text>Transportation information content goes here.</Text>;
      break;
    case '.language-info':
      Content = (
        <Text>Language and communication information content goes here.</Text>
      );
      break;
    case '.cultural-info':
      Content = <Text>Cultural information content goes here.</Text>;
      break;
    case '.cost-info':
      Content = <CostOfLiving />;
      break;
    case '.bookings-info':
      Content = <Text>Hotels and resots</Text>;
      break;
    default:
      Content = <Text>No information available.</Text>;
  }

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.content}>{Content}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: 20,
  },
});

export default Details;
