import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './src/screens/HomeScreen';
import BibleScreen from './src/screens/BibleScreen';
import SearchScreen from './src/screens/SearchScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'ቤት',
          }}
        />

        <Tab.Screen
          name="Bible"
          component={BibleScreen}
          options={{
            title: 'መጽሐፍ ቅዱስ',
          }}
        />

        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'ፍለጋ',
          }}
        />

        <Tab.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{
            title: 'የተመረጡ',
          }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'ቅንብሮች',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}