// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Details: {title: string; selector?: string};
  SplashScreen: undefined;
  LocationScreen: undefined;
  DialogScreen: undefined;
  MobitelScreen: undefined;
  // New MongoDB screens
  AllOffers: undefined;
  BusinessDetail: {businessId: string; businessName: string};
  TestSetup: undefined;
  // other routes...
};