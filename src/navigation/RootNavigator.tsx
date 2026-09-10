import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
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
  HomeStackParamList,
  RootTabParamList,
  SavedStackParamList,
  SearchStackParamList,
  SettingsStackParamList,
} from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const BibleStack = createNativeStackNavigator<BibleStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const SavedStack = createNativeStackNavigator<SavedStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function HomeStackNavigator() {
  const colors = useAppTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerTintColor: colors.accent,
        headerStyle: { backgroundColor: colors.header },
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Plans" component={PlansScreen} options={{ title: 'የንባብ ዕቅዶች' }} />
      <HomeStack.Screen name="PlanDetail" component={PlanDetailScreen} options={{ title: 'ዕቅድ' }} />
    </HomeStack.Navigator>
  );
}

function BibleStackNavigator() {
  const colors = useAppTheme();
  return (
    <BibleStack.Navigator
      screenOptions={{
        headerTintColor: colors.accent,
        headerStyle: { backgroundColor: colors.header },
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
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
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            minHeight: 58,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              HomeTab: focused ? 'home' : 'home-outline',
              BibleTab: focused ? 'book' : 'book-outline',
              SearchTab: focused ? 'search' : 'search-outline',
              SavedTab: focused ? 'bookmark' : 'bookmark-outline',
              SettingsTab: focused ? 'settings' : 'settings-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'ቤት' }} />
        <Tab.Screen name="BibleTab" component={BibleStackNavigator} options={{ title: 'መጽሐፍ' }} />
        <Tab.Screen name="SearchTab" component={SearchStackNavigator} options={{ title: 'ፍለጋ' }} />
        <Tab.Screen name="SavedTab" component={SavedStackNavigator} options={{ title: 'የተቀመጡ' }} />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStackNavigator}
          options={{ title: 'ቅንብሮች' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
