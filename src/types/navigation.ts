import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import type { VerseRef } from './bible';

export type BibleStackParamList = {
  BibleReader:
    | {
        bookIndex?: number;
        chapterIndex?: number;
        verseIndex?: number;
      }
    | undefined;
  VerseImage: VerseRef;
};

export type SavedStackParamList = {
  SavedMain: undefined;
};

export type SearchStackParamList = {
  SearchMain: undefined;
};

export type PlansStackParamList = {
  PlansMain: undefined;
  PlanDetail: { planId: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
};

export type RootTabParamList = {
  BibleTab: NavigatorScreenParams<BibleStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  PlansTab: NavigatorScreenParams<PlansStackParamList>;
  SavedTab: NavigatorScreenParams<SavedStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList>,
  NativeStackNavigationProp<BibleStackParamList>
>;

export type BibleReaderRoute = RouteProp<BibleStackParamList, 'BibleReader'>;
