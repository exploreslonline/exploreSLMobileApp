import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import colors from '../styles/colors';
import {RootStackParamList} from '../types/navigation';

interface MenuProps {
  isOpen: boolean;
  toggleDropdown: () => void;
}

const Menu: React.FC<MenuProps> = ({isOpen, toggleDropdown}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const menuItems = [
    {
      title: 'Visa & travel information',
      url: 'https://example.com/transport-info',
      selector: '.visa-info',
    },
    {
      title: 'Transportation information',
      url: 'https://example.com/transport-info',
      selector: '.transport-info',
    },
    {
      title: 'Top 10 destinations',
      url: 'https://example.com/top-destinations',
      selector: '.destinations-info',
    },
    {
      title: 'Food, dining & cafes near you',
      url: 'https://example.com/food-dining',
      selector: '.food-info',
    },
    {
      title: 'Top 5 beaches',
      url: 'https://example.com/top-beaches',
      selector: '.beaches-info',
    },
    {
      title: 'Historical sites',
      url: 'https://example.com/historical-sites',
      selector: '.historical-info',
    },
    {
      title: 'Travel tips & safety',
      url: 'https://example.com/travel-tips',
      selector: '.tips-info',
    },
    {
      title: 'Mobile network & wifi',
      url: 'https://example.com/mobile-network',
      selector: '.network-info',
    },
    {
      title: 'Cost of living',
      url: 'https://example.com/cost-of-living',
      selector: '.cost-info',
    },
    {
      title: 'Travel bookings & trains',
      url: 'https://example.com/travel-bookings',
      selector: '.bookings-info',
    },
  ];

  const handleMenuItemPress = (item: {
    title: string;
    url: string;
    selector: string;
  }) => {
    toggleDropdown();
    try {
      // Always navigate to Details with title and selector
      navigation.navigate('Details', {
        title: item.title,
        selector: item.selector,
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="slide"
      onRequestClose={toggleDropdown}>
      <TouchableWithoutFeedback onPress={toggleDropdown}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <TouchableOpacity onPress={toggleDropdown} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Close</Text>
          <Image
            source={require('../assets/cancel.png')}
            style={styles.cancelImage}
          />
        </TouchableOpacity>
        <View style={styles.menuItemsContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item)}>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Image
                source={require('../assets/rightArrow.png')}
                style={styles.arrowImage}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    width: Dimensions.get('window').width,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: colors.black,
    borderRadius: 50,
  },
  cancelImage: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  cancelText: {
    fontSize: 16,
    color: colors.black,
  },
  menuItemsContainer: {
    marginTop: 50,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.black,
  },
  arrowImage: {
    width: 20,
    height: 20,
  },
});

export default Menu;
