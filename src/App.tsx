import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import SplashScreen from './screens/SplashScreen';
import Home from './screens/Home';
import Details from './screens/Details';
import DialogScreen from './screens/DialogScreen';
import MobitelScreen from './screens/MobitelScreen';
import AllOffersScreen from './screens/AllOffersScreen';
import BusinessDetailScreen from './screens/BusinessDetailScreen';
import colors from './styles/colors';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.beachBlue} 
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}>
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen 
            name="Home" 
            component={Home}
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen 
            name="Details" 
            component={Details}
          />
          <Stack.Screen 
            name="DialogScreen" 
            component={DialogScreen}
          />
          <Stack.Screen 
            name="MobitelScreen" 
            component={MobitelScreen}
          />
          <Stack.Screen 
            name="AllOffers" 
            component={AllOffersScreen}
            options={{
              title: 'All Offers',
            }}
          />
          <Stack.Screen 
            name="BusinessDetail" 
            component={BusinessDetailScreen}
            options={{
              title: 'Business Details',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;