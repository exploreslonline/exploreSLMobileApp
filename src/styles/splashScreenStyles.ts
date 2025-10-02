import { StyleSheet } from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.beachBlue,
  },
  image: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'thin',
    color: colors.white,
  },
  boldText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default styles;