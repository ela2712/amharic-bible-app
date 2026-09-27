import { StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import BibleScreen from '../screens/BibleScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedScreen from '../screens/SavedScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlansScreen from '../screens/PlansScreen';
import PlanDetailScreen from '../screens/PlanDetailScreen';
import VerseImageScreen from '../screens/VerseImageScreen';
import { useAppTheme } from '../theme/ThemeContext';
import { useStudy } from '../context/StudyContext';
import type {
  BibleStackParamList,
  PlansStackParamList,
  RootTabParamList,
  SavedStackParamList,
  SearchStackParamList,
  SettingsStackParamList,
} from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();
const BibleStack = createNativeStackNavigator<BibleStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const PlansStack = createNativeStackNavigator<PlansStackParamList>();
const SavedStack = createNativeStackNavigator<SavedStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function BibleStackNavigator() {
  const colors = useAppTheme();
  return (
    <BibleStack.Navigator
      screenOptions={{
        headerTintColor: colors.accent,
        headerStyle: { backgroundColor: colors.header },
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.readerBackground },
      }}
    >
      <BibleStack.Screen
        name="BibleReader"
        component={BibleScreen}
        options={{ headerShown: false }}
      />
      <BibleStack.Screen
        name="VerseImage"
        component={VerseImageScreen}
        options={{ title: 'የጥቅስ ምስል' }}
      />
    </BibleStack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={SearchScreen} />
    </SearchStack.Navigator>
  );
}

function PlansStackNavigator() {
  const colors = useAppTheme();
  return (
    <PlansStack.Navigator
      screenOptions={{
        headerTintColor: colors.accent,
        headerStyle: { backgroundColor: colors.header },
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <PlansStack.Screen name="PlansMain" component={PlansScreen} options={{ headerShown: false }} />
      <PlansStack.Screen name="PlanDetail" component={PlanDetailScreen} options={{ title: 'ዕቅድ' }} />
    </PlansStack.Navigator>
  );
}

function SavedStackNavigator() {
  return (
    <SavedStack.Navigator screenOptions={{ headerShown: false }}>
      <SavedStack.Screen name="SavedMain" component={SavedScreen} />
    </SavedStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

export function RootNavigator() {
  const colors = useAppTheme();
  const { settings } = useStudy();
  const navTheme = settings.theme === 'light' || settings.theme === 'sepia' ? DefaultTheme : DarkTheme;

  return (
    <NavigationContainer
      theme={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background: colors.background,
          card: colors.tabBar,
          text: colors.text,
          border: colors.border,
          primary: colors.accent,
        },
      }}
    >
      <Tab.Navigator
        initialRouteName="BibleTab"
        backBehavior="history"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 54,
            paddingTop: 2,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              BibleTab: focused ? 'book' : 'book-outline',
              SearchTab: focused ? 'search' : 'search-outline',
              PlansTab: focused ? 'calendar' : 'calendar-outline',
              SavedTab: focused ? 'bookmark' : 'bookmark-outline',
              SettingsTab: focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="BibleTab"
          component={BibleStackNavigator}
          options={{ title: 'መጽሐፍ', tabBarAccessibilityLabel: 'መጽሐፍ ቅዱስ' }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchStackNavigator}
          options={{ title: 'ፍለጋ', tabBarAccessibilityLabel: 'ፍለጋ' }}
        />
        <Tab.Screen
          name="PlansTab"
          component={PlansStackNavigator}
          options={{ title: 'ዕቅድ', tabBarAccessibilityLabel: 'የንባብ ዕቅዶች' }}
        />
        <Tab.Screen
          name="SavedTab"
          component={SavedStackNavigator}
          options={{ title: 'የተቀመጡ', tabBarAccessibilityLabel: 'የተቀመጡ' }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStackNavigator}
          options={{ title: 'ተጨማሪ', tabBarAccessibilityLabel: 'ተጨማሪ' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
